import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { Transporter } from 'nodemailer';
import { SendMailOptions } from '../../domain/email.service.interface';
import { getEmailTemplate } from '../../templates';
import { EMAIL_TRANSPORTER_TOKEN } from '../providers/email.provider';

/**
 * Este é o "worker" da fila de e-mails.
 * Ele escuta por novos trabalhos na 'email-queue' e os processa.
 */
@Processor('email-queue')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @Inject(EMAIL_TRANSPORTER_TOKEN)
    private readonly transporter: Transporter,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Este método é chamado automaticamente pelo Bull quando um trabalho
   * com o nome 'send-mail-job' é adicionado à fila.
   */
  @Process('send-mail-job')
  async handleSendMail(job: Job<SendMailOptions>): Promise<void> {
    const { data: options } = job;
    // CORREÇÃO: Converte `job.id` para string para satisfazer a regra do linter.
    this.logger.log(
      `Processing job ${String(job.id)}: Sending email to ${options.to}`,
    );

    const htmlBody = getEmailTemplate(options.template, options.context);
    const mailFrom = this.configService.get<string>('MAIL_FROM');

    try {
      await this.transporter.sendMail({
        from: mailFrom,
        to: options.to,
        subject: options.subject,
        html: htmlBody,
      });
      this.logger.log(
        `Job ${String(job.id)} completed: Email sent to ${options.to}`,
      );
    } catch (error) {
      // CORREÇÃO: Trata o erro de forma segura, verificando seu tipo antes de acessar propriedades.
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Job ${String(job.id)} failed for ${options.to}: ${errorMessage}`,
        stack,
      );
      // Relançar o erro é importante para que o Bull possa tentar novamente.
      throw error;
    }
  }
}
