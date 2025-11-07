import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// use jest.mock to mock bcrypt functions
jest.mock('bcrypt', () => ({
  hash: jest.fn(async (pw: string) => `hashed-${pw}`),
  compare: jest.fn(async (a: string, b: string) => a === b),
}));

// Mock repository
const mockUserRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// users service test suite
describe('UsersService', () => {
  let service: UsersService;

  // setup testing module
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(Users), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // tests for UsersService methods
  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ id_user: 1, username: 'testuser' }];
      mockUserRepo.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findByUsername', () => {
    it('should return a user if found', async () => {
      const user = { id_user: 1, username: 'testuser' };
      mockUserRepo.findOne.mockResolvedValue(user);

      const result = await service.findByUsername('testuser');
      expect(result).toEqual(user);
    });

    it('should return null if not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('unknown');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should throw ConflictException if username already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ username: 'testuser' });

      await expect(
        service.create({ username: 'testuser', password: '123456', role: 'admin' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password and save new user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation((dto) => dto);
      mockUserRepo.save.mockResolvedValue({
        id_user: 1,
        username: 'testuser',
        role: 'customer',
      });

      const result = await service.create({
        username: 'testuser',
        password: '123456',
      });

      expect(result.username).toBe('testuser');
      expect(mockUserRepo.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should hash password if provided', async () => {
      const hashed = await bcrypt.hash('456', 10);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(hashed);

      mockUserRepo.update.mockResolvedValue({});
      mockUserRepo.findOne.mockResolvedValue({ id_user: 1, username: 'testuser' });

      const result = await service.update(1, { password: '456' });

      expect(bcrypt.hash).toHaveBeenCalledWith('456', 10);
      expect(result).toEqual({ id_user: 1, username: 'testuser' });
    });
  });

  describe('remove', () => {
    it('should delete user by id', async () => {
      await service.remove(1);
      expect(mockUserRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
