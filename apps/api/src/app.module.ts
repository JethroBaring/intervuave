import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from 'nestjs-prisma';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { InterviewsModule } from './interviews/interviews.module';
import { CandidatesModule } from './candidates/candidates.module';
import { CoreValuesModule } from './core-values/core-values.module';
import { TemplatesModule } from './templates/templates.module';
import { FeedbackModule } from './feedback/feedback.module';
import { UploadModule } from './upload/upload.module';
import { MailModule } from './mail/mail.module';
import { PublicModule } from './public/public.module';
import { ResponsesModule } from './responses/responses.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EvaluationsModule } from "./evaluations/evaluations.module";
import { CommonModule } from "./common/common.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule.forRootAsync({
      isGlobal: true,
      useFactory: () => ({
        prismaOptions: {
          log: ['info', 'query'],
        },
        explicitConnect: false,
      }),
    }),
    MailModule,
    UsersModule,
    AuthModule,
    CompaniesModule,
    InterviewsModule,
    CandidatesModule,
    CoreValuesModule,
    TemplatesModule,
    FeedbackModule,
    UploadModule,
    PublicModule,
    ResponsesModule,
    EvaluationsModule,
    CommonModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
