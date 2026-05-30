import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider, SendEmailOptions } from './email.interface';

@Injectable()
export class LogEmailProvider implements EmailProvider {
  private readonly logger = new Logger('EmailService');

  async send({ to, subject, html }: SendEmailOptions): Promise<void> {
    this.logger.log(`\n${'─'.repeat(60)}\n📧 EMAIL LOG\nTo: ${to}\nSubject: ${subject}\n${'─'.repeat(60)}\n${html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()}\n${'─'.repeat(60)}`);
  }
}
