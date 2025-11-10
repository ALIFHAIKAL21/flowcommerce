import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Carts } from './carts.entity';
import { CreateCartDto, UpdateCartDto } from './carts.dto';
import { Products } from '../products/products.entity';
import { Users } from '../users/users.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Carts)
    private cartsRepo: Repository<Carts>,
    @InjectRepository(Products)
    private productsRepo: Repository<Products>,
    @InjectRepository(Users)
    private usersRepo: Repository<Users>,
  ) {}

  // 🔍 Get All Carts (Admin Only)
  async findAll(): Promise<Carts[]> {
    return this.cartsRepo.find({
      relations: ['user', 'product'],
      order: { created_at: 'DESC' },
    });
  }

  // 🔍 Get Cart by ID
  async findOne(id_cart: number): Promise<Carts | null> {
    return this.cartsRepo.findOne({
      where: { id_cart },
      relations: ['user', 'product'],
    });
  }

  // ➕ Create New Cart (userId otomatis dari JWT)
  async create(userId: number, dto: CreateCartDto): Promise<Carts> {
    const user = await this.usersRepo.findOneBy({ id_user: userId });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const product = await this.productsRepo.findOneBy({
      id_product: dto.productId,
    });
    if (!product)
      throw new NotFoundException(
        `Product with id ${dto.productId} not found`,
      );

    if (product.stock < (dto.quantity ?? 1)) {
      throw new BadRequestException(`Not enough stock for ${product.name}`);
    }

    // 🛒 Cek apakah produk sudah ada di cart user
    const existingCart = await this.cartsRepo.findOne({
      where: {
        user: { id_user: userId },
        product: { id_product: dto.productId },
      },
      relations: ['user', 'product'],
    });

    if (existingCart) {
      existingCart.quantity += dto.quantity ?? 1;
      existingCart.total_price = Number(product.price) * existingCart.quantity;
      return this.cartsRepo.save(existingCart);
    }

    // 🆕 Buat cart baru
    const cart = this.cartsRepo.create({
      user,
      product,
      quantity: dto.quantity ?? 1,
      total_price: Number(product.price) * (dto.quantity ?? 1),
    });

    return this.cartsRepo.save(cart);
  }

  // ✏️ Update Cart
  async update(id_cart: number, dto: UpdateCartDto): Promise<Carts | null> {
    const cart = await this.cartsRepo.findOne({
      where: { id_cart },
      relations: ['product'],
    });
    if (!cart) throw new NotFoundException(`Cart with id ${id_cart} not found`);

    if (dto.quantity !== undefined) {
      if (cart.product.stock < dto.quantity) {
        throw new BadRequestException(`Not enough stock for ${cart.product.name}`);
      }
      cart.quantity = dto.quantity;
    }

    cart.total_price = Number(cart.product.price) * cart.quantity;
    await this.cartsRepo.save(cart);
    return this.findOne(id_cart);
  }

  // ❌ Delete Cart by ID
  async remove(id_cart: number): Promise<void> {
    const result = await this.cartsRepo.delete(id_cart);
    if (result.affected === 0) {
      throw new NotFoundException(`Cart with id ${id_cart} not found`);
    }
  }

  // 🧹 Clear Cart for Logged-in User
  async clearUserCart(userId: number): Promise<void> {
  await this.cartsRepo
    .createQueryBuilder()
    .delete()
    .from('carts')
    .where('"userIdUser" = :userId', { userId })
    .execute();
}

}
