import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Orders } from '../orders/orders.entity';
import { Carts } from '../carts/carts.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: 'customer' })
  role: 'admin' | 'customer';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Orders, (order) => order.user)
  orders: Orders[];


  @OneToMany(() =>Carts, (cart) => cart.user)
  cart : Carts[];
}
