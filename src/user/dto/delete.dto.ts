import { ApiProperty } from '@nestjs/swagger';

export class DeleteDto {
    @ApiProperty({ example: '0fd09e18-cbfa-4e48-88b1-31863e3b9999', description: 'ID Пользователя' })
    id: string;
}
