import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaUtils } from './utils/prisma.utils';
import { UserFactory } from './factories/user.factory';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const prisma: PrismaService = new PrismaService();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await PrismaUtils.cleanDb(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('/users/sign-up (POST) => Should return a status 201 CREATED', async () => {
    const user = new UserFactory(prisma).setRandomBuild();

    await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(user)
      .expect(HttpStatus.CREATED);

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
    expect(users).toHaveLength(1);
    expect(users[0]).toEqual({
      id: expect.any(Number),
      name: user.name,
      email: user.email,
    });
  });

  it('/users/sign-up (POST) => Should return a status 409 CONFLICT when email already exist', async () => {
    const { email } = await new UserFactory(prisma).createRandomUser();

    const user = new UserFactory(prisma)
      .setEmail(email)
      .setRandomName()
      .setRandomPassword()
      .setBuild();

    await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(user)
      .expect(HttpStatus.CONFLICT);
  });

  it('/users/sign-up (POST) => Should return a status 400 BAD REQUEST when body is missing', async () => {
    const user = {};

    await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(user)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/users/sign-up (POST) => Should return a status 400 BAD REQUEST when email is missing', async () => {
    const user = new UserFactory(prisma)
      .setRandomName()
      .setRandomPassword()
      .setBuild();

    await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(user)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/users/sign-up (POST) => Should return a status 400 BAD REQUEST when password is missing', async () => {
    const user = new UserFactory(prisma)
      .setRandomName()
      .setRandomEmail()
      .setBuild();

    await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(user)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/users/sign-up (POST) => Should return a status 400 BAD REQUEST when name is missing', async () => {
    const user = new UserFactory(prisma)
      .setRandomEmail()
      .setRandomPassword()
      .setBuild();

    await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(user)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/users/sign-in (POST) => Should return a status 401 UNAUTHORIZED when email not exist', async () => {
    const user = new UserFactory(prisma).setRandomBuild();

    await request(app.getHttpServer())
      .post('/users/sign-in')
      .send(user)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/users/sign-in (POST) => Should return a status 401 UNAUTHORIZED when email exist but password is incorrect', async () => {
    const { email } = await new UserFactory(prisma).createRandomUser();
    const { password } = new UserFactory(prisma).setRandomPassword().setBuild();

    await request(app.getHttpServer())
      .post('/users/sign-in')
      .send({ email, password })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/users/sign-in (POST) => Should return a status 400 BAD REQUEST when body is missing', async () => {
    const user = {};

    await request(app.getHttpServer())
      .post('/users/sign-in')
      .send(user)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/users/sign-in (POST) => Should return a status 400 BAD REQUEST when email is missing', async () => {
    const user = new UserFactory(prisma).setRandomPassword().setBuild();

    await request(app.getHttpServer())
      .post('/users/sign-in')
      .send(user)
      .expect(HttpStatus.BAD_REQUEST);
  });
  it('/users/sign-in (POST) => Should return a status 400 BAD REQUEST when password is missing', async () => {
    const user = new UserFactory(prisma).setRandomEmail().setBuild();

    await request(app.getHttpServer())
      .post('/users/sign-in')
      .send(user)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/users/sign-in (POST) => Should return a status 200 OK', async () => {
    const { name, email, password } = new UserFactory(prisma).setRandomBuild();
    await new UserFactory(prisma)
      .setName(name)
      .setEmail(email)
      .setPassword(password)
      .createUser();

    const { body } = await request(app.getHttpServer())
      .post('/users/sign-in')
      .send({ email: email, password: password })
      .expect(HttpStatus.OK);

    expect(body).toEqual({ token: expect.any(String) });
  });
});
