import { PrismaService } from '../../src/prisma/prisma.service';

export class PrismaUtils {
  static async cleanDb(prisma: PrismaService) {
    await prisma.note.deleteMany();
    await prisma.credential.deleteMany();
    await prisma.user.deleteMany();
  }
}
