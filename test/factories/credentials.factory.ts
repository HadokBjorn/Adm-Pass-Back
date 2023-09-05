import { PrismaService } from 'src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
export class CredentialsFactory {
  private SALT = 10;
  private title: string;
  private url: string;
  private username: string;
  private password: string;

  constructor(private readonly prisma: PrismaService) {}

  setTitle(title: string) {
    this.title = title;
    return this;
  }

  setRandomTitle() {
    this.title = faker.internet.domainWord();
    return this;
  }

  setUrl(url: string) {
    this.url = url;
    return this;
  }

  setRandomUrl() {
    this.url = faker.internet.url();
    return this;
  }

  setUsername(username: string) {
    this.username = username;
    return this;
  }

  setRandomUsername() {
    this.username = faker.internet.userName();
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
      title: this.title,
      url: this.url,
      username: this.username,
      password: this.password,
    };
  }

  setRandomBuild() {
    return {
      title: faker.internet.domainWord(),
      url: faker.internet.url(),
      username: faker.internet.userName(),
      password: faker.internet.password({
        length: 25,
        prefix: '@Str0ngP4ssw0rd',
      }),
    };
  }

  async createCredential(userId: number) {
    const credential = this.setBuild();
    return await this.prisma.credential.create({
      data: {
        ...credential,
        userId: userId,
        password: bcrypt.hashSync(credential.password, this.SALT),
      },
    });
  }

  async createRandomCredential(userId: number) {
    const credential = this.setRandomBuild();
    return await this.prisma.credential.create({
      data: {
        ...credential,
        userId: userId,
        password: bcrypt.hashSync(credential.password, this.SALT),
      },
    });
  }
}
