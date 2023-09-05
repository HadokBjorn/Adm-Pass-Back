import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaUtils } from './utils/prisma.utils';
import { UserFactory } from './factories/user.factory';
import { CredentialsFactory } from './factories/credentials.factory';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('Credentials Controller (e2e)', () => {
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

  it('/credentials (POST) => Should return a status 201 CREATED', async () => {
    //setup
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const credential = new CredentialsFactory(prisma).setRandomBuild();
    //login to get a token

    await request(app.getHttpServer())
      .post('/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send(credential)
      .expect(HttpStatus.CREATED);

    const credentials = await prisma.credential.findMany({
      select: { id: true, title: true, username: true, url: true },
    });
    expect(credentials).toHaveLength(1);
    expect(credentials[0]).toEqual({
      id: expect.any(Number),
      title: credential.title,
      url: credential.url,
      username: credential.username,
    });
  });

  it('/credentials (POST) => Should return a status 409 CONFLICT when title already exist', async () => {
    //setup
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const credential = await new CredentialsFactory(
      prisma,
    ).createRandomCredential(user.id);
    const credentialSameTitle = new CredentialsFactory(prisma)
      .setTitle(credential.title)
      .setRandomUrl()
      .setRandomUsername()
      .setRandomPassword()
      .setBuild();

    await request(app.getHttpServer())
      .post('/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send(credentialSameTitle)
      .expect(HttpStatus.CONFLICT);
  });

  it('/credentials (POST) => Should return a status 400 BAD REQUEST when body is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const credential = {};

    await request(app.getHttpServer())
      .post('/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send(credential)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/credentials (POST) => Should return a status 400 BAD REQUEST when title is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const credential = new CredentialsFactory(prisma)
      .setRandomUrl()
      .setRandomUsername()
      .setRandomPassword()
      .setBuild();

    await request(app.getHttpServer())
      .post('/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send(credential)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/credentials (POST) => Should return a status 400 BAD REQUEST when url is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const credential = new CredentialsFactory(prisma)
      .setRandomTitle()
      .setRandomUsername()
      .setRandomPassword()
      .setBuild();

    await request(app.getHttpServer())
      .post('/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send(credential)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/credentials (POST) => Should return a status 400 BAD REQUEST when username is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const credential = new CredentialsFactory(prisma)
      .setRandomTitle()
      .setRandomUrl()
      .setRandomPassword()
      .setBuild();

    await request(app.getHttpServer())
      .post('/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send(credential)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/credentials (POST) => Should return a status 400 BAD REQUEST when password is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const credential = new CredentialsFactory(prisma)
      .setRandomTitle()
      .setRandomUrl()
      .setRandomUsername()
      .setBuild();

    await request(app.getHttpServer())
      .post('/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send(credential)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/credentials (POST) => Should return a status 401 UNAUTHORIZED when not send a token', async () => {
    const credential = new CredentialsFactory(prisma).setRandomBuild();

    await request(app.getHttpServer())
      .post('/credentials')
      .send(credential)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/credentials/:id (GET) => Should return a status 403 FORBIDDEN when userId is from another user', async () => {
    const userOne = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      userOne,
      jwtService,
    );
    const userTwo = await new UserFactory(prisma).createRandomUser();

    const { id } = await new CredentialsFactory(prisma).createRandomCredential(
      userTwo.id,
    );

    await request(app.getHttpServer())
      .get(`/credentials/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('/credentials/:id (GET) => Should return a status 404 NOT FOUND when user has no credentials', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const { id } = await new CredentialsFactory(prisma).createRandomCredential(
      user.id,
    );

    await request(app.getHttpServer())
      .get(`/credentials/${id + 1}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/credentials/:id (GET) => Should return a status 200 OK and credential with password decrypted', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const { title, url, username, password } = new CredentialsFactory(
      prisma,
    ).setRandomBuild();

    const { id } = await new CredentialsFactory(prisma)
      .setTitle(title)
      .setUrl(url)
      .setUsername(username)
      .setPassword(password)
      .createCredential(user.id);

    const { body } = await request(app.getHttpServer())
      .get(`/credentials/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(body).toEqual({
      id: expect.any(Number),
      userId: user.id,
      title: title,
      url: url,
      username: username,
      password: password,
    });
  });

  it('/credentials (GET) => Should return a status 200 OK and all user credentials with password decrypted', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const { title, url, username, password } = new CredentialsFactory(
      prisma,
    ).setRandomBuild();

    await new CredentialsFactory(prisma).createRandomCredential(user.id);
    await new CredentialsFactory(prisma).createRandomCredential(user.id);
    await new CredentialsFactory(prisma).createRandomCredential(user.id);

    await new CredentialsFactory(prisma)
      .setTitle(title)
      .setUrl(url)
      .setUsername(username)
      .setPassword(password)
      .createCredential(user.id);

    const { body } = await request(app.getHttpServer())
      .get(`/credentials`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(body).toContainEqual({
      id: expect.any(Number),
      userId: user.id,
      title: title,
      url: url,
      username: username,
      password: password,
    });
  });
});
