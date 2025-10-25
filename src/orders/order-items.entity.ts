import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Orders } from "./orders.entity";
import { Products } from "../products/products.entity";

@Entity()
export class OrderItems {
  @PrimaryGeneratedColumn()
  id_order_item: number;

  @ManyToOne(() => Orders, (order) => order.items, { onDelete: 'CASCADE' })
  order: Orders;

  @ManyToOne(() => Products, { eager: true })
  product: Products;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;
}
