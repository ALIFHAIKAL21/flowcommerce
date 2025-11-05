import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto, UpdateCartDto } from './carts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { Request } from 'express';  

interface AuthRequest extends Request {
  user: { userId: number; role: string };
}

@Controller('carts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  // Get All Carts
  @Get()
  @Roles('admin')
  async findAll() {
    return this.cartsService.findAll();
  }

  // Get Carts of Logged-in User
  @Get('me')
  async findMyCart(@Req() req: AuthRequest) {
    const userId = req.user.userId;
    const cart = await this.cartsService.findAll();
    return cart.filter((item) => item.user.id_user === userId);
  }

  // Get Cart by ID
  @Get(':id_cart')
  async findOne(@Param('id_cart') id_cart: number) {
    const cart = await this.cartsService.findOne(id_cart);
    if (!cart) throw new NotFoundException(`Cart with id ${id_cart} not found`);
    return cart;
  }

  // Create New Cart
  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateCartDto) {
    const userId = req.user.userId;
    return this.cartsService.create({ ...dto, userId });
  }

  // Update Cart
  @Put(':id_cart')
  async update(@Param('id_cart') id_cart: number, @Body() dto: UpdateCartDto) {
    const updated = await this.cartsService.update(id_cart, dto);
    if (!updated) throw new NotFoundException(`Cart with id ${id_cart} not found`);
    return updated;
  }

  // Clear Logged-in User's Cart
@Delete('me/clear')
async clearMyCart(@Req() req: AuthRequest) {
  const userId = req.user.userId;
  await this.cartsService.clearUserCart(userId);
  return { message: 'Your cart has been cleared' };
}

// Delete Cart
  @Delete(':id_cart')
  async remove(@Param('id_cart') id_cart: number) {
    await this.cartsService.remove(id_cart);
    return { message: `Cart with id ${id_cart} removed successfully` };
  }
}
