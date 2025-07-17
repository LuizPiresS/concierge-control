import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import {
  IEmailService,
  SendMailOptions,
} from '../../domain/email.service.interface';

/**
 * Esta implementação do IEmailService atua como um "produtor" para a fila de e-mails.
 * Sua única responsabilidade é adicionar um trabalho (job) à fila do Bull, em vez de
 * enviar o e-mail diretamente. Isso torna a API mais rápida e o sistema mais robusto.
 */
@Injectable()
export class NodemailerEmailService implements IEmailService {
  private readonly logger = new Logger(NodemailerEmailService.name);

  constructor(
    // Injeta a fila de e-mails registrada no NotificationsModule.
    @InjectQueue('email-queue') private readonly emailQueue: Queue,
  ) {}

  /**
   * Adiciona um trabalho para enviar um e-mail à fila de processamento.
   * @param options As opções do e-mail a ser enviado.
   */
  async sendMail(options: SendMailOptions): Promise<void> {
    try {
      // Adiciona o job à fila. O nome 'send-mail-job' é o que o processador
      // (EmailProcessor) irá escutar.
      await this.emailQueue.add('send-mail-job', options, {
        attempts: 3, // Tenta reenviar até 3 vezes em caso de falha do worker.
        backoff: {
          type: 'exponential',
          delay: 5000, // Espera 5 segundos antes da primeira retentativa.
        },
        removeOnComplete: true, // Remove o job da fila após o sucesso.
        removeOnFail: false, // Mantém o job na fila em caso de falha para inspeção.
      });

      this.logger.log(`Job to send email to ${options.to} added to queue.`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to add email job for ${options.to} to the queue: ${errorMessage}`,
        stack,
      );
      // Importante: A falha aqui significa que não foi possível se comunicar com o Redis.
      // Optamos por apenas logar o erro e não relançá-lo para não quebrar a
      // requisição principal do usuário (ex: criação de condomínio).
    }
  }
}
