import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

// use jest.mock to mock bcrypt functions
jest.mock('bcrypt', () => ({
  compare: jest.fn(async (a, b) => a === b),
  hash: jest.fn(async (pw) => `hashed-${pw}`),
}));

//  auth service test suite
describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByUsername: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
    } as unknown as jest.Mocked<JwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // tests for register and login methods
  describe('register', () => {
    it('should register a new user and return token', async () => {
      const user = {
        id_user: 1,
        username: 'testuser',
        password: 'hashed',
        role: 'customer' as 'customer',
        created_at: new Date(),
        updated_at: new Date(),
        orders: [],
        cart: [],
      };

      usersService.create.mockResolvedValue(user);

      const result = await service.register({
        username: 'testuser',
        password: '123456',
      });

      expect(usersService.create).toHaveBeenCalledWith({
        username: 'testuser',
        password: expect.any(String),
      });
      expect(result.user.username).toBe('testuser');
      expect(result.access_token).toBe('signed-jwt-token');
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      await expect(service.login('testuser', '123456')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if password incorrect', async () => {
      usersService.findByUsername.mockResolvedValue({
        id_user: 1,
        username: 'testuser',
        password: 'hashed-123456',
        role: 'customer',
        created_at: new Date(),
        updated_at: new Date(),
        orders: [],
        cart: [],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login('testuser', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return token if password correct', async () => {
      usersService.findByUsername.mockResolvedValue({
        id_user: 1,
        username: 'testuser',
        password: 'hashed-123456',
        role: 'customer',
        created_at: new Date(),
        updated_at: new Date(),
        orders: [],
        cart: [],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login('testuser', '123456');

      expect(result.user.username).toBe('testuser');
      expect(result.access_token).toBe('signed-jwt-token');
    });
  });
});
