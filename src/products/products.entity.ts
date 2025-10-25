import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Orders } from '../orders/orders.entity';
import { Categories } from '../categories/categories.entity';
import { Carts } from '../carts/carts.entity';

@Entity()
export class Products {
  @PrimaryGeneratedColumn()
  id_product: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  // ✅ Foto produk (opsional)
  @Column({ nullable: true })
  image_url: string;

  // ✅ Video produk (opsional)
  @Column({ nullable: true })
  video_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  
  @OneToMany(() => Orders, (order) => order.product)
  orders: Orders[];

  @ManyToOne(() => Categories, (categories) => categories.products, {
    eager: true,
    onDelete: 'SET NULL',
  })
  categories: Categories;

  @OneToMany(() => Carts, (cart) => cart.product)
  cart : Carts[];
}
