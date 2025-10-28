import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../users/users.entity';
import { OrderItems } from './order-items.entity';
@Entity()
export class Orders {
  @PrimaryGeneratedColumn()
  id_order: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  payment_intent_id?: string

  @ManyToOne(() => Users, (user) => user.orders, { eager: true, onDelete: 'CASCADE' })
  user: Users;

  @OneToMany(() => OrderItems, (item) => item.order, { cascade: true })
  items: OrderItems[];


  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
