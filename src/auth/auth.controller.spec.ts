import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({
        user: { id_user: 1, username: 'testuser' },
        access_token: 'signed-jwt-token',
      }),
      login: jest.fn().mockResolvedValue({
        user: { id_user: 1, username: 'testuser' },
        access_token: 'signed-jwt-token',
      }),
    } as unknown as jest.Mocked<AuthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call AuthService.register and return result', async () => {
    const dto = { username: 'testuser', password: '123456' };
    const result = await controller.register(dto);
    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(result.access_token).toBe('signed-jwt-token');
  });

  it('should call AuthService.login and return result', async () => {
    const dto = { username: 'testuser', password: '123456' };
    const result = await controller.login(dto);
    expect(authService.login).toHaveBeenCalledWith(dto.username, dto.password);
    expect(result.access_token).toBe('signed-jwt-token');
  });
});
