import {
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponse } from './responses';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators';
import { JwtPayload } from '@auth/interfaces';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteDto, GetUserDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
@ApiTags('Пользователи')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Достать пользователя' })
    @ApiResponse({ status: 200, type: GetUserDto })
    @Get(':idOrNumberOrEmail')
    async findOneUser(@Param('idOrNumberOrEmail') idOrNumberOrEmail: string) {
        const user = await this.userService.findOne(idOrNumberOrEmail);
        return new UserResponse(user);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Достать всех пользователей' })
    @ApiResponse({ status: 200, type: [GetUserDto] })
    @Get()
    async findAllUsers() {
        const users = await this.userService.findAll();

        return users.map((user) => new UserResponse(user));
    }

    @ApiOperation({ summary: 'Удалить пользователя' })
    @ApiResponse({ status: 200, type: DeleteDto })
    @Delete(':id')
    async deleteUser(@Param('id', ParseUUIDPipe) userId: string, @CurrentUser() user: JwtPayload) {
        return await this.userService.delete(userId, user);
    }
}
