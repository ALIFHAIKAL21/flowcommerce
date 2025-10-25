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
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { Products } from './products.entity';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import { UploadService } from '../uploads/uploads.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly uploadService: UploadService,
  ) {}

  // GET ALL PRODUCTS
  @Get()
  async findAll(): Promise<Products[]> {
    return await this.productsService.findAll();
  }

  //  GET SINGLE PRODUCT BY ID
  @Get(':id_product')
  async findOne(
    @Param('id_product', ParseIntPipe) id_product: number,
  ): Promise<Products> {
    const product = await this.productsService.findOne(id_product);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id_product} not found`);
    }
    return product;
  }

  // UPLOAD IMAGE FOR EXISTING PRODUCT
  @Post(':id_product/upload')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(
    @Param('id_product', ParseIntPipe) id_product: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Please upload a valid image file.');
    }

    const product = await this.productsService.findOne(id_product);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id_product} not found`);
    }

    // Upload ke Cloudinary
    const uploadResult = await this.uploadService.uploadFile(file);
    product.image_url = uploadResult.secure_url;

    await this.productsService.save(product);

    return {
      message: 'Product image uploaded successfully!',
      imageUrl: uploadResult.secure_url,
      product,
    };
  }

  // UPLOAD PRODUCT + IMAGE SEKALIGUS
  @Post('upload')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async createProductWithImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateProductDto,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('Please attach a product image file.');
    }

    const uploadResult = await this.uploadService.uploadFile(file);
    const product = await this.productsService.create({
      ...body,
      image_url: uploadResult.secure_url,
    });

    return {
      message: 'Product created successfully with image!',
      product,
    };
  }

  // CREATE PRODUCT (Tanpa Gambar)
  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateProductDto): Promise<Products> {
    return await this.productsService.create(dto);
  }

  //  UPDATE PRODUCT
  @Put(':id_product')
  @Roles('admin')
  async update(
    @Param('id_product', ParseIntPipe) id_product: number,
    @Body() dto: UpdateProductDto,
  ): Promise<Products> {
    const updated = await this.productsService.update(id_product, dto);
    if (!updated) {
      throw new NotFoundException(`Product with ID ${id_product} not found`);
    }
    return updated;
  }

  //  DELETE PRODUCT
  @Delete(':id_product')
  @Roles('admin')
  async remove(
    @Param('id_product', ParseIntPipe) id_product: number,
  ): Promise<{ message: string }> {
    await this.productsService.remove(id_product);
    return { message: `✅ Product with ID ${id_product} has been deleted` };
  }
}
