import {
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponse } from './responses';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':idOrNumber')
    async findOneUser(@Param('idOrNumber') idOrNumber: string) {
        const user = await this.userService.findOne(idOrNumber);
        return new UserResponse(user);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    async findAllUsers() {
        const users = await this.userService.findAll();

        return users.map((user) => new UserResponse(user));
    }

    @Delete(':id')
    async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
        return await this.userService.delete(id);
    }
}
