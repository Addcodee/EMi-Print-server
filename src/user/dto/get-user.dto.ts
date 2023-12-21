import { ArrayMinSize, IsArray, IsEmail, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserDto {
    @ApiProperty({ example: 1, description: 'Уникальный идентификатор' })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: '2023-11-14 19:09:01.25',
        description: 'Дата создания пользователя',
    })
    @IsString()
    created_at: Date;

    @ApiProperty({
        example: '2023-11-14 19:09:01.25',
        description: 'Дата обновления пользователя',
    })
    @IsString()
    updated_at: Date;

    @ApiProperty({ example: 'EMi Print', description: 'Название компании' })
    @IsString()
    companyName: string;

    @ApiProperty({ example: 'John', description: 'Имя пользователя' })
    @IsString()
    @MinLength(2)
    @MaxLength(16)
    name: string;

    @ApiProperty({ example: 'Watson', description: 'Фамилия пользователя' })
    @IsString()
    @MinLength(2)
    @MaxLength(20)
    last_name: string;

    @ApiProperty({
        example: 'example@mail.com',
        description: 'Почтовый адрес пользователя',
    })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'img.jpg', description: 'Изображение пользователя' })
    @IsString()
    avatar?: string;

    @ApiProperty({
        example: '000555000',
        description: 'Номер телефона пользователя',
    })
    @IsString()
    phoneNumber: string;

    @ApiProperty({
        example: ['ADMIN'],
        description: 'Роли пользователя',
    })
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    roles: string[];
}
