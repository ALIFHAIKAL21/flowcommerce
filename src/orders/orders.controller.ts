import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateOrderStatusDto } from './orders.dto';
import type { Request } from 'express';

interface AuthRequest extends Request {
  user: { id_user: number; role: string }; // ✅ ubah dari userId → id_user
}

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Get All Orders
  @Get()
  @Roles('admin')
  findAll() {
    return this.ordersService.findAll();
  }

  // Get Orders of Logged-in User
  @Get('me')
  findMine(@Req() req: AuthRequest) {
    return this.ordersService.findMine(req.user.id_user); // ✅ fix
  }

  // Get Order by ID
  @Get(':id_order')
  findOne(@Param('id_order') id_order: number) {
    return this.ordersService.findOne(id_order);
  }

  // Checkout - Create Order from Cart
  @Post('checkout')
  @Roles('customer', 'admin')
  checkout(@Req() req: AuthRequest) {
    return this.ordersService.checkout(req.user.id_user); // ✅ fix
  }

  // Update Order Status
  @Put(':id_order/status')
  @Roles('admin')
  updateStatus(
    @Param('id_order') id_order: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id_order, dto);
  }

  // Delete Order
  @Delete(':id_order')
  @Roles('admin')
  remove(@Param('id_order') id_order: number) {
    return this.ordersService.remove(id_order);
  }
  
}
