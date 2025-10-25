import {
  Controller, Get, Post, Put, Delete, Body, Param, NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Users } from './users.entity';
import { CreateUserDto, UpdateUserDto } from './users.dto';

function stripPassword(u: Users): Omit<Users, 'password'> {
  const { password, ...safe } = u as any;
  return safe;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(): Promise<Array<Omit<Users, 'password'>>> {
    const list = await this.usersService.findAll();
    return list.map(stripPassword);
  }

  @Get(':id_user')
  async findOne(@Param('id_user') id_user: number): Promise<Omit<Users, 'password'>> {
    const user = await this.usersService.findOne(id_user);
    if (!user) throw new NotFoundException(`User with id ${id_user} not found`);
    return stripPassword(user);
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<Omit<Users, 'password'>> {
    const user = await this.usersService.create(dto);
    return stripPassword(user);
  }

  @Put(':id_user')
  async update(
    @Param('id_user') id_user: number,
    @Body() dto: UpdateUserDto,
  ): Promise<Omit<Users, 'password'>> {
    const updated = await this.usersService.update(id_user, dto);
    if (!updated) throw new NotFoundException(`User with id ${id_user} not found`);
    return stripPassword(updated);
  }

  @Delete(':id_user')
  remove(@Param('id_user') id_user: number): Promise<void> {
    return this.usersService.remove(id_user);
  }
}
