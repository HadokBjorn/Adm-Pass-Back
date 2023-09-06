import { Injectable } from '@nestjs/common';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Credential } from '@prisma/client';

@Injectable()
export class CredentialsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCredentialDto: Omit<Credential, 'id'>) {
    return await this.prisma.credential.create({
      data: createCredentialDto,
      select: {
        id: true,
        userId: true,
        title: true,
        url: true,
        username: true,
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
  findByTitle(title: string, userId: number) {
    return this.prisma.credential.findUnique({
      where: {
        title_userId: { title, userId },
      },
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

  deleteByUserId(userId: number) {
    return this.prisma.credential.deleteMany({
      where: { userId },
    });
  }
}
