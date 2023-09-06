import { PrismaService } from 'src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
export class NotesFactory {
  private title: string;
  private text: string;

  constructor(private readonly prisma: PrismaService) {}

  setTitle(title: string) {
    this.title = title;
    return this;
  }

  setRandomTitle() {
    this.title = faker.lorem.word();
    return this;
  }

  setText(text: string) {
    this.text = text;
    return this;
  }

  setRandomText() {
    this.text = faker.lorem.sentence({ min: 3, max: 5 });
    return this;
  }

  setBuild() {
    return {
      title: this.title,
      text: this.text,
    };
  }

  setRandomBuild() {
    this.setRandomTitle();
    this.setRandomText();
    const note = this.setBuild();
    return note;
  }

  async createNote(userId: number) {
    const note = this.setBuild();
    return await this.prisma.note.create({
      data: {
        userId,
        ...note,
      },
    });
  }

  async createRandomNote(userId: number) {
    const note = this.setRandomBuild();
    return await this.prisma.note.create({
      data: {
        userId,
        ...note,
      },
    });
  }
}
