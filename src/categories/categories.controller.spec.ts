import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { NotFoundException } from '@nestjs/common';
import { Categories } from './categories.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';

// categories controller test suite
describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  // mock categories service
  const mockCategoriesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // setup testing module
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  // cleanup mocks
  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // findAll
  it('should return all categories', async () => {
    const mockCategories = [
      { id_category: 1, name: 'Tech' },
      { id_category: 2, name: 'Fashion' },
    ] as Categories[];

    mockCategoriesService.findAll.mockResolvedValue(mockCategories);

    const result = await controller.findAll();
    expect(result).toEqual(mockCategories);
    expect(service.findAll).toHaveBeenCalled();
  });

  // findOne
  it('should return one category', async () => {
    const mockCategory = { id_category: 1, name: 'Tech' } as Categories;
    mockCategoriesService.findOne.mockResolvedValue(mockCategory);

    const result = await controller.findOne(1);
    expect(result).toEqual(mockCategory);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  // findOne - not found
  it('should throw NotFoundException if category not found', async () => {
    mockCategoriesService.findOne.mockRejectedValue(new NotFoundException());
    await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
  });

  // create
  it('should create a new category', async () => {
    const dto: CreateCategoryDto = { name: 'Gadgets', description: 'Cool tech' };
    const created = { id_category: 1, ...dto } as Categories;

    mockCategoriesService.create.mockResolvedValue(created);

    const result = await controller.create(dto);
    expect(result).toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  // update
  it('should update an existing category', async () => {
    const dto: UpdateCategoryDto = { name: 'Updated Gadgets' };
    const updated = { id_category: 1, ...dto } as Categories;

    mockCategoriesService.update.mockResolvedValue(updated);

    const result = await controller.update(1, dto);
    expect(result).toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  // update - not found
  it('should throw NotFoundException if updating non-existent category', async () => {
    mockCategoriesService.update.mockRejectedValue(new NotFoundException());
    await expect(controller.update(99, { name: 'None' })).rejects.toThrow(NotFoundException);
  });

  // remove
  it('should remove a category by id', async () => {
    mockCategoriesService.remove.mockResolvedValue(undefined);

    const result = await controller.remove(1);
    expect(result).toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  // remove - not found
  it('should throw NotFoundException if deleting non-existent category', async () => {
    mockCategoriesService.remove.mockRejectedValue(new NotFoundException());
    await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
  });
});
