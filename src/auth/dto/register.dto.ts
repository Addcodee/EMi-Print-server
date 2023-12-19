import { IsPasswordsMatchingConstraint } from '@common/decorators';
import { IsEmail, IsString, MinLength, Validate } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    phoneNumber: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @MinLength(6)
    @Validate(IsPasswordsMatchingConstraint)
    passwordConfirm: string;
}
