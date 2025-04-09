/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  SchemaType,
  GenerateContentRequest,
  Tool,
} from '@google/generative-ai';

// Define the expected structure of the function call arguments
interface CulturalFitEvaluation {
  perQuestionResults?: Record<
    string,
    {
      cultureFitComposite?: {
        valuesFit?: Record<string, number>;
        missionAlignment?: number;
        visionAlignment?: number;
        cultureFit?: number;
      };
      feedback?: string;
    }
  >;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        this.logger.error('GEMINI_API_KEY environment variable is not set.');
        this.genAI = undefined as any;
        return;
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      this.logger.error('Error initializing Gemini API:', error);
      this.genAI = undefined as any;
    }
  }

  async evaluateWithGemini(cleanedData: any) {
    if (!this.genAI) {
      this.logger.error('Gemini API client is not initialized.');
      return null;
    }

    const { responses, companyProfile } = cleanedData;
    const {
      coreValues: companyCoreValues,
      mission,
      vision,
      culture,
    } = companyProfile;

    const prompt = `
      You are an expert cultural fit evaluator for hiring purposes.

      For each candidate response, evaluate how well their answer aligns with:
      - Each of the assigned Core Values (based on the company's definitions provided).
      - One of Mission, Vision, or Culture (based on what the question is aligned with).

      Return a JSON object with a "perQuestionResults" field, using the provided function schema.

      Company Core Value Definitions:
      ${JSON.stringify(companyCoreValues, null, 2)}

      Candidate Responses:
      ${JSON.stringify(responses, null, 2)}

      Use the company's provided Core Value definitions, Mission ("${mission}"), Vision ("${vision}"), and Culture ("${culture}") when reasoning.
      Score consistently: 1.0 means perfect fit, 0.0 means no alignment.
      `.trim();

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const functionSchema = {
      name: 'returnCulturalFitEvaluation',
      description: 'Returns cultural fit evaluation per question',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          perQuestionResults: {
            type: SchemaType.ARRAY,
            description: 'List of results per question',
            items: {
              type: SchemaType.OBJECT,
              properties: {
                questionId: {
                  type: SchemaType.STRING,
                  description: 'The ID of the question',
                },
                questionText: {
                  type: SchemaType.STRING,
                  description: 'The text of the question',
                },
                cultureFitComposite: {
                  type: SchemaType.OBJECT,
                  properties: {
                    valuesFit: {
                      type: SchemaType.ARRAY,
                      description: 'Array of core value scores',
                      items: {
                        type: SchemaType.OBJECT,
                        properties: {
                          coreValue: {
                            type: SchemaType.STRING,
                            description: 'Name of the core value',
                          },
                          score: {
                            type: SchemaType.NUMBER,
                            description: 'Score from 0.0 to 1.0',
                          },
                        },
                        required: ['coreValue', 'score'],
                      },
                    },
                    missionAlignment: {
                      type: SchemaType.NUMBER,
                      description: 'Alignment with mission (0.0 to 1.0)',
                    },
                    visionAlignment: {
                      type: SchemaType.NUMBER,
                      description: 'Alignment with vision (0.0 to 1.0)',
                    },
                    cultureFit: {
                      type: SchemaType.NUMBER,
                      description: 'Alignment with culture (0.0 to 1.0)',
                    },
                  },
                  required: ['valuesFit'],
                },
                feedback: {
                  type: SchemaType.STRING,
                  description: 'Brief feedback for the question',
                },
              },
              required: ['questionId', 'cultureFitComposite', 'feedback'],
            },
          },
        },
        required: ['perQuestionResults'],
      },
    };

    const generateContentRequest: GenerateContentRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      tools: [
        {
          functionDeclarations: [functionSchema],
        } as Tool,
      ],
    };

    try {
      const result = await model.generateContent(generateContentRequest);
      const response = result.response;
      const candidates = response.candidates || [];

      if (!candidates.length || !candidates[0]?.content?.parts?.length) {
        this.logger.error('Gemini returned empty evaluation.');
        return null;
      }

      const functionCall = candidates[0].content.parts[0]?.functionCall;
      if (!functionCall || !functionCall.args) {
        this.logger.error('Gemini function call missing.');
        return null;
      }

      try {
        const parsedArgs = functionCall.args as CulturalFitEvaluation;
        return parsedArgs;
      } catch (error) {
        this.logger.error(
          'Failed to parse Gemini function call arguments:',
          error,
        );
        return null;
      }
    } catch (error) {
      this.logger.error('Error during Gemini evaluation:', error);
      return null;
    }
  }

  async selfCritique(
    initialEvaluation: any,
  ): Promise<CulturalFitEvaluation | null> {
    if (!this.genAI) {
      this.logger.error('Gemini API client is not initialized.');
      return null;
    }

    const critiquePrompt = `
      You are a self-critic. Review the following evaluation result based on the expected schema. If there are any mistakes, inconsistencies, or errors, correct them to strictly adhere to the schema. Otherwise, return the corrected JSON using the function call.
      
      Expected JSON Schema:
      \`\`\`json
      {
        "perQuestionResults": [
          {
            "questionId": "string",
            "questionText": "string",
            "cultureFitComposite": {
              "valuesFit": [
                {
                  "coreValue": "string",
                  "score": number
                }
              ],
              "missionAlignment": number,
              "visionAlignment": number,
              "cultureFit": number
            },
            "feedback": "string"
          }
        ]
      }
      \`\`\`
      
      Evaluation JSON:
      ${JSON.stringify(initialEvaluation)}
      
    You must return the corrected JSON by making a function call to 'returnCulturalFitEvaluation' and populating its arguments according to the function schema.
  `.trim();

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const functionSchema = {
      name: 'returnCulturalFitEvaluation',
      description: 'Returns cultural fit evaluation per question',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          perQuestionResults: {
            type: SchemaType.ARRAY,
            description: 'List of results per question',
            items: {
              type: SchemaType.OBJECT,
              properties: {
                questionId: {
                  type: SchemaType.STRING,
                  description: 'The ID of the question',
                },
                questionText: {
                  type: SchemaType.STRING,
                  description: 'The text of the question',
                },
                cultureFitComposite: {
                  type: SchemaType.OBJECT,
                  properties: {
                    valuesFit: {
                      type: SchemaType.ARRAY,
                      description: 'Array of core value scores',
                      items: {
                        type: SchemaType.OBJECT,
                        properties: {
                          coreValue: {
                            type: SchemaType.STRING,
                            description: 'Name of the core value',
                          },
                          score: {
                            type: SchemaType.NUMBER,
                            description: 'Score from 0.0 to 1.0',
                          },
                        },
                        required: ['coreValue', 'score'],
                      },
                    },
                    missionAlignment: {
                      type: SchemaType.NUMBER,
                      description: 'Alignment with mission (0.0 to 1.0)',
                    },
                    visionAlignment: {
                      type: SchemaType.NUMBER,
                      description: 'Alignment with vision (0.0 to 1.0)',
                    },
                    cultureFit: {
                      type: SchemaType.NUMBER,
                      description: 'Alignment with culture (0.0 to 1.0)',
                    },
                  },
                  required: ['valuesFit'],
                },
                feedback: {
                  type: SchemaType.STRING,
                  description: 'Brief feedback for the question',
                },
              },
              required: [
                'questionId',
                'questionText',
                'cultureFitComposite',
                'feedback',
              ],
            },
          },
        },
        required: ['perQuestionResults'],
      },
    };

    const generateContentRequest: GenerateContentRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: critiquePrompt }],
        },
      ],
      tools: [
        {
          functionDeclarations: [functionSchema],
        } as Tool,
      ],
    };

    try {
      const result = await model.generateContent(generateContentRequest);
      const response = result.response;
      const candidates = response.candidates || [];

      if (!candidates.length || !candidates[0]?.content?.parts?.length) {
        this.logger.warn('Gemini self-critique returned empty content.');
        return initialEvaluation;
      }

      const functionCall = candidates[0].content.parts[0]?.functionCall;
      if (!functionCall || !functionCall.args) {
        this.logger.warn('Gemini self-critique function call missing.');
        return initialEvaluation;
      }

      try {
        const parsedArgs =
          typeof functionCall.args === 'string'
            ? (JSON.parse(functionCall.args as string) as CulturalFitEvaluation)
            : (functionCall.args as unknown as CulturalFitEvaluation);

        return parsedArgs;
      } catch (err) {
        this.logger.error(
          'Failed to parse Gemini self-critique function call arguments',
          err,
        );
        return initialEvaluation;
      }
    } catch (error) {
      this.logger.error('Error during Gemini self-critique:', error);
      return initialEvaluation;
    }
  }
}
