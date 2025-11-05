import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './users.entity';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users) private usersRepo: Repository<Users>,
    ) { }

    // Get All Users
    findAll(): Promise<Users[]> {

        return this.usersRepo.find();
    }

    findOne(id_user: number): Promise<Users | null> {
        return this.usersRepo.findOne({ where: { id_user } });
    }

// Find User by Username
    async findByUsername(username: string): Promise<Users | null> {
        return this.usersRepo.findOne({ where: { username } });
    }

    
    async create(dto: CreateUserDto): Promise<Users> {
        // Check if username already exists
        const exists = await this.usersRepo.findOne({ where: { username: dto.username } });
        if (exists) throw new ConflictException('Username already taken');

        const hashed = await bcrypt.hash(dto.password, 10);

        const user = this.usersRepo.create({
            username: dto.username,
            password: hashed,
            role: dto.role ?? 'customer',
        });

        return this.usersRepo.save(user);
    }

    // Update User
    async update(id_user: number, dto: UpdateUserDto): Promise<Users | null> {
        const partial: Partial<Users> = { ...dto };

        if (dto.password) {
            partial.password = await bcrypt.hash(dto.password, 10);
        }

        await this.usersRepo.update(id_user, partial);
        return this.findOne(id_user);
    }

    // Delete User
    async remove(id_user: number): Promise<void> {
        await this.usersRepo.delete(id_user);
    }
}
