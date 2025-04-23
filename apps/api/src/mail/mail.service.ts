/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}

  async sendMail(data: {
    candidateName: string;
    candidateEmail: string;
    companyName: string;
    roleName: string;
    interviewLink: string;
  }) {
    const template = fs.readFileSync(
      `./src/mail/email-templates/interview-link.hbs`,
      'utf-8',
    );
    const compiledTemplate = handlebars.compile(template);

    const html = compiledTemplate(data);

    try {
      const result = await this.mailService.sendMail({
        from: 'Intervuave <intervuave@gmail.com>',
        to: data.candidateEmail,
        subject: `${data.companyName} Interview Invitation for ${data.roleName}`,
        html: html,
      });

      return result;
    } catch (error: any) {
      throw new Error('Error sending email: ' + error);
    }
  }

  async sendReminderMail(data: {
    candidateName: string;
    candidateEmail: string;
    companyName: string;
    roleName: string;
    interviewLink: string;
  }) {
    const template = fs.readFileSync(
      `./src/mail/email-templates/reminder.hbs`,
      'utf-8',
    );
    const compiledTemplate = handlebars.compile(template);

    const html = compiledTemplate(data);

    try {
      const result = await this.mailService.sendMail({
        from: 'Intervuave <intervuave@gmail.com>',
        to: data.candidateEmail,
        subject: `Reminder: ${data.companyName} Interview for ${data.roleName}`,
        html: html,
      });

      return result;
    } catch (error: any) {
      throw new Error('Error sending reminder email: ' + error);
    }
  }
}
