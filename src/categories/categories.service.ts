import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './categories.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private categoriesRepo: Repository<Categories>,
  ) {}

  // Get All Categories
  findAll(): Promise<Categories[]> {
    return this.categoriesRepo.find({
      relations: ['products'],
      order: { created_at: 'DESC' }, 
    });
  }

  // Get Category by ID
  findOne(id_category: number): Promise<Categories | null> {
    return this.categoriesRepo.findOne({
      where: { id_category },
      relations: ['products'],
    });
  }

  // Create New Category
  create(dto: CreateCategoryDto): Promise<Categories> {
    const category = this.categoriesRepo.create(dto);
    return this.categoriesRepo.save(category);
  }

  // Update Category
  async update(id_category: number, dto: UpdateCategoryDto): Promise<Categories | null> {
    await this.categoriesRepo.update(id_category, dto);
    return this.findOne(id_category);
  }

  // Delete Category
  async remove(id_category: number): Promise<void> {
    await this.categoriesRepo.delete(id_category);
  }
}
