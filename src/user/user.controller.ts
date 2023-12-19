import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    createUser(@Body() dto) {
        return this.userService.save(dto);
    }

    @Get(':idOrNumber')
    findOneUser(@Param('idOrNumber') idOrNumber: string) {
        return this.userService.findOne(idOrNumber);
    }

    @Get()
    findAllUsers() {
        return this.userService.findAll();
    }

    @Delete(':id')
    deleteUser(@Param('id', ParseUUIDPipe) id: string) {
        return this.userService.delete(id);
    }
}
