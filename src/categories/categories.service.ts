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

  findAll(): Promise<Categories[]> {
    return this.categoriesRepo.find({
      relations: ['products'],
      order: { created_at: 'DESC' }, 
    });
  }

  findOne(id_category: number): Promise<Categories | null> {
    return this.categoriesRepo.findOne({
      where: { id_category },
      relations: ['products'],
    });
  }

  create(dto: CreateCategoryDto): Promise<Categories> {
    const category = this.categoriesRepo.create(dto);
    return this.categoriesRepo.save(category);
  }

  async update(id_category: number, dto: UpdateCategoryDto): Promise<Categories | null> {
    await this.categoriesRepo.update(id_category, dto);
    return this.findOne(id_category);
  }

  async remove(id_category: number): Promise<void> {
    await this.categoriesRepo.delete(id_category);
  }
}
