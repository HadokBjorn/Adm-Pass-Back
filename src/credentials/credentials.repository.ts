import { Injectable } from '@nestjs/common';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Credential } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CredentialsRepository {
  private SALT = 10;
  constructor(private readonly prisma: PrismaService) {}

  async create(createCredentialDto: Omit<Credential, 'id'>) {
    return await this.prisma.credential.create({
      data: {
        ...createCredentialDto,
        password: bcrypt.hashSync(createCredentialDto.password, this.SALT),
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.credential.findMany({
      where: { userId },
    });
  }

  findOne(id: number) {
    return this.prisma.credential.findFirst({
      where: { id },
    });
  }
  findByTitle(title: string) {
    return this.prisma.credential.findUnique({
      where: { title },
    });
  }

  update(id: number, updateCredentialDto: UpdateCredentialDto, userId: number) {
    return this.prisma.credential.update({
      where: { id, userId },
      data: updateCredentialDto,
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.credential.delete({
      where: { id, userId },
    });
  }
}
