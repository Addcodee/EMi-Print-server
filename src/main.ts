import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    const PORT = process.env.PORT || 5000;
    await app.listen(PORT, () => console.log(`SERVER STARTED ON PORT = ${PORT}`));
}
bootstrap();
