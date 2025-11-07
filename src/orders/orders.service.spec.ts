import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Orders } from './orders.entity';
import { OrderItems } from './order-items.entity';
import { Carts } from '../carts/carts.entity';
import { Products } from '../products/products.entity';
import { Users } from '../users/users.entity';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { PaymentService } from '../payment/payment.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateOrderStatusDto } from './orders.dto';

// orders service test suite
describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepo: Repository<Orders>;
  let orderItemsRepo: Repository<OrderItems>;
  let cartsRepo: Repository<Carts>;
  let productsRepo: Repository<Products>;
  let usersRepo: Repository<Users>;
  let paymentService: PaymentService;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  // setup testing module
  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        findOne: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as QueryRunner;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Orders),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        { provide: getRepositoryToken(OrderItems), useValue: { create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(Carts), useValue: { find: jest.fn(), delete: jest.fn() } },
        { provide: getRepositoryToken(Products), useValue: { findOne: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(Users), useValue: { findOneBy: jest.fn() } },
        {
          provide: PaymentService,
          useValue: { createPaymentIntent: jest.fn().mockResolvedValue({ id: 'pi_123', client_secret: 'secret_123' }) },
        },
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn().mockReturnValue(queryRunner) },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersRepo = module.get(getRepositoryToken(Orders));
    orderItemsRepo = module.get(getRepositoryToken(OrderItems));
    cartsRepo = module.get(getRepositoryToken(Carts));
    productsRepo = module.get(getRepositoryToken(Products));
    usersRepo = module.get(getRepositoryToken(Users));
    paymentService = module.get(PaymentService);
    dataSource = module.get(DataSource);
  });

   // cleanup mocks
  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // find one order by id
  describe('findOne', () => {
    it('should return an order if found', async () => {
      const mockOrder = { id_order: 1 } as Orders;
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder);

      const result = await service.findOne(1);
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  // find all orders
  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockOrders = [{ id_order: 1 }, { id_order: 2 }] as Orders[];
      jest.spyOn(ordersRepo, 'find').mockResolvedValue(mockOrders);

      const result = await service.findAll();
      expect(result).toEqual(mockOrders);
      expect(ordersRepo.find).toHaveBeenCalled();
    });
  });

  // findMine - orders of specific user
  describe('findMine', () => {
    it('should return orders of specific user', async () => {
      const mockOrders = [{ id_order: 1, user: { id_user: 10 } }] as Orders[];
      jest.spyOn(ordersRepo, 'find').mockResolvedValue(mockOrders);

      const result = await service.findMine(10);
      expect(result).toEqual(mockOrders);
    });
  });

  // update order status
  describe('updateStatus', () => {
    it('should update order status successfully', async () => {
      const dto: UpdateOrderStatusDto = { status: 'completed' };
      const mockOrder = { id_order: 1, status: 'pending' } as Orders;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue({ ...mockOrder, status: 'completed' } as Orders);

      const result = await service.updateStatus(1, dto);
      expect(result.status).toBe('completed');
    });
  });

  // remove order
  describe('remove', () => {
    it('should delete order successfully', async () => {
      jest.spyOn(ordersRepo, 'delete').mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(ordersRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if order not found', async () => {
      jest.spyOn(ordersRepo, 'delete').mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // checkout 
  describe('checkout', () => {
    it('should throw if user not found', async () => {
      jest.spyOn(usersRepo, 'findOneBy').mockResolvedValue(null);
      await expect(service.checkout(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw if cart is empty', async () => {
      jest.spyOn(usersRepo, 'findOneBy').mockResolvedValue({ id_user: 1 } as Users);
      jest.spyOn(cartsRepo, 'find').mockResolvedValue([]);

      await expect(service.checkout(1)).rejects.toThrow(BadRequestException);
    });

    it('should create order successfully', async () => {
      jest.spyOn(usersRepo, 'findOneBy').mockResolvedValue({ id_user: 1 } as Users);
      jest.spyOn(cartsRepo, 'find').mockResolvedValue([
        { quantity: 2, product: { id_product: 1, price: 50, stock: 5, name: 'Test' } },
      ] as any);

      jest.spyOn(ordersRepo, 'create').mockReturnValue({ id_order: 1, total_price: 0, status: 'pending' } as Orders);
      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue({ id_order: 1 } as Orders);
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue({ id_product: 1, stock: 5, price: 50 });
      jest.spyOn(queryRunner.manager, 'delete').mockResolvedValue(undefined as any);

      const result = await service.checkout(1);

      expect(result.order).toBeDefined();
      expect(result.clientSecret).toBe('secret_123');
      expect(paymentService.createPaymentIntent).toHaveBeenCalledWith(100);
    });
  });
});
