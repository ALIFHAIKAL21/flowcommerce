
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
  user: { userId: number; role: string };
}

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }



  @Get('me')
  findMine(@Req() req: AuthRequest) {
    return this.ordersService.findMine(req.user.userId);
  }


  @Get(':id_order')
  findOne(@Param('id_order') id_order: number) {
    return this.ordersService.findOne(id_order);
  }

  @Post('checkout')
  @Roles('customer', 'admin')
  checkout(@Req() req: AuthRequest) {
    return this.ordersService.checkout(req.user.userId);
  }


  @Put(':id_order/status')
  @Roles('admin')
  updateStatus(
    @Param('id_order') id_order: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id_order, dto);
  }



  @Delete(':id_order')
  @Roles('admin')
  remove(@Param('id_order') id_order: number) {
    return this.ordersService.remove(id_order);
  }
}
