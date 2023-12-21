import { JwtPayload } from '@auth/interfaces';
import { convertToSecondsUtil } from '@common/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { genSaltSync, hashSync } from 'bcrypt';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly configService: ConfigService,
    ) {}

    save(user: Partial<User>) {
        const hashedPassword = this.hashPassword(user.password);
        return this.prismaService.user.create({
            data: {
                name: '',
                lastName: '',
                phoneNumber: user.phoneNumber,
                email: user.email,
                password: hashedPassword,
                companyName: '',
                roles: user.email === 'admin@gmail.com' || user.phoneNumber === '999555000' ? ['ADMIN'] : ['USER'],
                avatar: '',
            },
        });
    }

    async findOne(idOrNumberOrEmail: string, isReset = false) {
        if (isReset) {
            this.cacheManager.del(idOrNumberOrEmail);
        }
        const user = await this.cacheManager.get<User>(idOrNumberOrEmail);
        if (!user) {
            const user = await this.prismaService.user.findFirst({
                where: {
                    OR: [{ id: idOrNumberOrEmail }, { phoneNumber: idOrNumberOrEmail }, { email: idOrNumberOrEmail }],
                },
            });

            if (!user) return null;

            const timeOutInSec = convertToSecondsUtil(this.configService.get('JWT_EXP'));

            await this.cacheManager.set(idOrNumberOrEmail, user, timeOutInSec);

            return user;
        }
        return user;
    }

    findAll() {
        return this.prismaService.user.findMany();
    }

    async delete(userId: string, user: JwtPayload) {
        if (user.id !== userId && !user.roles.includes(Role.ADMIN)) {
            throw new ForbiddenException();
        }
        await Promise.all([this.cacheManager.del(userId), this.cacheManager.del(user.phoneNumber)]);

        await this.cacheManager.del(userId);

        return this.prismaService.user.delete({ where: { id: userId }, select: { id: true } });
    }

    private hashPassword(password: string) {
        return hashSync(password, genSaltSync(10));
    }
}
