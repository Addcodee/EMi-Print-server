import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { UserService } from '@user/user.service';
import { Tokens } from './interfaces';
import { compareSync } from 'bcrypt';
import { Token, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@prisma/prisma.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export default class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly prismaService: PrismaService,
    ) {}

    async signUp(dto: RegisterDto) {
        const user: User = await this.userService.findOne(dto.phoneNumber).catch((err) => {
            this.logger.error(err);
            return null;
        });

        if (user) throw new ConflictException(`Пользователь с такими данными уже существует ${JSON.stringify(dto)}`);

        return this.userService.save(dto).catch((err) => {
            this.logger.error(err);
            return null;
        });
    }

    async signIn(dto: LoginDto, agent: string): Promise<Tokens> {
        const user: User = await this.userService.findOne(dto.phoneNumber).catch((err) => {
            this.logger.error(err);
            return null;
        });

        if (!user || !compareSync(dto.password, user.password))
            throw new UnauthorizedException('Такого пользователя не существует или неправильный пароль');

        return this.generateTokens(user, agent);
    }

    async refreshTokens(refreshToken: string, agent: string): Promise<Tokens> {
        const token = await this.prismaService.token.findUnique({
            where: { token: refreshToken },
        });

        if (!token) throw new UnauthorizedException();

        await this.prismaService.token.delete({
            where: { token: refreshToken },
        });

        if (new Date(token.exp) < new Date()) throw new UnauthorizedException();

        const user = await this.userService.findOne(token.userId);

        return this.generateTokens(user, agent);
    }

    async deleteToken(token: string) {
        return this.prismaService.token.delete({ where: { token } });
    }

    private async generateTokens(user: User, agent: string): Promise<Tokens> {
        const accessToken = this.jwtService.sign({
            id: user.id,
            phoneNumber: user.phoneNumber,
            roles: user.roles,
        });
        const refreshToken = await this.getRefreshToken(user.id, agent);

        return {
            accessToken,
            refreshToken,
        };
    }

    private async getRefreshToken(userId: string, agent: string): Promise<Token> {
        const _token = await this.prismaService.token.findFirst({
            where: { userId, userAgent: agent },
        });
        const token = _token?.token ?? '';
        return this.prismaService.token.upsert({
            where: {
                token: token,
            },
            update: {
                token: v4(),
                exp: add(new Date(), { months: 1 }),
            },
            create: {
                token: v4(),
                exp: add(new Date(), { months: 1 }),
                userId,
                userAgent: agent,
            },
        });
    }
}
