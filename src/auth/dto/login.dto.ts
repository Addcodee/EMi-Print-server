import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
    @IsString()
    @ApiProperty({ example: '000555000', description: 'Номер телефона' })
    phoneNumber?: string;

    @IsEmail()
    @ApiProperty({ example: 'example@gmail.com', description: 'Почтовый адрес' })
    email?: string;

    @IsString()
    @ApiProperty({ example: '123456', description: 'Пароль' })
    password: string;
}
