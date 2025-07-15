import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { Condominium } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';
import { PasswordGeneratorService } from '../../../../../shared/utils/password-generator.service';
import { PrismaService } from '../../../../../infrastructure/database/prisma/prisma.service';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { CreateCondominiumDto } from '../../../presentation/http/dtos/create-condominium.dto';

export type CreateCondominiumResponse = {
  condominium: Condominium;
  managerInitialPassword: string;
};

type Request = CreateCondominiumDto;

@Injectable()
export class CreateCondominiumUseCase
  implements IUseCase<Request, CreateCondominiumResponse>
{
  private readonly logger = new Logger(CreateCondominiumUseCase.name);
  private readonly saltRounds = 10;

  constructor(
    @Inject(CONDOMINIUM_REPOSITORY_TOKEN)
    private readonly condominiumRepository: ICondominiumRepository,
    private readonly passwordGenerator: PasswordGeneratorService,
    private readonly prisma: PrismaService, // Injetado para usar transações
  ) {}

  async execute(request: Request): Promise<CreateCondominiumResponse> {
    const { managerEmail, ...condominiumData } = request;

    // 1. Verifica se o condomínio (por CNPJ) já existe
    const existingCondominium = await this.condominiumRepository.findByCnpj(
      condominiumData.cnpj,
    );
    if (existingCondominium) {
      throw new ConflictException(
        'A condominium with this CNPJ already exists.',
      );
    }

    // 2. Executa a criação do condomínio e do usuário em uma transação
    try {
      let temporaryPassword = '';

      const newCondominium = await this.prisma.$transaction(async (tx) => {
        // Passo A: Verifica se o e-mail do síndico já está em uso usando o cliente da transação.
        const existingUser = await tx.user.findUnique({
          where: { email: managerEmail },
        });
        if (existingUser) {
          throw new ConflictException('Este e-mail de síndico já está em uso.');
        }

        // Passo B: Cria o condomínio dentro da transação.
        const createdCondo = await tx.condominium.create({
          data: condominiumData,
        });

        // Passo C: Gera e criptografa uma senha temporária para o síndico.
        temporaryPassword = this.passwordGenerator.generate();
        const hashedPassword = await bcrypt.hash(
          temporaryPassword,
          this.saltRounds,
        );

        // Passo D: Cria o usuário síndico, associando-o ao condomínio recém-criado.
        await tx.user.create({
          data: {
            email: managerEmail,
            password: hashedPassword,
            condominium: {
              connect: { id: createdCondo.id },
            },
          },
        });

        this.logger.log(
          `Manager user created for condominium ${createdCondo.id}`,
        );
        // TODO: Enviar um e-mail de boas-vindas para o síndico com a senha temporária.
        // Ex: await this.notificationService.sendWelcomeEmail(managerEmail, temporaryPassword);
        this.logger.log(
          `Temporary password for ${managerEmail}: ${temporaryPassword}`,
        );

        return createdCondo;
      });

      return {
        condominium: newCondominium,
        managerInitialPassword: temporaryPassword,
      };
    } catch (error) {
      this.logger.error(
        'Transaction failed when creating condominium and manager user',
        error,
      );
      // Se o erro for de e-mail duplicado vindo do createUserUseCase, relance-o
      if (error instanceof ConflictException) {
        throw error;
      }
      // Para outros erros, lance um erro genérico
      throw new Error('Failed to create condominium and initial manager user.');
    }
  }
}
