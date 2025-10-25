import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Products } from './products.entity';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import { Categories } from '../categories/categories.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,

    @InjectRepository(Categories)
    private readonly categoriesRepo: Repository<Categories>,
  ) {}

  //  Ambil semua produk
  async findAll(): Promise<Products[]> {
    return this.productsRepo.find({
      relations: ['categories'],
      order: { created_at: 'DESC' },
    });
  }

  // Ambil 1 produk by ID
  async findOne(id_product: number): Promise<Products> {
    const product = await this.productsRepo.findOne({
      where: { id_product },
      relations: ['categories'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id_product} not found`);
    }

    return product;
  }
  
async save(product: Products): Promise<Products> {
  return this.productsRepo.save(product);
}

  // Buat produk baru
  async create(dto: CreateProductDto): Promise<Products> {
    const category = await this.categoriesRepo.findOneBy({
      id_category: dto.categoryId,
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${dto.categoryId} not found`);
    }

    const newProduct = this.productsRepo.create({
      name: dto.name,
      price: dto.price,
      stock: dto.stock,
      image_url: dto.image_url,
      video_url: dto.video_url,
      categories: category, 
    });

    return await this.productsRepo.save(newProduct);
  }

  //  Update produk
  async update(id_product: number, dto: UpdateProductDto): Promise<Products> {
    const product = await this.productsRepo.findOne({
      where: { id_product },
      relations: ['categories'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id_product} not found`);
    }

    // KalO ada kategori baru
    if (dto.categoryId) {
      const category = await this.categoriesRepo.findOneBy({
        id_category: dto.categoryId,
      });

      if (!category) {
        throw new NotFoundException(`Category with id ${dto.categoryId} not found`);
      }

      product.categories = category;
    }
    // Update semua field yang dikirim
    Object.assign(product, dto);

    await this.productsRepo.save(product);
    return this.findOne(id_product);
  }

  // Hapus produk
  async remove(id_product: number): Promise<void> {
    const result = await this.productsRepo.delete(id_product);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with id ${id_product} not found`);
    }
  }
}
