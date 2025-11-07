import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Products } from './products.entity';
import { Categories } from '../categories/categories.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

// products service test suite
describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepo: jest.Mocked<Repository<Products>>;
  let categoriesRepo: jest.Mocked<Repository<Categories>>;

  // setup testing module
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Products),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Categories),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productsRepo = module.get(getRepositoryToken(Products));
    categoriesRepo = module.get(getRepositoryToken(Categories));
  });

  afterEach(() => jest.clearAllMocks());

  
  // findAll 
  it('should return all products', async () => {
    const mockProducts = [{ id_product: 1, name: 'Phone' }] as Products[];
    productsRepo.find.mockResolvedValue(mockProducts);

    const result = await service.findAll();

    expect(productsRepo.find).toHaveBeenCalledWith({
      relations: ['categories'],
      order: { created_at: 'DESC' },
    });
    expect(result).toEqual(mockProducts);
  });


  // findOne
  it('should return a product by ID', async () => {
    const mockProduct = { id_product: 1, name: 'Laptop' } as Products;
    productsRepo.findOne.mockResolvedValue(mockProduct);

    const result = await service.findOne(1);
    expect(result).toEqual(mockProduct);
    expect(productsRepo.findOne).toHaveBeenCalledWith({
      where: { id_product: 1 },
      relations: ['categories'],
    });
  });

  
  // findOne - not found
  it('should throw NotFoundException if product not found', async () => {
    productsRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  
  // create - success
  it('should create a new product when category exists', async () => {
    const dto = {
      name: 'Watch',
      price: 100,
      stock: 10,
      image_url: undefined,
      video_url: undefined,
      categoryId: 1,
    };

    const mockCategory = { id_category: 1, name: 'Accessories' } as Categories;
    const mockProduct = {
      categories: mockCategory,
      name: 'Watch',
      price: 100,
      stock: 10,
      image_url: '',
      video_url: '',
      categoryId: 1,
      id_product: 1,
      created_at: new Date(),
      updated_at: new Date(),
      cart: [],
    } as Products;


    categoriesRepo.findOneBy.mockResolvedValue(mockCategory);
    productsRepo.create.mockReturnValue(mockProduct);
    productsRepo.save.mockResolvedValue(mockProduct);

    const result = await service.create(dto);

    expect(categoriesRepo.findOneBy).toHaveBeenCalledWith({ id_category: 1 });
    expect(productsRepo.create).toHaveBeenCalled();
    expect(productsRepo.save).toHaveBeenCalledWith(mockProduct);
    expect(result).toEqual(mockProduct);
  });

  // create - category not found
  it('should throw NotFoundException if category not found when creating', async () => {
    categoriesRepo.findOneBy.mockResolvedValue(null);

    await expect(
      service.create({
        name: 'Chair',
        price: 50,
        stock: 5,
        image_url: undefined,
        video_url: undefined,
        categoryId: 2,
      }),
    ).rejects.toThrow(NotFoundException);
  });


  // update - success
  it('should update product and return updated product', async () => {
    const existingProduct = {
      id_product: 1,
      name: 'Laptop',
      categories: { id_category: 1, name: 'Electronics' },
    } as Products;

    const dto = { name: 'Laptop Pro', categoryId: 2 };
    const newCategory = { id_category: 2, name: 'Premium' } as Categories;
    const updatedProduct = { ...existingProduct, ...dto, categories: newCategory };

    productsRepo.findOne.mockResolvedValue(existingProduct);
    categoriesRepo.findOneBy.mockResolvedValue(newCategory);
    productsRepo.save.mockResolvedValue(updatedProduct);
    productsRepo.findOne.mockResolvedValue(updatedProduct);

    const result = await service.update(1, dto);

    expect(productsRepo.findOne).toHaveBeenCalled();
    expect(categoriesRepo.findOneBy).toHaveBeenCalledWith({ id_category: 2 });
    expect(productsRepo.save).toHaveBeenCalled();
    expect(result).toEqual(updatedProduct);
  });

  // update - product not found
  it('should throw NotFoundException if product not found when updating', async () => {
    productsRepo.findOne.mockResolvedValue(null);
    await expect(service.update(1, { name: 'Test' })).rejects.toThrow(NotFoundException);
  });

  //  update - category not found
  it('should throw NotFoundException if category not found when updating', async () => {
    const existingProduct = { id_product: 1, name: 'Phone' } as Products;
    productsRepo.findOne.mockResolvedValue(existingProduct);
    categoriesRepo.findOneBy.mockResolvedValue(null);
    await expect(
      service.update(1, { categoryId: 99 }),
    ).rejects.toThrow(NotFoundException);
  });

  // remove - success
  it('should remove a product successfully', async () => {
    productsRepo.delete.mockResolvedValue({ affected: 1 } as any);
    await service.remove(1);
    expect(productsRepo.delete).toHaveBeenCalledWith(1);
  });

  // remove - not found
  it('should throw NotFoundException if product not found when deleting', async () => {
    productsRepo.delete.mockResolvedValue({ affected: 0 } as any);
    await expect(service.remove(123)).rejects.toThrow(NotFoundException);
  });
});
