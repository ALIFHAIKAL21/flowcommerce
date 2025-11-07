import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Carts } from './carts.entity';
import { Products } from '../products/products.entity';
import { Users } from '../users/users.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCartDto, UpdateCartDto } from './carts.dto';

//  carts service test suite
describe('CartsService', () => {
  let service: CartsService;
  let cartsRepo: Repository<Carts>;
  let productsRepo: Repository<Products>;
  let usersRepo: Repository<Users>;

  // setup testing module
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        {
          provide: getRepositoryToken(Carts),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Products),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Users),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
    cartsRepo = module.get(getRepositoryToken(Carts));
    productsRepo = module.get(getRepositoryToken(Products));
    usersRepo = module.get(getRepositoryToken(Users));
  });

  afterAll(() => { jest.clearAllMocks(); });

  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // findAll
  describe('findAll', () => {
    it('should return all carts', async () => {
      const mockCarts = [{ id_cart: 1 }, { id_cart: 2 }] as Carts[];
      jest.spyOn(cartsRepo, 'find').mockResolvedValue(mockCarts);

      const result = await service.findAll();
      expect(result).toEqual(mockCarts);
      expect(cartsRepo.find).toHaveBeenCalled();
    });
  });

  // 🔹 findOne
  describe('findOne', () => {
    it('should return one cart', async () => {
      const mockCart = { id_cart: 1 } as Carts;
      jest.spyOn(cartsRepo, 'findOne').mockResolvedValue(mockCart);

      const result = await service.findOne(1);
      expect(result).toEqual(mockCart);
    });
  });

  // 🔹 create
  describe('create', () => {
    const dto: CreateCartDto = {
      userId: 1,
      productId: 2,
      quantity: 2,
    };

    it('should throw if user not found', async () => {
      jest.spyOn(usersRepo, 'findOneBy').mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw if product not found', async () => {
      jest.spyOn(usersRepo, 'findOneBy').mockResolvedValue({ id_user: 1 } as Users);
      jest.spyOn(productsRepo, 'findOneBy').mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw if stock not enough', async () => {
      jest.spyOn(usersRepo, 'findOneBy').mockResolvedValue({ id_user: 1 } as Users);
      jest
        .spyOn(productsRepo, 'findOneBy')
        .mockResolvedValue({ id_product: 2, name: 'Laptop', stock: 1 } as Products);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should update existing cart quantity if already in cart', async () => {
      const mockUser = { id_user: 1 } as Users;
      const mockProduct = { id_product: 2, name: 'Laptop', stock: 10, price: 100 } as Products;
      const existingCart = {
        id_cart: 1,
        quantity: 1,
        total_price: 100,
        product: mockProduct,
      } as Carts;

      jest.spyOn(usersRepo, 'findOneBy').mockResolvedValue(mockUser);
      jest.spyOn(productsRepo, 'findOneBy').mockResolvedValue(mockProduct);
      jest.spyOn(cartsRepo, 'findOne').mockResolvedValue(existingCart);
      jest.spyOn(cartsRepo, 'save').mockResolvedValue({
        ...existingCart,
        quantity: 3,
        total_price: 300,
      });

      const result = await service.create(dto);
      expect(result.total_price).toBe(300);
      expect(cartsRepo.save).toHaveBeenCalled();
    });

    it('should create new cart if not exists', async () => {
      const mockUser = { id_user: 1 } as Users;
      const mockProduct = { id_product: 2, name: 'Phone', stock: 10, price: 50 } as Products;
      jest.spyOn(usersRepo, 'findOneBy').mockResolvedValue(mockUser);
      jest.spyOn(productsRepo, 'findOneBy').mockResolvedValue(mockProduct);
      jest.spyOn(cartsRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(cartsRepo, 'create').mockReturnValue({ id_cart: 1 } as Carts);
      jest.spyOn(cartsRepo, 'save').mockResolvedValue({ id_cart: 1 } as Carts);

      const result = await service.create(dto);
      expect(result).toEqual({ id_cart: 1 });
    });
  });

  // 🔹 update
  describe('update', () => {
    const dto: UpdateCartDto = { quantity: 5 };

    it('should throw if cart not found', async () => {
      jest.spyOn(cartsRepo, 'findOne').mockResolvedValue(null);
      await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw if stock is not enough', async () => {
      const mockProduct = { name: 'Laptop', price: 100, stock: 3 } as Products;
      const mockCart = { id_cart: 1, product: mockProduct, quantity: 2 } as Carts;
      jest.spyOn(cartsRepo, 'findOne').mockResolvedValue(mockCart);
      await expect(service.update(1, dto)).rejects.toThrow(BadRequestException);
    });

    it('should update cart quantity and total price', async () => {
      const mockProduct = { name: 'Laptop', price: 100, stock: 10 } as Products;
      const mockCart = { id_cart: 1, product: mockProduct, quantity: 2 } as Carts;

      jest.spyOn(cartsRepo, 'findOne').mockResolvedValue(mockCart);
      jest.spyOn(cartsRepo, 'save').mockResolvedValue(mockCart);
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockCart, quantity: 5 });

      const result = await service.update(1, dto);
      expect(result!.quantity).toBe(5);
      expect(cartsRepo.save).toHaveBeenCalled();
    });
  });

  // 🔹 remove
  describe('remove', () => {
    it('should remove cart successfully', async () => {
      jest.spyOn(cartsRepo, 'delete').mockResolvedValue({ affected: 1 } as any);
      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('should throw if cart not found', async () => {
      jest.spyOn(cartsRepo, 'delete').mockResolvedValue({ affected: 0 } as any);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  // 🔹 clearUserCart
  describe('clearUserCart', () => {
    it('should clear cart of a user', async () => {
      jest.spyOn(cartsRepo, 'delete').mockResolvedValue({ affected: 2 } as any);
      await service.clearUserCart(1);
      expect(cartsRepo.delete).toHaveBeenCalledWith({ user: { id_user: 1 } });
    });
  });
});
