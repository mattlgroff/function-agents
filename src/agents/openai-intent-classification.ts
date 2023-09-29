import OpenAIApi from 'openai';
import { FunctionAgentJsonResponse } from '@/types';

export interface Intent {
    name: string;
    description: string;
}

/**
 * OpenAIIntentClassificationAgent Class
 *
 * This class serves as an intent classification agent, utilizing the OpenAI API to identify user intents based on a set of predefined intent objects. Each intent object consists of a name and a description. The agent is designed to generate a function call to classify the intent and return a JSON object containing the classified intent's name, description, and a flag indicating the success of the classification.
 *
 * The class utilizes OpenAI's Function Calling feature, defining an intent classification function schema to guide the model in producing the desired output.
 *
 * @example
 *
 * const intents = [
 *   { name: 'simple_math', description: 'A task than can be described as a simple math problem that can be solved with addition, subtraction, multiplication, or division.' },
 *   { name: 'complex_math', description: 'A task than can be described as a complex math problem that can be solved with algebra, calculus, or other advanced math.' }
 * ];
 *
 * const agent = new OpenAIIntentClassificationAgent('openai-api-key', 'gpt-4-0613', intents);
 *
 * const response = await agent.run('Hello, how are you?');
 *
 * console.log(response);
 *
 * response {
 *  json: {
 *    intent: {
 *       name: "complex_math",
 *      description: "A task than can be described as a complex math problem that can be solved with algebra, calculus, or other advanced math.",
 *      confidentPercentage: 90,
 *       successfullyClassified: true
 *    }
 *  },
 *  success: true,
 *  duration: 3659
 * }
 */
class OpenAIIntentClassificationAgent {
    private openai: OpenAIApi;
    private model: string;
    private intents: Intent[];

    constructor(openai_api_key: string, model: string, intents: Intent[]) {
        this.openai = new OpenAIApi({
            apiKey: openai_api_key,
        });

        this.model = model;

        this.intents = intents;
    }

    async run(userMessage: string): Promise<FunctionAgentJsonResponse> {
        console.log('OpenAIIntentClassificationAgent invoked with function code and arguments:', userMessage, '\n');
        const startTime = Date.now();
        try {
            const systemMessageContent = `You are an Intent Classification Agent. Your goal is to identify the user's intent based on the following possible intents: \n${this.intents
                .map(intent => `${intent.name}: ${intent.description}\n`)
                .join(
                    ', '
                )}. \n You should only use the functions and intents provided in the arguments. Do not add any commentary or ask any questions. Strictly run the intentClassificationFunction with a matching intent if possible. Think step by step.`;

            const messages: OpenAIApi.Chat.ChatCompletionMessage[] = [
                {
                    role: 'system',
                    content: systemMessageContent,
                },
                {
                    role: 'user',
                    content: userMessage,
                },
            ];

            console.log('OpenAIIntentClassificationAgent messages:', JSON.stringify(messages), '\n');

            const intentClassificationFunction: OpenAIApi.Chat.ChatCompletionCreateParams.Function = {
                name: 'intentClassificationFunction',
                description: "Classifies the user's intent based on the given user message.",
                parameters: {
                    type: 'object',
                    properties: {
                        intentName: {
                            type: 'string',
                            description: 'The name of the intent that best matches the user message',
                        },
                        intentDescription: {
                            type: 'string',
                            description: 'The description of the intent that best matches the user message',
                        },
                        confidentPercentage: {
                            type: 'number',
                            description:
                                'The percent match of the intent that best matches the user message. A measure of how confident the agent is in the classification.',
                        },
                        intentSuccessfullyClassified: {
                            type: 'boolean',
                            description:
                                'Whether or not the intent was successfully classified. If you are confident that nothing matches, return false. If you are confident of a matching intent, return true.',
                        },
                    },
                    required: ['intentSuccessfullyClassified'],
                },
            };

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                functions: [intentClassificationFunction],
                temperature: 0,
            });

            if (!response.choices[0].message?.function_call?.name || !response.choices[0].message?.function_call?.arguments) {
                throw new Error(`No function call found in response: ${JSON.stringify(response)}`);
            }

            const args = JSON.parse(response.choices[0].message.function_call.arguments);

            console.log('OpenAIIntentClassificationAgent successfully completed in ', Date.now() - startTime, 'ms\n');

            return {
                json: {
                    intent: {
                        name: args.intentName ?? null,
                        description: args.intentDescription ?? null,
                        confidentPercentage: args.confidentPercentage ?? 0,
                        successfullyClassified: args.intentSuccessfullyClassified ?? null,
                    },
                },
                success: true,
                duration: Date.now() - startTime, // duration in ms
            };
        } catch (error) {
            console.log('OpenAIIntentClassificationAgent failed in ', Date.now() - startTime, 'ms\n');

            return {
                json: {
                    intent: {
                        name: null,
                        description: null,
                        confidentPercentage: 0,
                        successfullyClassified: false,
                    },
                },
                success: false,
                duration: Date.now() - startTime, // duration in ms
            };
        }
    }
}

export default OpenAIIntentClassificationAgent;
