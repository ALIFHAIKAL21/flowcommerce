import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Products } from '../products/products.entity';

@Entity()
export class Categories {
  @PrimaryGeneratedColumn()
  id_category: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

 
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  
  @OneToMany(() => Products, (product) => product.categories)
  products: Products[];
}
