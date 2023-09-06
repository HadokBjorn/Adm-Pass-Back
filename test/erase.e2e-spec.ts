import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaUtils } from './utils/prisma.utils';
import { UserFactory } from './factories/user.factory';
import { CardsFactory } from './factories/cards.factory';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NotesFactory } from './factories/notes.factory';
import { CredentialsFactory } from './factories/credentials.factory';

describe('Cards Controller (e2e)', () => {
  let app: INestApplication;
  const prisma: PrismaService = new PrismaService();
  const jwtService: JwtService = new JwtService({
    secret: process.env.JWT_SECRET,
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, JwtModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(JwtService)
      .useValue(jwtService)
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

  it('/erase (DELETE) => Should return a status 200 OK and delete a user', async () => {
    const { name, email, password } = new UserFactory(prisma).setRandomBuild();
    const user = await new UserFactory(prisma)
      .setName(name)
      .setEmail(email)
      .setPassword(password)
      .createUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    await new CardsFactory(prisma).createRandomCard(user.id);
    await new NotesFactory(prisma).createRandomNote(user.id);
    await new CredentialsFactory(prisma).createRandomCredential(user.id);

    await request(app.getHttpServer())
      .delete(`/erase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ password })
      .expect(HttpStatus.OK);

    const users = await prisma.user.findMany();
    expect(users).toHaveLength(0);
  });

  it('/erase (DELETE) => Should return a status 401 UNAUTHORIZED when password is wrong', async () => {
    const { name, email, password } = new UserFactory(prisma).setRandomBuild();
    const user = await new UserFactory(prisma)
      .setName(name)
      .setEmail(email)
      .setPassword(password)
      .createUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    await new CardsFactory(prisma).createRandomCard(user.id);
    await new NotesFactory(prisma).createRandomNote(user.id);
    await new CredentialsFactory(prisma).createRandomCredential(user.id);

    await request(app.getHttpServer())
      .delete(`/erase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'wrong_password' })
      .expect(HttpStatus.UNAUTHORIZED);

    const users = await prisma.user.findMany();
    expect(users).toHaveLength(1);
  });
});
