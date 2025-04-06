/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CryptoService } from 'src/common/crypto.service';

@Injectable()
export class PublicInterviewService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly secret =
    process.env.CRYPTO_SECRET || 'default_32_characters_key';
  private readonly ivLength = 16;

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
  ) {}

  async accessInterview(token: string) {
    try {
      const decrypted = this.crypto.decrypt(decodeURIComponent(token));
      const { id, expiresAt } = JSON.parse(decrypted);

      if (new Date() > new Date(expiresAt)) {
        return { valid: false, reason: 'expired' };
      }

      const interview = await this.prisma.interview.findUnique({
        where: { id },
        include: {
          candidate: true,
          role: {
            include: {
              interviewTemplate: {
                include: {
                  questions: true,
                },
              },
            },
          },
        },
      });

      if (!interview) {
        return { valid: false, reason: 'invalid' };
      }

      return { valid: true, interview };
    } catch (err: any) {
      console.log(err);
      return { valid: false, reason: 'invalid' };
    }
  }
}
