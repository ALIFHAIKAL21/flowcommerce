import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import { Products } from './products.entity';
import { Categories } from '../categories/categories.entity';
import { UploadService } from '../uploads/uploads.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUploadService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all products', async () => {
    const mockProducts = [
      { id_product: 1, name: 'Phone' },
      { id_product: 2, name: 'Laptop' },
    ] as Products[];

    mockProductsService.findAll.mockResolvedValue(mockProducts);

    const result = await controller.findAll();
    expect(result).toEqual(mockProducts);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a product by id', async () => {
    const mockProduct = { id_product: 1, name: 'Phone' } as Products;
    mockProductsService.findOne.mockResolvedValue(mockProduct);

    const result = await controller.findOne(1);
    expect(result).toEqual(mockProduct);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if product not found', async () => {
    mockProductsService.findOne.mockRejectedValue(new NotFoundException());
    await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should create a new product', async () => {
    const dto: CreateProductDto = {
      name: 'Watch',
      price: 100,
      stock: 5,
      image_url: '',
      video_url: '',
      categoryId: 1,
    };

    const mockCategory = { id_category: 1, name: 'Accessories' } as Categories;

    const created = {
      id_product: 1,
      name: 'Watch',
      price: 100,
      stock: 10,
      image_url: '',
      video_url: '',
      categoryId: 1,
      created_at: new Date(),
      updated_at: new Date(),
      cart: [],
      categories: mockCategory,
    } as Products;

    mockProductsService.create.mockResolvedValue(created);

    const result = await controller.create(dto);
    expect(result).toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should update an existing product', async () => {
    const dto: UpdateProductDto = { name: 'Updated Watch' };
    const updated = { id_product: 1, name: 'Updated Watch' } as Products;

    mockProductsService.update.mockResolvedValue(updated);

    const result = await controller.update(1, dto);
    expect(result).toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should throw NotFoundException if updating non-existent product', async () => {
    mockProductsService.update.mockRejectedValue(new NotFoundException());
    await expect(controller.update(99, { name: 'None' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should remove a product by id', async () => {
    mockProductsService.remove.mockResolvedValue({ message: '✅ Product with ID 1 has been deleted' });

    const result = await controller.remove(1);
    expect(result).toEqual({ message: '✅ Product with ID 1 has been deleted' });
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if deleting non-existent product', async () => {
    mockProductsService.remove.mockRejectedValue(new NotFoundException());
    await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
  });
});
