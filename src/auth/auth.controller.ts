import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import AuthService from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Tokens } from './interfaces';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie, CurrentUser, UserAgent } from '@common/decorators';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserResponse } from '@user/responses';

const REFRESH_TOKEN = 'refreshToken';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @Post('sign-up')
    async signUp(@Body() dto: RegisterDto) {
        const user = await this.authService.signUp(dto);

        if (!user) throw new BadRequestException(`Не удается создать пользователя с данными ${JSON.stringify(dto)}`);

        return new UserResponse(user);
    }

    @Post('sign-in')
    async signIn(@Body() dto: LoginDto, @Res() res: Response, @Req() req: Request, @UserAgent() agent: string) {
        const tokens = await this.authService.signIn(dto, agent);
        if (!tokens) throw new BadRequestException(`Не удалость войти с данными ${JSON.stringify(dto)}`);

        this.setRefreshTokenToCookies(tokens, res);
    }

    @UseGuards(JwtAuthGuard)
    @Get('refresh-tokens')
    async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() agent: string) {
        if (!refreshToken) throw new UnauthorizedException();

        const tokens = await this.authService.refreshTokens(refreshToken, agent);

        if (!tokens) throw new UnauthorizedException();

        this.setRefreshTokenToCookies(tokens, res);
    }

    @UseGuards(JwtAuthGuard)
    @Get('sign-out')
    async signOut(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response) {
        if (!refreshToken) {
            res.sendStatus(HttpStatus.OK);
            return;
        }

        await this.authService.deleteToken(refreshToken);
        res.cookie(REFRESH_TOKEN, '', {
            httpOnly: true,
            secure: true,
            expires: new Date(),
        });

        res.sendStatus(HttpStatus.OK);
    }

    private setRefreshTokenToCookies(tokens: Tokens, res: Response) {
        if (!tokens) throw new UnauthorizedException();

        res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(tokens.refreshToken.exp),
            secure: this.configService.get('NODE_ENV', 'development') === 'production',
            path: '/',
        });

        return res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
    }
}
