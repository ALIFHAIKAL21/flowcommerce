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
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Orders } from './orders.entity';
import { CreateOrderDto, UpdateOrderDto } from './orders.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}


  @Get()
  @Roles('admin')
  findAll(): Promise<Orders[]> {
    return this.ordersService.findAll();
  }

  @Get(':id_order')
  async findOne(@Param('id_order') id_order: number): Promise<Orders> {
    const order = await this.ordersService.findOne(id_order);
    if (!order) {
      throw new NotFoundException(`Order with id ${id_order} not found`);
    }
    return order;
  }

  
  @Post()
  @Roles('customer', 'admin')
  create(@Body() dto: CreateOrderDto): Promise<Orders> {
    return this.ordersService.create(dto);
  }

 
  @Put(':id_order')
  @Roles('admin')
  async update(
    @Param('id_order') id_order: number,
    @Body() dto: UpdateOrderDto,
  ): Promise<Orders> {
    const updated = await this.ordersService.update(id_order, dto);
    if (!updated) {
      throw new NotFoundException(`Order with id ${id_order} not found`);
    }
    return updated;
  }

 
  @Delete(':id_order')
  @Roles('admin')
  remove(@Param('id_order') id_order: number): Promise<void> {
    return this.ordersService.remove(id_order);
  }
}
