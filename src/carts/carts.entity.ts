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
export class Carts {
  @PrimaryGeneratedColumn()
  id_cart: number;

  @ManyToOne(() => Users, (user) => user.cart, {eager : true, onDelete : 'CASCADE'})
  user: Users;

  @ManyToOne(() => Products, (product) => product.cart, {eager : true, onDelete : 'CASCADE'})
  product: Products;

  @Column({default : 1})
  quantity: number;

  @Column({type : 'decimal', precision : 10, scale :2})
  total_price : number

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
