import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaUtils } from './utils/prisma.utils';
import { UserFactory } from './factories/user.factory';
import { CardsFactory } from './factories/cards.factory';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CreateCardDto } from 'src/cards/dto/create-card.dto';

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

  it('/cards (POST) => Should return a status 201 CREATED', async () => {
    //setup
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const card: CreateCardDto = new CardsFactory(prisma).setRandomBuild();
    //login to get a token

    await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card)
      .expect(HttpStatus.CREATED);

    const cards = await prisma.card.findMany();
    expect(cards).toHaveLength(1);
    expect(cards[0]).toEqual({
      id: expect.any(Number),
      userId: user.id,
      title: card.title,
      name: card.name,
      number: card.number,
      cvc: expect.any(String),
      expiration: new Date(card.expiration),
      password: expect.any(String),
      isCredit: card.isCredit,
      isDebit: card.isDebit,
    });
  });

  it('/cards (POST) => Should return a status 409 CONFLICT when title already exist', async () => {
    //setup
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const card = await new CardsFactory(prisma).createRandomCard(user.id);
    const cardSameTitle: CreateCardDto = new CardsFactory(prisma)
      .setTitle(card.title)
      .setRandomName()
      .setRandomNumber()
      .setRandomCvc()
      .setRandomExpiration()
      .setRandomPassword()
      .setRandomIsCredit()
      .setRandomIsDebit()
      .setBuild();

    await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(cardSameTitle)
      .expect(HttpStatus.CONFLICT);
  });

  it('/cards (POST) => Should return a status 400 BAD REQUEST when body is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const card = {};

    await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/cards (POST) => Should return a status 400 BAD REQUEST when title is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const card = new CardsFactory(prisma).setRandomBuild();
    card.title = undefined;

    await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/cards (POST) => Should return a status 400 BAD REQUEST when name is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const card = new CardsFactory(prisma).setRandomBuild();
    card.name = undefined;

    await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/cards (POST) => Should return a status 400 BAD REQUEST when number is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const card = new CardsFactory(prisma).setRandomBuild();
    card.number = undefined;

    await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/cards (POST) => Should return a status 400 BAD REQUEST when CVC is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const card = new CardsFactory(prisma).setRandomBuild();
    card.cvc = undefined;

    await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/cards (POST) => Should return a status 400 BAD REQUEST when expiration is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const card = new CardsFactory(prisma).setRandomBuild();
    card.expiration = undefined;

    await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/cards (POST) => Should return a status 400 BAD REQUEST when password is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const card = new CardsFactory(prisma).setRandomBuild();
    card.password = undefined;

    await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/cards (POST) => Should return a status 400 BAD REQUEST when isCredit is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const card = new CardsFactory(prisma).setRandomBuild();
    card.isCredit = undefined;

    await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/cards (POST) => Should return a status 400 BAD REQUEST when isDebit is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const card = new CardsFactory(prisma).setRandomBuild();
    card.isDebit = undefined;

    await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/cards (POST) => Should return a status 401 UNAUTHORIZED when not send a token', async () => {
    const credential = new CardsFactory(prisma).setRandomBuild();

    await request(app.getHttpServer())
      .post('/cards')
      .send(credential)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/cards/:id (GET) => Should return a status 403 FORBIDDEN when userId is from another user', async () => {
    const userOne = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      userOne,
      jwtService,
    );
    const userTwo = await new UserFactory(prisma).createRandomUser();

    const { id } = await new CardsFactory(prisma).createRandomCard(userTwo.id);

    await request(app.getHttpServer())
      .get(`/cards/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('/cards/:id (GET) => Should return a status 404 NOT FOUND when user has no cards', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const { id } = await new CardsFactory(prisma).createRandomCard(user.id);

    await request(app.getHttpServer())
      .get(`/cards/${id + 1}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/cards/:id (GET) => Should return a status 200 OK and card with cvc and password decrypted', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const {
      cvc,
      expiration,
      isCredit,
      isDebit,
      name,
      number,
      password,
      title,
    } = new CardsFactory(prisma).setRandomBuild();

    const { id } = await new CardsFactory(prisma)
      .setCvc(cvc)
      .setExpiration(expiration)
      .setIsCredit(isCredit)
      .setIsDebit(isDebit)
      .setName(name)
      .setNumber(number)
      .setPassword(password)
      .setTitle(title)
      .createCard(user.id);

    const { body } = await request(app.getHttpServer())
      .get(`/cards/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(body).toEqual({
      id: expect.any(Number),
      userId: user.id,
      cvc,
      expiration,
      isCredit,
      isDebit,
      name,
      number,
      password,
      title,
    });
  });

  it('/cards (GET) => Should return a status 200 OK and all user cards decrypted', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const {
      cvc,
      expiration,
      isCredit,
      isDebit,
      name,
      number,
      password,
      title,
    } = new CardsFactory(prisma).setRandomBuild();

    await new CardsFactory(prisma).createRandomCard(user.id);
    await new CardsFactory(prisma).createRandomCard(user.id);
    await new CardsFactory(prisma).createRandomCard(user.id);

    await new CardsFactory(prisma)
      .setCvc(cvc)
      .setExpiration(expiration)
      .setIsCredit(isCredit)
      .setIsDebit(isDebit)
      .setName(name)
      .setNumber(number)
      .setPassword(password)
      .setTitle(title)
      .createCard(user.id);

    const { body } = await request(app.getHttpServer())
      .get(`/cards`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(body).toContainEqual({
      id: expect.any(Number),
      userId: user.id,
      cvc,
      expiration,
      isCredit,
      isDebit,
      name,
      number,
      password,
      title,
    });
  });

  it('/cards/:id (DELETE) => Should return a status 404 NOT FOUND when card not exist', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const { id } = await new CardsFactory(prisma).createRandomCard(user.id);

    await request(app.getHttpServer())
      .delete(`/cards/${id + 1}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/cards/:id (DELETE) => Should return a status 200 Ok and delete a card', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const { id } = await new CardsFactory(prisma).createRandomCard(user.id);

    await request(app.getHttpServer())
      .delete(`/cards/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    const credentials = await prisma.credential.findMany();
    expect(credentials).toHaveLength(0);
  });

  it('/cards/:id (DELETE) => Should return a status 403 FORBIDDEN when userId is from another user', async () => {
    const userOne = await new UserFactory(prisma).createRandomUser();
    const userTwo = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      userOne,
      jwtService,
    );

    const { id } = await new CardsFactory(prisma).createRandomCard(userTwo.id);

    await request(app.getHttpServer())
      .delete(`/cards/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);
  });
});
