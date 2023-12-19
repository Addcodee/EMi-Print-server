import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import AuthService from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Tokens } from './interfaces';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie } from '@common/decorators';

const REFRESH_TOKEN = 'refreshToken';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Post('sign-up')
    async signUp(@Body() dto: RegisterDto) {
        const user = await this.authService.signUp(dto);

        if (!user) throw new BadRequestException(`Не удается создать пользователя с данными ${JSON.stringify(dto)}`);

        return user;
    }

    @Post('sign-in')
    async signIn(@Body() dto: LoginDto, @Res() res: Response, @Req() req: Request) {
        const agent = req.headers['user-agent'];
        console.log(agent);
        const tokens = await this.authService.signIn(dto);
        if (!tokens) throw new BadRequestException(`Не удалость войти с данными ${JSON.stringify(dto)}`);

        this.setRefreshTokenToCookies(tokens, res);
    }

    @Get('refresh-tokens')
    async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response) {
        if (!refreshToken) throw new UnauthorizedException();

        const tokens = await this.authService.refreshTokens(refreshToken);

        if (!tokens) throw new UnauthorizedException();

        this.setRefreshTokenToCookies(tokens, res);
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
