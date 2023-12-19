import { Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponse implements User {
    constructor(user: Partial<User>) {
        Object.assign(this, user);
    }

    id: string;
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    @Exclude()
    password: string;
    companyName: string;
    avatar: string;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
}
