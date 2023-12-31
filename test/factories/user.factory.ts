import { PrismaService } from 'src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
export class UserFactory {
  private SALT = 10;
  private name: string;
  private email: string;
  private password: string;

  private EXPIRATION_TIME = '7 days';
  private ISSUER = 'Driven';
  private AUDIENCE = 'users';

  constructor(private readonly prisma: PrismaService) {}

  setName(name: string) {
    this.name = name;
    return this;
  }

  setRandomName() {
    this.name = faker.person.firstName();
    return this;
  }

  setEmail(email: string) {
    this.email = email;
    return this;
  }

  setRandomEmail() {
    this.email = faker.internet.email();
    return this;
  }

  setPassword(password: string) {
    this.password = password;
    return this;
  }

  setRandomPassword() {
    this.password = faker.internet.password({
      length: 25,
      prefix: '@Str0ngP4ssw0rd',
    });
    return this;
  }

  setBuild() {
    return {
      name: this.name,
      email: this.email,
      password: this.password,
    };
  }

  setRandomBuild() {
    return {
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password({
        length: 25,
        prefix: '@Str0ngP4ssw0rd',
      }),
    };
  }

  async createUser() {
    const user = this.setBuild();
    return await this.prisma.user.create({
      data: {
        ...user,
        password: bcrypt.hashSync(user.password, this.SALT),
      },
    });
  }

  async createRandomUser() {
    const user = this.setRandomBuild();
    return await this.prisma.user.create({
      data: {
        ...user,
        password: bcrypt.hashSync(user.password, this.SALT),
      },
    });
  }

  async createToken(user: User, jwtService: JwtService) {
    const { id, email } = user;

    const token = jwtService.sign(
      { email },
      {
        expiresIn: this.EXPIRATION_TIME,
        subject: String(id),
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      },
    );

    return { token };
  }
}
