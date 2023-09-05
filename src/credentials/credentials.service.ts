import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { CredentialsRepository } from './credentials.repository';
import { User } from '@prisma/client';
import Cryptr from 'cryptr';

@Injectable()
export class CredentialsService {
  private SALT = 10;
  private Cryptr = require('cryptr');
  private cryptr: Cryptr = new this.Cryptr(process.env.CRYPTR_SECRET, {
    saltLength: this.SALT,
  });
  constructor(private readonly repository: CredentialsRepository) {}

  async create(createCredentialDto: CreateCredentialDto, user: User) {
    const title = await this.repository.findByTitle(
      createCredentialDto.title,
      user.id,
    );
    if (title) {
      throw new ConflictException('Title of credential already exist');
    }

    const body = {
      ...createCredentialDto,
      userId: user.id,
      password: this.cryptr.encrypt(createCredentialDto.password),
    };

    return await this.repository.create(body);
  }

  async findAll(userId: number) {
    const credentials = await this.repository.findAll(userId);
    const credentialsWithPass = credentials.map((credential) => ({
      ...credential,
      password: this.cryptr.decrypt(credential.password),
    }));

    return credentialsWithPass;
  }

  async findOne(id: number, userId: number) {
    const credential = await this.repository.findOne(id);
    if (!credential) {
      throw new NotFoundException('Credential not exist');
    }
    if (credential.userId !== userId) {
      throw new ForbiddenException('this credential does not belong to you');
    }
    return {
      ...credential,
      password: this.cryptr.decrypt(credential.password),
    };
  }

  async update(
    id: number,
    updateCredentialDto: UpdateCredentialDto,
    userId: number,
  ) {
    const credential = await this.repository.findOne(id);
    if (!credential) {
      throw new NotFoundException('Credential not exist');
    }
    if (credential.userId !== userId) {
      throw new ForbiddenException('this credential does not belong to you');
    }
    return await this.repository.update(id, updateCredentialDto, userId);
  }

  async remove(id: number, userId: number) {
    const credential = await this.repository.findOne(id);
    if (!credential) {
      throw new NotFoundException('Credential not exist');
    }
    if (credential.userId !== userId) {
      throw new ForbiddenException('this credential does not belong to you');
    }
    return await this.repository.remove(id, userId);
  }
}
