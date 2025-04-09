/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionCreateParams } from 'openai/resources/chat';

// Define the expected structure of the function call arguments
interface OpenAICulturalFitEvaluation {
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
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly openai: OpenAI;

  constructor() {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        this.logger.error('OPENAI_API_KEY environment variable is not set.');
        this.openai = undefined as any;
        return;
      }
      this.openai = new OpenAI({ apiKey });
    } catch (error) {
      this.logger.error('Error initializing OpenAI:', error);
      this.openai = undefined as any;
    }
  }

  async evaluateWithOpenAI(
    cleanedData: any,
  ): Promise<OpenAICulturalFitEvaluation | null> {
    if (!this.openai) {
      this.logger.error('OpenAI client is not initialized.');
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

      For each candidate response provided below:
      - Evaluate how well the candidate's answer aligns with the assigned Core Values.
      - Evaluate how well the candidate's answer aligns with the company's Mission, Vision, or Culture (depending on the "alignsWith" field).
      - Use the company's provided Core Value definitions, Mission, Vision, and Culture when reasoning.
      - Score consistently: 1.0 means perfect fit, 0.0 means no alignment.

      Return the evaluation as a JSON object strictly following the provided function schema:
      - The object must contain a field \`perQuestionResults\`.
      - Inside \`perQuestionResults\`, use each \`questionId\` from the candidate responses as a dynamic key.
      - For each question, provide:
        - \`cultureFitComposite\` (with \`valuesFit\`, \`missionAlignment\`, \`visionAlignment\`, and \`cultureFit\` scores)
        - \`feedback\` (a brief 1-2 sentence summary about the response)

      **IMPORTANT:**
      - Every question MUST have an entry in \`perQuestionResults\` using its \`questionId\` as the key.
      - DO NOT return an empty object.
      - If uncertain about a fit, provide low scores (e.g., 0.2 or 0.0) but DO NOT skip any question.

      Company Core Value Definitions:
      ${JSON.stringify(companyCoreValues, null, 2)}

      Candidate Responses:
      ${JSON.stringify(responses, null, 2)}

      Company Mission: "${mission}"
      Company Vision: "${vision}"
      Company Culture: "${culture}"
      `.trim();

    // console.log(prompt);

    // const functionSchema = {
    //   name: 'returnCulturalFitEvaluation',
    //   description: 'Returns cultural fit evaluation per question',
    //   parameters: {
    //     type: 'object',
    //     properties: {
    //       perQuestionResults: {
    //         type: 'object',
    //         description: 'Results per question ID',
    //         additionalProperties: {
    //           // 💥 directly here, not inside properties
    //           type: 'object',
    //           properties: {
    //             cultureFitComposite: {
    //               type: 'object',
    //               properties: {
    //                 valuesFit: {
    //                   type: 'object',
    //                   additionalProperties: { type: 'number' }, // 💥 dynamic keys for coreValues
    //                   description:
    //                     'Score per evaluated core value (0.0 to 1.0)',
    //                 },
    //                 missionAlignment: {
    //                   type: 'number',
    //                   description: 'Alignment with mission (0.0 to 1.0)',
    //                 },
    //                 visionAlignment: {
    //                   type: 'number',
    //                   description: 'Alignment with vision (0.0 to 1.0)',
    //                 },
    //                 cultureFit: {
    //                   type: 'number',
    //                   description: 'Overall cultural fit (0.0 to 1.0)',
    //                 },
    //               },
    //               required: ['valuesFit'],
    //             },
    //             feedback: {
    //               type: 'string',
    //               description: 'Brief feedback for the candidate answer',
    //             },
    //           },
    //           required: ['cultureFitComposite', 'feedback'],
    //         },
    //       },
    //     },
    //     required: ['perQuestionResults'],
    //   },
    // };

    const chatCompletionRequest: ChatCompletionCreateParams = {
      model: 'gpt-4o-mini-2024-07-18', // Using the specified 4o mini model (assuming this is the correct ID)
      messages: [{ role: 'user', content: prompt }],
      tools: [
        {
          type: 'function',
          function: {
            name: 'evaluate_cultural_fit',
            description:
              'Evaluates how well candidate responses align with company core values, mission, vision, and culture.',
            strict: true,
            parameters: {
              type: 'object',
              required: ['responses', 'companyProfile'],
              properties: {
                responses: {
                  type: 'array',
                  description:
                    'List of candidate responses to evaluation questions',
                  items: {
                    type: 'object',
                    properties: {
                      questionId: {
                        type: 'string',
                        description: 'Unique identifier for the question',
                      },
                      questionText: {
                        type: 'string',
                        description: 'The text of the question being asked',
                      },
                      transcript: {
                        type: 'string',
                        description: "The candidate's response to the question",
                      },
                      coreValues: {
                        type: 'array',
                        description:
                          'Core values that the response aligns with',
                        items: {
                          type: 'string',
                          description: 'Core value string',
                        },
                      },
                      alignsWith: {
                        type: 'string',
                        description:
                          'Indicates whether the response aligns with the company culture, mission, or vision',
                      },
                    },
                    additionalProperties: false,
                    required: [
                      'questionId',
                      'questionText',
                      'transcript',
                      'coreValues',
                      'alignsWith',
                    ],
                  },
                },
                companyProfile: {
                  type: 'object',
                  required: ['coreValues', 'mission', 'vision', 'culture'],
                  properties: {
                    coreValues: {
                      type: 'object',
                      description: "Definitions of the company's core values",
                      properties: {
                        Collaboration: {
                          type: 'string',
                          description: 'Definition of Collaboration',
                        },
                        Transparency: {
                          type: 'string',
                          description: 'Definition of Transparency',
                        },
                        Innovation: {
                          type: 'string',
                          description: 'Definition of Innovation',
                        },
                        Integrity: {
                          type: 'string',
                          description: 'Definition of Integrity',
                        },
                      },
                      additionalProperties: false,
                      required: [
                        'Collaboration',
                        'Transparency',
                        'Innovation',
                        'Integrity',
                      ],
                    },
                    mission: {
                      type: 'string',
                      description: 'Company mission statement',
                    },
                    vision: {
                      type: 'string',
                      description: 'Company vision statement',
                    },
                    culture: {
                      type: 'string',
                      description: 'Company culture description',
                    },
                  },
                  additionalProperties: false,
                },
              },
              additionalProperties: false,
            },
          },
        },
      ],
      // tool_choice: {
      //   type: 'function',
      //   function: { name: 'returnCulturalFitEvaluation' },
      // },
    };

    try {
      const completion = await this.openai.chat.completions.create(
        chatCompletionRequest,
      );
      const message = completion.choices[0]?.message;
      const toolCalls = message?.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        this.logger.error('OpenAI did not return a function call.');
        return null;
      }

      const functionCall = toolCalls[0].function;
      if (
        functionCall.name !== 'returnCulturalFitEvaluation' ||
        !functionCall.arguments
      ) {
        this.logger.error('OpenAI returned an unexpected function call.');
        return null;
      }

      try {
        const parsedArgs = JSON.parse(
          functionCall.arguments,
        ) as OpenAICulturalFitEvaluation;

        await this.selfCritique(parsedArgs);

        return parsedArgs;
      } catch (error) {
        this.logger.error(
          'Failed to parse OpenAI function call arguments:',
          error,
        );
        return null;
      }
    } catch (error) {
      this.logger.error('Error during OpenAI evaluation:', error);
      return null;
    }
  }

  async selfCritique(
    initialEvaluation: any,
  ): Promise<OpenAICulturalFitEvaluation | null> {
    if (!this.openai) {
      this.logger.error('OpenAI client is not initialized.');
      return null;
    }

    const critiquePrompt = `
      You are a self-critic. Review the following evaluation result based on the expected schema. If there are any mistakes, inconsistencies, or errors, correct them to strictly adhere to the schema. Otherwise, return the corrected JSON using the function call.

      Expected JSON Schema:
      \`\`\`json
      {
        "perQuestionResults": {
          "[questionId: string]": {
            "cultureFitComposite": {
              "valuesFit": {
                "[coreValue: string]": number
              },
              "missionAlignment": number,
              "visionAlignment": number,
              "cultureFit": number
            },
            "feedback": "string"
          }
        }
      }
      \`\`\`

      Evaluation JSON:
      ${JSON.stringify(initialEvaluation)}

      Return the corrected JSON within the arguments of the 'returnCulturalFitEvaluation' function call.
      `.trim();

    const functionSchema = {
      name: 'returnCulturalFitEvaluation',
      description: 'Returns cultural fit evaluation per question',
      parameters: {
        type: 'object',
        properties: {
          perQuestionResults: {
            type: 'object',
            description: 'Results per question ID',
            additionalProperties: {
              // dynamic keys (question IDs)
              type: 'object',
              properties: {
                cultureFitComposite: {
                  type: 'object',
                  properties: {
                    valuesFit: {
                      type: 'object',
                      additionalProperties: { type: 'number' }, // dynamic keys (core values)
                      description:
                        'Score per evaluated core value (0.0 to 1.0)',
                    },
                    missionAlignment: {
                      type: 'number',
                      description: 'Alignment with mission (0.0 to 1.0)',
                    },
                    visionAlignment: {
                      type: 'number',
                      description: 'Alignment with vision (0.0 to 1.0)',
                    },
                    cultureFit: {
                      type: 'number',
                      description: 'Alignment with culture (0.0 to 1.0)',
                    },
                  },
                  required: ['valuesFit'],
                },
                feedback: {
                  type: 'string',
                  description: 'Brief feedback for the question',
                },
              },
              required: ['cultureFitComposite', 'feedback'],
            },
          },
        },
        required: ['perQuestionResults'],
      },
    };

    const chatCompletionRequest: ChatCompletionCreateParams = {
      model: 'gpt-4o-2024-05-13', // Using the specified 4o mini model
      messages: [{ role: 'user', content: critiquePrompt }],
      tools: [
        {
          type: 'function',
          function: functionSchema,
        },
      ],
      tool_choice: {
        type: 'function',
        function: { name: 'returnCulturalFitEvaluation' },
      },
    };

    try {
      const completion = await this.openai.chat.completions.create(
        chatCompletionRequest,
      );
      const message = completion.choices[0]?.message;
      const toolCalls = message?.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        this.logger.warn(
          'OpenAI self-critique did not return a function call.',
        );
        return initialEvaluation;
      }

      const functionCall = toolCalls[0].function;
      if (
        functionCall.name !== 'returnCulturalFitEvaluation' ||
        !functionCall.arguments
      ) {
        this.logger.warn(
          'OpenAI self-critique returned an unexpected function call.',
        );
        return initialEvaluation;
      }

      try {
        const parsedArgs = JSON.parse(
          functionCall.arguments,
        ) as OpenAICulturalFitEvaluation;

        return parsedArgs;
      } catch (error) {
        this.logger.error(
          'Failed to parse OpenAI self-critique function call arguments:',
          error,
        );
        return initialEvaluation;
      }
    } catch (error) {
      this.logger.error('Error during OpenAI self-critique:', error);
      return initialEvaluation;
    }
  }
}
