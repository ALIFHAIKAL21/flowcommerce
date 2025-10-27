// src/orders/orders.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Orders } from './orders.entity';
import { OrderItems } from './order-items.entity';
import { Products } from '../products/products.entity';
import { Users } from '../users/users.entity';
import { Carts } from '../carts/carts.entity';
import { UpdateOrderStatusDto } from './orders.dto';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Orders)
    private readonly ordersRepo: Repository<Orders>,

    @InjectRepository(OrderItems)
    private readonly orderItemsRepo: Repository<OrderItems>,

    @InjectRepository(Carts)
    private readonly cartsRepo: Repository<Carts>,

    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,

    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,

    private readonly paymentservice: PaymentService,
  ) {}

  async findAll(): Promise<Orders[]> {
    return this.ordersRepo.find({
      relations: ['items', 'items.product', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async findMine(userId: number): Promise<Orders[]> {
    return this.ordersRepo.find({
      where: { user: { id_user: userId } },
      relations: ['items', 'items.product', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id_order: number): Promise<Orders> {
    const order = await this.ordersRepo.findOne({
      where: { id_order },
      relations: ['items', 'items.product', 'user'],
    });
    if (!order) {
      throw new NotFoundException(`Order with id ${id_order} not found`);
    }
    return order;
  }

async checkout(userId: number): Promise<{ order: Orders; clientSecret: string }> {
  const user = await this.usersRepo.findOneBy({ id_user: userId });
  if (!user) throw new NotFoundException(`User with id ${userId} not found`);

  const cartItems = await this.cartsRepo.find({
    where: { user: { id_user: userId } },
    relations: ['product'],
  });
  if (cartItems.length === 0) {
    throw new BadRequestException('Your cart is empty');
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    let order = this.ordersRepo.create({
      user,
      status: 'pending',
      total_price: 0,
    });
    order = await queryRunner.manager.save(order);

    let grandTotal = 0;

    for (const cart of cartItems) {
      const product = await queryRunner.manager.findOne(Products, {
        where: { id_product: cart.product.id_product },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with id ${cart.product.id_product} not found`,
        );
      }

      if (product.stock < cart.quantity) {
        throw new BadRequestException(
          `Not enough stock for ${product.name} (requested ${cart.quantity}, stock ${product.stock})`,
        );
      }

      product.stock -= cart.quantity;
      await queryRunner.manager.save(product);

      const subtotal = Number(product.price) * Number(cart.quantity ?? 1);

      const item = this.orderItemsRepo.create({
        order,
        product,
        quantity: cart.quantity,
        subtotal,
      });
      await queryRunner.manager.save(item);

      grandTotal += subtotal;
    }

    order.total_price = grandTotal;
    await queryRunner.manager.save(order);

    await queryRunner.manager.delete(Carts, { user: { id_user: userId } });
    await queryRunner.commitTransaction();


    const paymentIntent = await this.paymentservice.createPaymentIntent(grandTotal);
    order.payment_intent_id = paymentIntent.id;
    await this.ordersRepo.save(order);


    return {
      order,
      clientSecret: paymentIntent.client_secret!
    };
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}


  async updateStatus(
    id_order: number,
    dto: UpdateOrderStatusDto,
  ): Promise<Orders> {
    const order = await this.findOne(id_order);
    order.status = dto.status;
    await this.ordersRepo.save(order);
    return this.findOne(id_order);
  }

  async remove(id_order: number): Promise<void> {
    const result = await this.ordersRepo.delete(id_order);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with id ${id_order} not found`);
    }
  }

  async findByPaymentIntent(paymentIntentId: string) {
  return this.ordersRepo.findOne({ where: { payment_intent_id: paymentIntentId } });
}

async refundOrder(id_order: number): Promise<Orders> {
  const order = await this.findOne(id_order);

  if (order.status !== 'paid') {
    throw new BadRequestException('Only paid orders can be refunded');
  }

  if (!order.payment_intent_id) {
    throw new BadRequestException('No payment intent found for this order');
  }

  const refund = await this.paymentservice.refundPayment(order.payment_intent_id);

  order.status = 'refunded';
  order.refund_id = refund.id;
  order.refunded_at = new Date();

  await this.ordersRepo.save(order);

  return order;
}


async save(order: Orders) {
  return this.ordersRepo.save(order);
}

}
