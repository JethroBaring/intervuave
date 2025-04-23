// src/common/common.module.ts
import { Module, Global } from '@nestjs/common';
import { GeminiService } from './google-gemini.service';
import { GoogleStorageService } from './google-storage.service';
import { ProcessingWorkerService } from './processing-worker.service';
import { EvaluationWorkerService } from "./evaluation-worker.service";
import { GoogleTasksService } from "./google-tasks.service";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "nestjs-prisma";
// Import ConfigService if it's not already globally available
// import { ConfigService } from '@nestjs/config';

// Use @Global() if you want these services available everywhere
// without importing CommonModule into every feature module.
// Remove @Global() if you prefer explicit imports in feature modules.
@Global()
@Module({
  providers: [
    GeminiService,
    GoogleStorageService,
    ProcessingWorkerService,
    EvaluationWorkerService,
    GoogleTasksService,
    ConfigService,
    // ConfigService, // Only if not globally provided by ConfigModule.forRoot({ isGlobal: true })
  ],
  exports: [
    // Export the services you want other modules to be able to inject
    GeminiService,
    GoogleStorageService,
    ProcessingWorkerService,
    EvaluationWorkerService,
    GoogleTasksService,
    // ConfigService, // Only if needed and provided here
  ],
})
export class CommonModule {}