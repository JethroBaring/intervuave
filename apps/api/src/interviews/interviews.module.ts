import { Module } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { InterviewsController } from './interviews.controller';
import { MailService } from 'src/mail/mail.service';
import { CryptoService } from 'src/common/crypto.service';
import { GoogleTasksService } from 'src/common/google-tasks.service';
import { GoogleStorageService } from 'src/common/google-storage.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [InterviewsController],
  providers: [
    InterviewsService,
    MailService,
    CryptoService,
    GoogleTasksService,
    GoogleStorageService,
    ConfigService,
  ],
})
export class InterviewsModule {}
