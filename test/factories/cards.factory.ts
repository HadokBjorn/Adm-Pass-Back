import { PrismaService } from 'src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import Cryptr from 'cryptr';
export class CardsFactory {
  private SALT = 10;
  private Cryptr = require('cryptr');
  private cryptr: Cryptr = new this.Cryptr(process.env.CRYPTR_SECRET, {
    saltLength: this.SALT,
  });

  private title: string;
  private name: string;
  private number: string;
  private cvc: string;
  private expiration: string;
  private password: string;
  private isCredit: boolean;
  private isDebit: boolean;

  constructor(private readonly prisma: PrismaService) {}

  setTitle(title: string) {
    this.title = title;
    return this;
  }

  setRandomTitle() {
    this.title = faker.lorem.word();
    return this;
  }

  setName(name: string) {
    this.name = name;
    return this;
  }

  setRandomName() {
    this.name = faker.person.fullName();
    return this;
  }

  setNumber(number: string) {
    this.number = number;
    return this;
  }

  setRandomNumber() {
    this.number = faker.finance.creditCardNumber();
    return this;
  }

  setCvc(cvc: string) {
    this.cvc = cvc;
    return this;
  }

  setRandomCvc() {
    this.cvc = faker.finance.creditCardCVV();
    return this;
  }

  setExpiration(expiration: string) {
    this.expiration = expiration;
    return this;
  }

  setRandomExpiration() {
    const today = new Date().toISOString();
    this.expiration = faker.date
      .future({
        years: 2,
        refDate: today,
      })
      .toISOString();
    return this;
  }

  setPassword(password: string) {
    this.password = password;
    return this;
  }

  setRandomPassword() {
    this.password = faker.internet.password({
      length: 6,
    });
    return this;
  }
  setIsCredit(credit: boolean) {
    this.isCredit = credit;
    return this;
  }
  setRandomIsCredit() {
    this.isCredit = faker.datatype.boolean({ probability: 0.5 });
    return this;
  }

  setIsDebit(debit: boolean) {
    this.isDebit = debit;
    return this;
  }
  setRandomIsDebit() {
    this.isDebit = faker.datatype.boolean({ probability: 0.5 });
    return this;
  }

  setBuild() {
    return {
      title: this.title,
      name: this.name,
      number: this.number,
      cvc: this.cvc,
      expiration: this.expiration,
      password: this.password,
      isCredit: this.isCredit,
      isDebit: this.isDebit,
    };
  }

  setRandomBuild() {
    const today = new Date().toISOString();
    return {
      title: faker.lorem.word(),
      name: faker.person.fullName(),
      number: faker.finance.creditCardNumber(),
      cvc: faker.finance.creditCardCVV(),
      expiration: faker.date
        .future({
          years: 2,
          refDate: today,
        })
        .toISOString(),
      password: faker.internet.password({
        length: 6,
      }),
      isCredit: faker.datatype.boolean({ probability: 0.5 }),
      isDebit: faker.datatype.boolean({ probability: 0.5 }),
    };
  }

  createCard(userId: number) {
    const card = this.setBuild();
    return this.prisma.card.create({
      data: {
        userId,
        ...card,
        cvc: this.cryptr.encrypt(card.cvc),
        password: this.cryptr.encrypt(card.password),
        expiration: new Date(card.expiration),
      },
    });
  }

  createRandomCard(userId: number) {
    const card = this.setRandomBuild();
    return this.prisma.card.create({
      data: {
        userId,
        ...card,
        cvc: this.cryptr.encrypt(card.cvc),
        password: this.cryptr.encrypt(card.password),
        expiration: new Date(card.expiration),
      },
    });
  }
}
