import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { Categories } from './categories.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

// categories service test suite
describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: Repository<Categories>;

  const mockCategoryRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  // setup testing module
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Categories),
          useValue: mockCategoryRepo,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repo = module.get<Repository<Categories>>(getRepositoryToken(Categories));
  });

  // cleanup mocks
  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // findAll
  it('should return all categories', async () => {
    const mockCategories = [
      { id_category: 1, name: 'Tech' },
      { id_category: 2, name: 'Fashion' },
    ] as Categories[];

    mockCategoryRepo.find.mockResolvedValue(mockCategories);

    const result = await service.findAll();
    expect(result).toEqual(mockCategories);
    expect(repo.find).toHaveBeenCalledWith({
      relations: ['products'],
      order: { created_at: 'DESC' },
    });
  });

  // findOne
  it('should return one category by id', async () => {
    const mockCategory = { id_category: 1, name: 'Tech' } as Categories;
    mockCategoryRepo.findOne.mockResolvedValue(mockCategory);

    const result = await service.findOne(1);
    expect(result).toEqual(mockCategory);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id_category: 1 },
      relations: ['products'],
    });
  });

  // create
  it('should create a new category', async () => {
    const dto = { name: 'Gadgets', description: 'Electronic items' };
    const mockCategory = { id_category: 1, ...dto } as Categories;

    mockCategoryRepo.create.mockReturnValue(mockCategory);
    mockCategoryRepo.save.mockResolvedValue(mockCategory);

    const result = await service.create(dto);
    expect(result).toEqual(mockCategory);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(mockCategory);
  });

  // update
  it('should update an existing category', async () => {
    const dto = { name: 'Updated Name' };
    const mockCategory = { id_category: 1, ...dto } as Categories;

    mockCategoryRepo.update.mockResolvedValue(undefined);
    mockCategoryRepo.findOne.mockResolvedValue(mockCategory);

    const result = await service.update(1, dto);
    expect(result).toEqual(mockCategory);
    expect(repo.update).toHaveBeenCalledWith(1, dto);
  });

  // update - not found
  it('should delete a category', async () => {
    mockCategoryRepo.delete.mockResolvedValue(undefined);

    await service.remove(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
  });
});
