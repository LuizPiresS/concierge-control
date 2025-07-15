import { Global, Module } from '@nestjs/common';
import { PasswordGeneratorService } from './utils/password-generator.service';
import { AWSModule } from './aws/aws.module';

/**
 * O SharedModule agrupa provedores e módulos que são usados em toda a aplicação.
 *
 * @Global() - Este decorador torna o módulo global. Uma vez importado no AppModule (módulo raiz),
 * todos os seus provedores exportados estarão disponíveis em toda a aplicação sem a
 * necessidade de importar o SharedModule em cada módulo de funcionalidade.
 * Isso é útil para serviços utilitários como o PasswordGeneratorService.
 */
@Global()
@Module({
  imports: [
    // O AWSModule já é global, mas importá-lo aqui mantém a clareza de que
    // os serviços da AWS fazem parte do "contexto compartilhado" da aplicação.
    AWSModule,
  ],
  providers: [
    // Declaramos o PasswordGeneratorService para que o NestJS possa gerenciá-lo
    // e injetá-lo em outros serviços.
    PasswordGeneratorService,
  ],
  exports: [
    // Exportamos o PasswordGeneratorService para que outros módulos
    // (que importam o SharedModule, ou automaticamente por ser @Global)
    // possam injetá-lo.
    PasswordGeneratorService,
  ],
})
export class SharedModule {}
