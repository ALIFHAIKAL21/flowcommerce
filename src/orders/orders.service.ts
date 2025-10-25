import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orders } from './orders.entity';
import { Products } from '../products/products.entity';
import { Users } from '../users/users.entity';
import { CreateOrderDto, UpdateOrderDto } from './orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private ordersRepo: Repository<Orders>,

    @InjectRepository(Products)
    private productsRepo: Repository<Products>,

    @InjectRepository(Users)
    private usersRepo: Repository<Users>,
  ) {}

  async findAll(): Promise<Orders[]> {
    return this.ordersRepo.find({
      relations: ['product', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id_order: number): Promise<Orders | null> {
    return this.ordersRepo.findOne({
      where: { id_order },
      relations: ['product', 'user'],
    });
  }

  async create(dto: CreateOrderDto): Promise<Orders> {
    const user = await this.usersRepo.findOneBy({ id_user: dto.userId });
    if (!user) throw new NotFoundException(`User with id ${dto.userId} not found`);

    const product = await this.productsRepo.findOneBy({ id_product: dto.productId });
    if (!product) throw new NotFoundException(`Product with id ${dto.productId} not found`);

    const order = this.ordersRepo.create({
      quantity: dto.quantity,
      total_price: dto.total_price,
      user,
      product,
    });

    return this.ordersRepo.save(order);
  }

  async update(id_order: number, dto: UpdateOrderDto): Promise<Orders | null> {
    const order = await this.ordersRepo.findOneBy({ id_order });
    if (!order) throw new NotFoundException(`Order with id ${id_order} not found`);

    Object.assign(order, dto);
    await this.ordersRepo.save(order);
    return this.findOne(id_order);
  }

  async remove(id_order: number): Promise<void> {
    const result = await this.ordersRepo.delete(id_order);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with id ${id_order} not found`);
    }
  }
}
