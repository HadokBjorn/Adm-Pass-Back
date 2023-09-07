import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { User as UserPrisma } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiTags('Credentials')
@ApiBearerAuth()
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  @ApiOperation({ description: 'Create a credential' })
  @ApiCreatedResponse({ description: 'created credential' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'The credential title already exist by user',
  })
  create(
    @Body() createCredentialDto: CreateCredentialDto,
    @User() user: UserPrisma,
  ) {
    return this.credentialsService.create(createCredentialDto, user);
  }

  @Get()
  @ApiOperation({ description: 'Get all credentials' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all user credentials',
  })
  findAll(@User() user: UserPrisma) {
    const { id } = user;
    return this.credentialsService.findAll(id);
  }

  @Get(':id')
  @ApiOperation({ description: 'Get one credentials' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return a user credentials by id',
  })
  findOne(@Param('id') id: string, @User() user: UserPrisma) {
    return this.credentialsService.findOne(+id, user.id);
  }

  @Put(':id')
  @ApiOperation({ description: 'Update a credential by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'updated credential',
  })
  @ApiBody({ type: CreateCredentialDto })
  update(
    @Param('id') id: string,
    @Body() updateCredentialDto: UpdateCredentialDto,
    @User() user: UserPrisma,
  ) {
    return this.credentialsService.update(+id, updateCredentialDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ description: 'Delete a credential by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delete a user credential',
  })
  remove(@Param('id') id: string, @User() user: UserPrisma) {
    return this.credentialsService.remove(+id, user.id);
  }
}
