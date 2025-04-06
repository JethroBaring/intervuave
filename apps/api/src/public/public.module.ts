import { Module } from '@nestjs/common';

import { CryptoService } from 'src/common/crypto.service';
import { PublicInterviewController } from './interview/public-interview.controller';
import { PublicInterviewService } from './interview/public-interview.service';

@Module({
  controllers: [PublicInterviewController],
  providers: [PublicInterviewService, CryptoService],
})
export class PublicModule {}
