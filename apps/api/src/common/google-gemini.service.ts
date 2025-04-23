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
  Part,
  FunctionDeclarationSchema,
} from '@google/generative-ai';

// Define the expected structure of the function call arguments
export interface CulturalFitEvaluation {
  perQuestionResults?: Array<{
    questionId: string;
    cultureFitComposite?: {
      valuesFit?: Array<{
        coreValue: string;
        score: number;
      }>;
      missionAlignment?: number;
      visionAlignment?: number;
      cultureFit?: number;
    };
    feedback?: string;
  }>;
}

// Define the expected structure for a single question (useful for validation)
interface InterviewQuestion {
  text: string;
  type: 'MISSION' | 'VISION' | 'CULTURE';
  coreValues: string[];
}

// Define the expected structure for the function call arguments
interface FunctionCallArgs {
  questions: InterviewQuestion[];
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
      You are an expert HR cultural fit evaluator who specializes in objective assessment of candidates.

      TASK:
      Analyze each candidate response against two criteria:
      1. Alignment with specific Core Values assigned to that question
      2. Alignment with either Mission, Vision, or Culture (depending on the question's focus)

      COMPANY PROFILE:
      - Core Values: ${JSON.stringify(companyCoreValues, null, 2)}
      - Mission: "${mission}"
      - Vision: "${vision}"
      - Culture: "${culture}"

      CANDIDATE RESPONSES:
      ${JSON.stringify(responses, null, 2)}

      IMPORTANT EVALUATION GUIDELINES:
      - Focus ONLY on content and ideas, NOT on grammar, writing style, or language proficiency
      - Evaluate actual alignment with values and company direction, not presentation quality
      - Be fair to non-native speakers and those with different communication styles
      - Look for substance over form - a poorly worded response that demonstrates alignment should score higher than a well-written response with poor alignment

      SCORING RUBRIC:
      - Use a continuous scale from 0.0 to 1.0 where:
        - 1.0 = Perfect fit (Demonstrates complete understanding and embodiment of values/mission/vision/culture)
        - 0.75-0.99 = Strong fit (Shows clear alignment with most aspects)
        - 0.5-0.74 = Moderate fit (Partially aligns but lacks depth or completeness)
        - 0.25-0.49 = Weak fit (Minimally addresses values/mission/vision/culture)
        - 0.01-0.24 = Very weak fit (Has minimal evidence of alignment)
        - 0.0 = No fit (Does not demonstrate any alignment)

      Feel free to use any decimal value between 0.0 and 1.0 that accurately reflects the degree of alignment.

      SCORING GUIDELINES:
      - Be objective and consistent across all evaluations
      - Consider both explicit and implicit demonstrations of values
      - For Core Values: Score each value individually based on how specifically the response aligns
      - For Mission/Vision/Culture: Consider holistic alignment with the company's direction

      EXAMPLE EVALUATION:
      For a response showing strong understanding of company values despite grammatical errors:
      - valuesFit: [{"coreValue": "Innovation", "score": 0.8}]
      - visionAlignment: 0.5
      - feedback: "Candidate demonstrates strong alignment with our Innovation value through their examples of creative problem-solving. Their understanding of our long-term vision is moderate but shows potential."

      Use the returnCulturalFitEvaluation function to provide your assessment.
      `.trim();

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.2, // Lower temperature for more consistent evaluations
        topP: 0.95, // Optional - controls diversity
        topK: 40, // Optional - limits token selection pool
      },
    });

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
      You are a quality assurance expert specializing in HR evaluation data. Your task is to review and correct the following cultural fit evaluation for accuracy, completeness, and adherence to schema requirements.

      REVIEW OBJECTIVES:
      1. Ensure all required fields are present (questionId, cultureFitComposite, feedback)
      2. Verify all scores are valid decimal values between 0.0 and 1.0 inclusive
      3. Check that each question has appropriate valuesFit entries with valid core values
      4. Confirm feedback is constructive, specific, and reflects the numerical scores
      5. Ensure questionText is included where available

      VALIDATION CRITERIA:
      - Required fields cannot be null or missing
      - Scores must be decimal values between 0.0-1.0
      - Each valuesFit item needs both coreValue (string) and score (number)
      - Feedback should be informative and match the scores given

      INITIAL EVALUATION:
      ${JSON.stringify(initialEvaluation, null, 2)}

      Please return the evaluation using the returnCulturalFitEvaluation function call schema.
      `.trim();

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.1, // Using very low temperature for consistency in validation tasks
      },
    });

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
        const parsedArgs = functionCall.args as CulturalFitEvaluation;
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

  async generateAIFeedback(summaryData: any): Promise<string | null> {
    if (!this.genAI) {
      this.logger.error('Gemini API client is not initialized.');
      return null;
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
  You are an expert HR evaluator.
  
  Based on the following interview evaluation results, generate a professional feedback summary explaining whether the candidate is a good fit or not. Be clear, constructive, and concise.
  
  Data:
  ${JSON.stringify(summaryData, null, 2)}
  
  Guidelines:
  - If the overall fit score is high (>= 0.75), praise their communication and culture fit.
  - If the overall fit score is low (< 0.75), politely highlight areas where the candidate may not fully align and suggest further evaluation.
  - Tone should be positive but realistic.
  - Keep it within 3-5 sentences.
  `.trim();

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const response = result.response;
      const candidates = response.candidates || [];

      if (!candidates.length || !candidates[0]?.content?.parts?.length) {
        this.logger.error('Gemini returned empty feedback.');
        return null;
      }

      const generatedFeedback = candidates[0].content.parts[0]?.text;
      return generatedFeedback || null;
    } catch (error) {
      this.logger.error('Error during AI feedback generation:', error);
      return null;
    }
  }

  async generateTemplateQuestions(
    companyProfile: {
      coreValues: Record<string, string>;
      mission: string;
      vision: string;
      culture: string;
    },
    numberOfQuestions: number,
  ): Promise<InterviewQuestion[] | null> {
    if (!this.genAI) {
      this.logger.error('Gemini API client is not initialized.');
      return null;
    }
    const modelName = 'gemini-2.0-flash'; // Or your chosen model
    const model = this.genAI.getGenerativeModel({
      model: modelName /* ...safetySettings */,
    });
    const coreValueKeys = Object.keys(companyProfile.coreValues);

    const prompt = `
      You are an expert HR professional creating interview questions to evaluate cultural fit based on the provided company information.
      Your task is to generate exactly ${numberOfQuestions} distinct interview questions.
      NOTE: Only generate ${numberOfQuestions} questions. Do not generate more or less.

      Each question must strictly adhere to the following criteria:
      1.  Be aligned with ONLY ONE of the company's primary aspects: 'mission', 'vision', or 'culture'.
      2.  Evaluate AT LEAST ONE, and potentially multiple, of the company's specified core values. The core values provided are: ${coreValueKeys.join(', ')}.
      3.  Be open-ended and behavioral (asking for past experiences or hypothetical scenarios related to the values/aspects).
      4.  Be professional, clear, concise, and appropriate for a job interview setting.
      5.  Do NOT ask generic questions. Each question should be tailored to the provided company information.

      Company Information:
      - Mission: "${companyProfile.mission}"
      - Vision: "${companyProfile.vision}"
      ${companyProfile.culture ? `- Culture: "${companyProfile.culture}"` : ''}
      - Core Values (Name: Description):
        ${JSON.stringify(companyProfile.coreValues, null, 2)}

      Use the provided 'generateInterviewQuestions' function to format your response. Ensure the 'coreValues' array for each question contains only valid core value names from the list: ${coreValueKeys.join(', ')}.
    `.trim();

    const functionSchema = {
      name: 'generateInterviewQuestions',
      description:
        'Generates tailored interview questions aligned with company mission, vision, culture, and core values.',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          questions: {
            type: SchemaType.ARRAY,
            description: `List of exactly ${numberOfQuestions} generated interview questions.`,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                text: {
                  type: SchemaType.STRING,
                  description: 'The full text of the interview question.',
                },
                type: {
                  type: SchemaType.STRING,
                  description:
                    "The single aspect this question primarily aligns with ('mission', 'vision', or 'culture').",
                  enum: companyProfile.culture
                    ? ['MISSION', 'VISION', 'CULTURE']
                    : ['MISSION', 'VISION'],
                },
                coreValues: {
                  type: SchemaType.ARRAY,
                  description:
                    'List of one or more core value names (from the provided list) that this question evaluates.',
                  items: {
                    type: SchemaType.STRING,
                    description: 'A valid core value name.',
                  },
                },
              },
              required: ['text', 'type', 'coreValues'],
            },
          },
        },
        required: ['questions'],
      },
    };

    const generateContentRequest: GenerateContentRequest = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [
        {
          functionDeclarations: [functionSchema],
        } as Tool,
      ],
      // toolConfig: { functionCallingConfig: { mode: 'ANY' } }
    };

    try {
      const result = await model.generateContent(generateContentRequest);
      const response = result.response;
      const firstCandidate = response?.candidates?.[0];

      if (!firstCandidate?.content?.parts?.length) {
        this.logger.error('Gemini response missing candidates or parts.', {
          responseText: response?.text(),
        });
        return null;
      }

      const functionCallPart = firstCandidate.content.parts.find(
        (part: Part) => !!part.functionCall,
      );

      if (!functionCallPart || !functionCallPart.functionCall?.args) {
        this.logger.error(
          'Gemini response missing function call or arguments.',
          { responseContent: firstCandidate.content },
        );
        return null;
      }

      // --- Runtime Validation & Type Guard ---
      const args = functionCallPart.functionCall.args;

      // **FIX:** Perform checks that TypeScript can use for type narrowing
      if (
        !args || // Check if args exists
        typeof args !== 'object' || // Check if it's an object
        !('questions' in args) || // **** Check if 'questions' property exists ****
        !Array.isArray(args.questions) // **** Check if 'questions' is an array ****
      ) {
        // Now accessing args.questions is potentially unsafe or known to be wrong type
        this.logger.error(
          'Gemini function call arguments have incorrect structure or missing/invalid "questions" array.',
          { args },
        );
        return null;
      }

      // **** After the checks above, TypeScript knows args is an object ****
      // **** AND it has a property 'questions' which is an array.        ****
      // Type is narrowed to something like: { questions: unknown[] } & object

      // Now we can safely access args.questions
      const receivedQuestions: unknown[] = args.questions; // Store it safely as unknown[] first
      const validQuestions: InterviewQuestion[] = [];
      const invalidQuestionMessages: string[] = [];
      const validCoreValueSet = new Set(coreValueKeys);

      // Detailed validation of each item in the array
      for (const index in receivedQuestions) {
        const q = receivedQuestions[index]; // q is 'unknown' here

        // Validate the structure of each question object
        if (
          !q ||
          typeof q !== 'object' || // Check if q is a non-null object
          typeof (q as any).text !== 'string' ||
          (q as any).text.trim() === '' ||
          !['MISSION', 'VISION', 'CULTURE'].includes((q as any).type) ||
          !Array.isArray((q as any).coreValues) ||
          (q as any).coreValues.length === 0
          // Add core value content check inside the loop for clarity
        ) {
          invalidQuestionMessages.push(
            `Invalid question structure at index ${index}: ${JSON.stringify(q)}`,
          );
          continue; // Skip to the next question
        }

        // Now q is known to be an object with the basic fields existing and having roughly correct types.
        // We can be slightly more confident treating it like InterviewQuestion, but still validate content.
        const potentialQuestion = q as Partial<InterviewQuestion>; // Use Partial for safety
        const errors: string[] = [];

        // Validate core values more strictly
        const currentCoreValues = potentialQuestion.coreValues!; // Assert non-null based on Array.isArray check above
        for (const cv of currentCoreValues) {
          if (typeof cv !== 'string' || !validCoreValueSet.has(cv)) {
            errors.push(`Invalid or unknown core value: ${cv}`);
          }
        }

        if (errors.length === 0) {
          // If all checks pass, *now* cast to the definitive type
          validQuestions.push(potentialQuestion as InterviewQuestion);
        } else {
          invalidQuestionMessages.push(
            `Invalid question content (Text: "${potentialQuestion.text?.substring(0, 50)}..."): ${errors.join(', ')}`,
          );
        }
      }

      if (invalidQuestionMessages.length > 0) {
        this.logger.warn(
          `Gemini returned ${invalidQuestionMessages.length} invalid questions:\n${invalidQuestionMessages.join('\n')}`,
        );
        // Decide strategy: return only valid, or fail completely
      }

      if (validQuestions.length === 0) {
        this.logger.error(
          'Gemini did not return any valid questions meeting all criteria.',
        );
        return null;
      }

      if (validQuestions.length !== numberOfQuestions) {
        this.logger.warn(
          `Requested ${numberOfQuestions} questions, but received ${validQuestions.length} valid questions.`,
        );
        // Decide if this is acceptable
      }

      return validQuestions;
    } catch (error: any) {
      console.log({ HANNAH: error.message });
      this.logger.error(
        'Error during Gemini question generation:',
        error?.message || error,
      );
      if (error.response) {
        this.logger.error(
          'Gemini API Error Details:',
          JSON.stringify(error.response, null, 2),
        );
      }
      return null;
    }
  }
}
