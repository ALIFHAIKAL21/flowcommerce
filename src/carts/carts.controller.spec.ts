import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { CreateCartDto, UpdateCartDto } from './carts.dto';
import { NotFoundException } from '@nestjs/common';

// carts controller test suite
describe('CartsController', () => {
  let controller: CartsController;
  let service: CartsService;

  const mockCartsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    clearUserCart: jest.fn(),
  };

  const mockRequest = {
    user: { id_user: 1, role: 'user' },
  } as any;

  // setup testing module
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [
        {
          provide: CartsService,
          useValue: mockCartsService,
        },
      ],
    }).compile();

    controller = module.get<CartsController>(CartsController);
    service = module.get<CartsService>(CartsService);
  });

  // cleanup mocks
  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // findAll
  describe('findAll', () => {
    it('should return all carts', async () => {
      const carts = [{ id_cart: 1 }, { id_cart: 2 }];
      jest.spyOn(service, 'findAll').mockResolvedValue(carts as any);

      const result = await controller.findAll();
      expect(result).toEqual(carts);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  // findMyCart
  describe('findMyCart', () => {
    it('should return only carts belonging to the logged-in user', async () => {
      const carts = [
        { id_cart: 1, user: { id_user: 1 } },
        { id_cart: 2, user: { id_user: 2 } },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(carts as any);

      const result = await controller.findMyCart(mockRequest);
      expect(result).toEqual([{ id_cart: 1, user: { id_user: 1 } }]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  // findOne
  describe('findOne', () => {
    it('should return a cart if found', async () => {
      const cart = { id_cart: 1 };
      jest.spyOn(service, 'findOne').mockResolvedValue(cart as any);

      const result = await controller.findOne(1);
      expect(result).toEqual(cart);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if cart not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // create
  describe('create', () => {
    it('should create a new cart for logged-in user', async () => {
      const dto: CreateCartDto = { productId: 2, quantity: 3 };
      const created = { id_cart: 1, ...dto, id_user: 1 };
      jest.spyOn(service, 'create').mockResolvedValue(created as any);

      const result = await controller.create(mockRequest, dto);
      expect(result).toEqual(created);
      expect(service.create).toHaveBeenCalledWith(1, dto); 
    });
  });

  // update
  describe('update', () => {
    it('should update a cart if found', async () => {
      const dto: UpdateCartDto = { quantity: 5 };
      const updated = { id_cart: 1, quantity: 5 };
      jest.spyOn(service, 'update').mockResolvedValue(updated as any);

      const result = await controller.update(1, dto);
      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw NotFoundException if update returns null', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(null);

      await expect(controller.update(1, { quantity: 5 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // clearMyCart
  describe('clearMyCart', () => {
    it("should clear the user's cart and return a message", async () => {
      jest.spyOn(service, 'clearUserCart').mockResolvedValue(undefined);

      const result = await controller.clearMyCart(mockRequest);
      expect(result).toEqual({ message: 'Your cart has been cleared' });
      expect(service.clearUserCart).toHaveBeenCalledWith(1);
    });
  });

  // remove
  describe('remove', () => {
    it('should delete a cart and return confirmation message', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove(1);
      expect(result).toEqual({
        message: 'Cart with id 1 removed successfully',
      });
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
