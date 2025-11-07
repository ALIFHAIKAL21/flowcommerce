import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './orders.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            findAll: jest.fn(),
            findMine: jest.fn(),
            findOne: jest.fn(),
            checkout: jest.fn(),
            updateStatus: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all orders', async () => {
    const mockOrders = [{ id_order: 1, total_price: 100 }];
    jest.spyOn(service, 'findAll').mockResolvedValue(mockOrders as any);

    const result = await controller.findAll();
    expect(result).toEqual(mockOrders);
  });

  it('should find order by id', async () => {
    const mockOrder = { id_order: 1, total_price: 100 };
    jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);

    const result = await controller.findOne(1);
    expect(result).toEqual(mockOrder);
  });

  it('should remove order by id', async () => {
    jest.spyOn(service, 'remove').mockResolvedValue(undefined);

    const result = await controller.remove(1);
    expect(result).toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should update order status', async () => {
    const dto: UpdateOrderStatusDto = { status: 'completed' };
    const mockOrder = { id_order: 1, status: 'completed' };
    jest.spyOn(service, 'updateStatus').mockResolvedValue(mockOrder as any);

    const result = await controller.updateStatus(1, dto);
    expect(result).toEqual(mockOrder);
  });
});
