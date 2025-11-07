import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { UsersService } from '../src/users/users.service';

// users controller e2e test suite
describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersService = { 
    findAll: jest.fn(() => [{ id_user: 1, username: 'testuser' }]),
    create: jest.fn((dto) => ({ id_user: 2, ...dto })),
    findOne : jest.fn(),
    update : jest.fn(),
    remove : jest.fn(), 
  };

  // setup testing module
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  //  GET /users
  it('/users (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id_user: 1, username: 'testuser' }]);
  });

  // POST /users
  it('/users (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ username: 'testuser' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id_user: 2, username: 'testuser' });
  });

  // GET /users/:id_user
   it('/users/:id_user (GET) → success', async () => {
    const mockUser = { id_user: 1, username: 'testuser' };
    usersService.findOne.mockResolvedValue({ ...mockUser, password: 'secret' });

    const res = await request(app.getHttpServer()).get('/users/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUser); 
  });

  // GET /users/:id_user not found
  it('/users/:id_user (GET) → not found', async () => {
    usersService.findOne.mockResolvedValue(null);

    const res = await request(app.getHttpServer()).get('/users/999');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User with id 999 not found');
  });

  // PUT /users/:id_user
  it('/users/:id_user (PUT)', async () => {
    const mockUser = {id_user: 1, username: 'updateduser'};
    usersService.update.mockResolvedValue(mockUser);

    const res = await request(app.getHttpServer())
    .put('/users/1')
    .send({ username: 'updateduser' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUser);

  })

  // DELETE /users/:id_user
  it('/users/:id_user (DELETE)', async () =>{
    usersService.remove.mockResolvedValue(undefined);

    const res = await request(app.getHttpServer())
    .delete('/users/1');   
    expect(res.status).toBe(200);

  })
});
