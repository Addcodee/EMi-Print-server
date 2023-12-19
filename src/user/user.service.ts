import { JwtPayload } from '@auth/interfaces';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    save(user: Partial<User>) {
        const hashedPassword = this.hashPassword(user.password);
        return this.prismaService.user.create({
            data: {
                name: 'Name',
                lastName: 'LastName',
                phoneNumber: user.phoneNumber,
                email: user.email,
                password: hashedPassword,
                companyName: '',
                roles: ['ADMIN'],
                avatar: '',
            },
        });
    }

    findOne(idOrNumber: string) {
        return this.prismaService.user.findFirst({
            where: { OR: [{ id: idOrNumber }, { phoneNumber: idOrNumber }] },
        });
    }

    findAll() {
        return this.prismaService.user.findMany();
    }

    delete(userId: string, user: JwtPayload) {
        if (user.id !== userId && !user.roles.includes(Role.ADMIN)) {
            throw new ForbiddenException();
        }

        return this.prismaService.user.delete({ where: { id: userId }, select: { id: true } });
    }

    private hashPassword(password: string) {
        return hashSync(password, genSaltSync(10));
    }
}
