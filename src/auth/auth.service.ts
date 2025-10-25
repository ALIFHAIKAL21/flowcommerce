import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/users.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // REGISTER
  async register(dto: CreateUserDto) {
    // cek username unik
    const existing = await this.usersService.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('Username already taken');
    }

    const user = await this.usersService.create(dto);

    const payload = { sub: user.id_user, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'User registered successfully',
      user: { id_user: user.id_user, username: user.username, role: user.role },
      access_token: token,
    };
  }

  // LOGIN
  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id_user, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      user: { id_user: user.id_user, username: user.username, role: user.role },
      access_token: token,
    };
  }
}
