import { Injectable } from '@nestjs/common';
import { CreateEraseDto } from './dto/create-erase.dto';
import { UsersService } from '../users/users.service';
import { CredentialsService } from '../credentials/credentials.service';
import { CardsService } from '../cards/cards.service';
import { NotesService } from '../notes/notes.service';
import { User } from '@prisma/client';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class EraseService {
  constructor(
    private readonly userService: UsersService,
    private readonly credentialService: CredentialsService,
    private readonly noteService: NotesService,
    private readonly cardService: CardsService,
    private readonly authService: AuthService,
  ) {}

  async remove(createEraseDto: CreateEraseDto, user: User) {
    const { password } = createEraseDto;

    await this.authService.signIn({ email: user.email, password });
    await this.credentialService.deleteByUserId(user.id);
    await this.noteService.deleteByUserId(user.id);
    await this.cardService.deleteByUserId(user.id);

    return await this.userService.deleteUser(user.id);
  }
}
