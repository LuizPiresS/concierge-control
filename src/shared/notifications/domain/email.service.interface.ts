/**
 * Define a estrutura de dados para o envio de um e-mail.
 */
export interface SendMailOptions {
  to: string;
  subject: string;
  template: string; // O nome do template a ser usado (ex: 'welcome-email')
  context: Record<string, any>; // Dados a serem injetados no template (ex: { name: 'John', password: '123' })
}

/**
 * Token para injeção de dependência do serviço de e-mail.
 */
export const EMAIL_SERVICE_TOKEN = Symbol('IEmailService');

export interface IEmailService {
  sendMail(options: SendMailOptions): Promise<void>;
}
