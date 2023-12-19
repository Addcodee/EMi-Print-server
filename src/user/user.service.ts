import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    save(user: Partial<User>) {
        const hashedPassword = this.hashPassword(user.password);
        const hashedPasswordConfirm = this.hashPassword(user.passwordConfirm);
        return this.prismaService.user.create({
            data: {
                name: 'Name',
                lastName: 'LastName',
                phoneNumber: user.phoneNumber,
                email: '',
                password: hashedPassword,
                passwordConfirm: hashedPasswordConfirm,
                companyName: '',
                roles: ['USER'],
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

    delete(id: string) {
        return this.prismaService.user.delete({ where: { id } });
    }

    private hashPassword(password: string) {
        return hashSync(password, genSaltSync(10));
    }
}
