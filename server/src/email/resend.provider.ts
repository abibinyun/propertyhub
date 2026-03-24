import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider, SendEmailOptions } from './email.interface';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private readonly logger = new Logger('ResendEmailProvider');
  private readonly apiKey: string;
  private readonly from: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('RESEND_API_KEY', '');
    this.from = this.config.get<string>('EMAIL_FROM', 'PropertyHub <noreply@propertyhub.id>');
  }

  async send({ to, subject, html }: SendEmailOptions): Promise<void> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, to, subject, html }),
    });
    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Resend error: ${err}`);
      throw new Error(`Failed to send email: ${err}`);
    }
  }
}
