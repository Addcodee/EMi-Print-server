import { IsPasswordsMatchingConstraint } from '@common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Validate } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsEmail()
    @ApiProperty({ example: 'example@gmail.com', description: 'Почтовый адрес' })
    email: string;

    @IsString()
    @ApiProperty({ example: '000555000', description: 'Номер телефона' })
    phoneNumber: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ example: '123456', description: 'Пароль' })
    password: string;

    @IsString()
    @MinLength(6)
    @Validate(IsPasswordsMatchingConstraint)
    @ApiProperty({ example: '123456', description: 'Пароль потверждения' })
    passwordConfirm: string;
}
