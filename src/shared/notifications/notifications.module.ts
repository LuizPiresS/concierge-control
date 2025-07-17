import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EMAIL_SERVICE_TOKEN } from './domain/email.service.interface';
import { EmailProcessor } from './infrastructure/jobs/email.processor';
import { emailTransporterProvider } from './infrastructure/providers/email.provider';
import { NodemailerEmailService } from './infrastructure/services/nodemailer-email.service';
// import { SesEmailService } from './infrastructure/services/ses-email.service';

@Module({
  imports: [
    ConfigModule,
    // Registra a fila específica para este módulo
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  providers: [
    EmailProcessor, // O worker que processa os jobs da fila
    emailTransporterProvider,
    {
      provide: EMAIL_SERVICE_TOKEN,
      useClass: NodemailerEmailService, // <-- Usamos nosso novo serviço local
    },
  ],
  exports: [EMAIL_SERVICE_TOKEN],
})
export class NotificationsModule {}
