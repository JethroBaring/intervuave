import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { GeminiService } from './google-gemini.service';
import { GoogleStorageService } from './google-storage.service';
import { GoogleTasksService } from './google-tasks.service';

@Module({
  providers: [
    GoogleStorageService,
    GeminiService,
    CryptoService,
    GoogleTasksService,
  ],
  exports: [
    GoogleStorageService,
    GeminiService,
    CryptoService,
    GoogleTasksService,
  ],
})
export class CommonModule {}
