import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Condominium } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';
import { PasswordGeneratorService } from '../../../../../shared/utils/password-generator.service';
// A dependência direta do PrismaService foi removida.
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { CreateCondominiumDto } from '../../../presentation/http/dtos/create-condominium.dto';
import {
  EMAIL_SERVICE_TOKEN,
  IEmailService,
} from '../../../../../shared/notifications/domain/email.service.interface';

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
    @Inject(EMAIL_SERVICE_TOKEN)
    private readonly emailService: IEmailService,
    private readonly passwordGenerator: PasswordGeneratorService,
  ) {}

  async execute(request: Request): Promise<CreateCondominiumResponse> {
    const { managerEmail, ...condominiumData } = request;

    // 1. As validações de negócio preliminares permanecem no caso de uso.
    const existingByCnpj = await this.condominiumRepository.findByCnpj(
      condominiumData.cnpj,
    );
    if (existingByCnpj) {
      throw new ConflictException(
        'A condominium with this CNPJ already exists.',
      );
    }

    if (condominiumData.email) {
      const existingByEmail = await this.condominiumRepository.findByEmail(
        condominiumData.email,
      );
      if (existingByEmail) {
        throw new ConflictException(
          'A condominium with this contact email already exists.',
        );
      }
    }

    // 2. Prepara os dados necessários para a criação.
    const temporaryPassword = this.passwordGenerator.generate();
    const hashedPassword = await bcrypt.hash(
      temporaryPassword,
      this.saltRounds,
    );

    let newCondominium: Condominium;

    // 3. Executa a criação delegando a lógica transacional para o repositório.
    try {
      // O método `createWithManager` agora encapsula a transação do Prisma.
      newCondominium = await this.condominiumRepository.createWithManager(
        condominiumData,
        { email: managerEmail, hashedPassword },
      );
    } catch (dbError) {
      const stack = dbError instanceof Error ? dbError.stack : String(dbError);
      this.logger.error(
        `[Transaction Failed] Could not create condominium or manager for CNPJ: ${condominiumData.cnpj}`,
        stack,
      );
      // O repositório já lança ConflictException, então apenas a repassamos.
      if (dbError instanceof ConflictException) {
        throw dbError;
      }
      // Para outros erros, lançamos um erro de servidor mais informativo.
      throw new InternalServerErrorException(
        'An internal error occurred while creating the condominium.',
      );
    }

    // 4. A operação de efeito colateral (e-mail) ocorre após o sucesso da transação.
    try {
      await this.emailService.sendMail({
        to: managerEmail,
        subject: `Bem-vindo ao Concierge Control, ${newCondominium.name}!`,
        template: 'welcome-email',
        context: {
          name: newCondominium.name,
          managerEmail,
          password: temporaryPassword,
        },
      });
    } catch (emailError) {
      const stack =
        emailError instanceof Error ? emailError.stack : String(emailError);
      // O comportamento de não relançar o erro de e-mail está mantido.
      this.logger.error(
        `[EMAIL-FAILURE] Condominium/manager created, but welcome email failed for ${managerEmail}.`,
        stack,
      );
      // Adicionamos um log extra para capturar mais detalhes do erro.
      this.logger.error(
        `[EMAIL-FAILURE-DETAILS]`,
        JSON.stringify(emailError, null, 2),
      );
    }

    // 5. Retorna a resposta de sucesso.
    return {
      condominium: newCondominium,
      managerInitialPassword: temporaryPassword,
    };
  }
}
