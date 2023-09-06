import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaUtils } from './utils/prisma.utils';
import { UserFactory } from './factories/user.factory';
import { NotesFactory } from './factories/notes.factory';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('Notes Controller (e2e)', () => {
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

  it('/notes (POST) => Should return a status 201 CREATED', async () => {
    //setup
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const note = new NotesFactory(prisma).setRandomBuild();
    //login to get a token

    await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(note)
      .expect(HttpStatus.CREATED);

    const notes = await prisma.note.findMany();
    expect(notes).toHaveLength(1);
    expect(notes[0]).toEqual({
      id: expect.any(Number),
      userId: user.id,
      title: note.title,
      text: note.text,
    });
  });

  it('/notes (POST) => Should return a status 409 CONFLICT when title already exist', async () => {
    //setup
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const note = await new NotesFactory(prisma).createRandomNote(user.id);
    const noteSameTitle = new NotesFactory(prisma)
      .setTitle(note.title)
      .setRandomText()
      .setBuild();

    await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(noteSameTitle)
      .expect(HttpStatus.CONFLICT);
  });

  it('/notes (POST) => Should return a status 400 BAD REQUEST when body is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const note = {};

    await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(note)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/notes (POST) => Should return a status 400 BAD REQUEST when title is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const credential = new NotesFactory(prisma).setRandomText().setBuild();

    await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(credential)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/notes (POST) => Should return a status 400 BAD REQUEST when text is missing', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );
    const notes = new NotesFactory(prisma).setRandomTitle().setBuild();

    await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(notes)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/notes (POST) => Should return a status 401 UNAUTHORIZED when not send a token', async () => {
    const note = new NotesFactory(prisma).setRandomBuild();

    await request(app.getHttpServer())
      .post('/notes')
      .send(note)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/notes/:id (GET) => Should return a status 403 FORBIDDEN when userId is from another user', async () => {
    const userOne = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      userOne,
      jwtService,
    );
    const userTwo = await new UserFactory(prisma).createRandomUser();

    const { id } = await new NotesFactory(prisma).createRandomNote(userTwo.id);

    await request(app.getHttpServer())
      .get(`/notes/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('/notes/:id (GET) => Should return a status 404 NOT FOUND when user has no notes', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const { id } = await new NotesFactory(prisma).createRandomNote(user.id);

    await request(app.getHttpServer())
      .get(`/notes/${id + 1}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/notes/:id (GET) => Should return a status 200 OK and a specific note', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const { title, text } = new NotesFactory(prisma).setRandomBuild();

    const { id } = await new NotesFactory(prisma)
      .setTitle(title)
      .setText(text)
      .createNote(user.id);

    const { body } = await request(app.getHttpServer())
      .get(`/notes/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(body).toEqual({
      id: expect.any(Number),
      userId: user.id,
      title: title,
      text: text,
    });
  });

  it('/notes/:id (DELETE) => Should return a status 404 NOT FOUND when note not exist', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const { title, text } = new NotesFactory(prisma).setRandomBuild();

    const { id } = await new NotesFactory(prisma)
      .setTitle(title)
      .setText(text)
      .createNote(user.id);

    await request(app.getHttpServer())
      .delete(`/notes/${id + 1}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/notes/:id (DELETE) => Should return a status 403 FORBIDDEN when userId is from another user', async () => {
    const userOne = await new UserFactory(prisma).createRandomUser();
    const userTwo = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      userOne,
      jwtService,
    );

    const { title, text } = new NotesFactory(prisma).setRandomBuild();

    const { id } = await new NotesFactory(prisma)
      .setTitle(title)
      .setText(text)
      .createNote(userTwo.id);

    await request(app.getHttpServer())
      .delete(`/notes/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('/notes (GET) => Should return a status 200 OK and all user credentials with password decrypted', async () => {
    const user = await new UserFactory(prisma).createRandomUser();
    const { token } = await new UserFactory(prisma).createToken(
      user,
      jwtService,
    );

    const { title, text } = new NotesFactory(prisma).setRandomBuild();

    await new NotesFactory(prisma).createRandomNote(user.id);
    await new NotesFactory(prisma).createRandomNote(user.id);
    await new NotesFactory(prisma).createRandomNote(user.id);

    await new NotesFactory(prisma)
      .setTitle(title)
      .setText(text)
      .createNote(user.id);

    const { body } = await request(app.getHttpServer())
      .get(`/notes`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(body).toContainEqual({
      id: expect.any(Number),
      userId: user.id,
      title: title,
      text: text,
    });
  });
});
