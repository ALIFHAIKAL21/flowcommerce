import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../users/users.entity';
import { Products } from '../products/products.entity';

@Entity()
export class Orders {
  @PrimaryGeneratedColumn()
  id_order: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ default: 'pending' })
  status: string; // contoh: pending, paid, shipped, canceled

  // otomatis waktu buat dan update
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // relasi ke user (siapa yang buat order)
  @ManyToOne(() => Users, (user) => user.orders, { eager: true, onDelete: 'CASCADE' })
  user: Users;

  // relasi ke produk (barang yang dipesan)
  @ManyToOne(() => Products, (product) => product.orders, { eager: true, onDelete: 'CASCADE' })
  product: Products;
}
