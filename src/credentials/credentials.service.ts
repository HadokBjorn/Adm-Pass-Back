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

@Injectable()
export class CredentialsService {
  constructor(private readonly repository: CredentialsRepository) {}

  async create(createCredentialDto: CreateCredentialDto, user: User) {
    const title = await this.repository.findByTitle(createCredentialDto.title);
    if (title) {
      throw new ConflictException('Title of credential already exist');
    }

    const body = {
      ...createCredentialDto,
      userId: user.id,
    };

    return await this.repository.create(body);
  }

  async findAll(userId: number) {
    return await this.repository.findAll(userId);
  }

  async findOne(id: number, userId: number) {
    const credential = await this.repository.findOne(id);
    if (!credential) {
      throw new NotFoundException('Credential not exist');
    }
    if (credential.userId !== userId) {
      throw new ForbiddenException('this credential does not belong to you');
    }
    return credential;
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
