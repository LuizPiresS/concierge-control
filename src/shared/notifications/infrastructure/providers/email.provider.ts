import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Options as SmtpOptions } from 'nodemailer/lib/smtp-transport';

export const EMAIL_TRANSPORTER_TOKEN = Symbol('EmailTransporter');

export const emailTransporterProvider: Provider = {
  provide: EMAIL_TRANSPORTER_TOKEN,
  useFactory: (configService: ConfigService) => {
    const logger = new Logger('EmailProvider(Local)');

    const host = configService.get<string>('MAIL_HOST');
    const port = configService.get<number>('MAIL_PORT');
    const user = configService.get<string>('MAIL_USER');
    const pass = configService.get<string>('MAIL_PASS');

    const isSecure = port === 465; // Port 465 is typically SSL.
    const hasAuth = user && pass;

    logger.log(
      `Configuring Nodemailer -> host=${String(host)}, port=${String(
        port,
      )}, secure=${String(isSecure)}, auth=${hasAuth ? 'yes' : 'no'}`,
    );

    const transportOptions: SmtpOptions = {
      host,
      port,
      secure: isSecure,
    };

    if (hasAuth) {
      transportOptions.auth = {
        user,
        pass,
      };
    }

    return nodemailer.createTransport(transportOptions);
  },
  inject: [ConfigService],
};
