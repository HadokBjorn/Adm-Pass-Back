import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardsRepository } from './cards.repository';
import Cryptr from 'cryptr';

@Injectable()
export class CardsService {
  private SALT = 10;
  private Cryptr = require('cryptr');
  private cryptr: Cryptr = new this.Cryptr(process.env.CRYPTR_SECRET, {
    saltLength: this.SALT,
  });
  constructor(private readonly repository: CardsRepository) {}

  async create(createCardDto: CreateCardDto, userId: number) {
    const title = await this.repository.findByTitle(
      createCardDto.title,
      userId,
    );
    if (title) {
      throw new ConflictException('Title of Card already exist');
    }
    const card = {
      userId,
      ...createCardDto,
      expiration: new Date(createCardDto.expiration),
      cvc: this.cryptr.encrypt(createCardDto.cvc),
      password: this.cryptr.encrypt(createCardDto.password),
    };
    return await this.repository.create(card);
  }

  async findAll(userId: number) {
    const cards = await this.repository.findAll(userId);

    const cardsDecrypt = cards.map((card) => ({
      ...card,
      cvc: this.cryptr.decrypt(card.cvc),
      password: this.cryptr.decrypt(card.password),
    }));

    return cardsDecrypt;
  }

  async findOne(id: number, userId: number) {
    const card = await this.repository.findOne(id);
    if (!card) {
      throw new NotFoundException('Card not exist or not found');
    }
    if (card.userId !== userId) {
      throw new ForbiddenException('this Card does not belong to you');
    }
    return {
      ...card,
      cvc: this.cryptr.decrypt(card.cvc),
      password: this.cryptr.decrypt(card.password),
    };
  }

  async update(id: number, updateCardDto: UpdateCardDto, userId: number) {
    const card = await this.repository.findOne(id);
    if (!card) {
      throw new NotFoundException('Card not exist or not found');
    }
    if (card.userId !== userId) {
      throw new ForbiddenException('this Card does not belong to you');
    }
    return await this.repository.update(id, updateCardDto);
  }

  async remove(id: number, userId: number) {
    const card = await this.repository.findOne(id);
    if (!card) {
      throw new NotFoundException('Card not exist or not found');
    }
    if (card.userId !== userId) {
      throw new ForbiddenException('this Card does not belong to you');
    }
    return await this.repository.remove(id);
  }
}
