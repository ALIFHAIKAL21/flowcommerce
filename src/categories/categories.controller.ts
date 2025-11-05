import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Categories } from './categories.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  // Get All Categories
  @Get()
  findAll(): Promise<Categories[]> {
    return this.categoriesService.findAll();
  }

  // Get Category by ID
  @Get(':id_category')
  async findOne(@Param('id_category') id_category: number): Promise<Categories> {
    const category = await this.categoriesService.findOne(id_category);
    if (!category) {
      throw new NotFoundException(`Category with id ${id_category} not found`);
    }
    return category;
  }

  // Create New Category
  @Post()
  @Roles('admin')
  create(@Body() dto: CreateCategoryDto): Promise<Categories> {
    return this.categoriesService.create(dto);
  }

  // Update Category
  @Put(':id_category')
  @Roles('admin')
  async update(
    @Param('id_category') id_category: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Categories> {
    const updated = await this.categoriesService.update(id_category, dto);
    if (!updated) {
      throw new NotFoundException(`Category with id ${id_category} not found`);
    }
    return updated;
  }

  //  Delete Category
  @Delete(':id_category')
  @Roles('admin')
  remove(@Param('id_category') id_category: number): Promise<void> {
    return this.categoriesService.remove(id_category);
  }
}
