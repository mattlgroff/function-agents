import OpenAIApi from 'openai';
import { FunctionAgentJsonResponse } from '@/types';
import BaseAgent from '@/agents/base-agent';

/**
 * SentimentClassificationAgent Class
 *
 * This class serves as a sentiment classification agent, utilizing the OpenAI API to identify user sentiments based on their messages.
 * The agent is designed to generate a function call to classify the sentiment and return a JSON object containing the classified sentiment's type,
 * a confidence score, and a flag indicating the success of the classification.
 *
 * The class utilizes OpenAI's Function Calling feature, defining a sentiment classification function schema to guide the model in producing the desired output.
 *
 * @example
 *
 * const agent = new SentimentClassificationAgent('openai-api-key', 'gpt-4-0613');
 * const response = await agent.run('I love this product!');
 *
 * console.log(response);
 *
 * response {
 *  json: {
 *    sentiment: {
 *      type: "Positive",
 *      confidentPercentage: 95,
 *      successfullyClassified: true
 *    }
 *  },
 *  success: true,
 *  duration: 3659
 * }
 */
class SentimentClassificationAgent extends BaseAgent {
    constructor(openai_api_key: string, model: string) {
        super(openai_api_key, model);
    }

    async run(userMessage: string): Promise<FunctionAgentJsonResponse> {
        console.log('SentimentClassificationAgent invoked with:', userMessage, '\n');
        const startTime = Date.now();
        try {
            const systemMessageContent = `You are a Sentiment Classification Agent. Your goal is to identify the user's sentiment in the message. You should only use the functions provided in the arguments. Do not add any commentary or ask any questions. Strictly run the sentimentClassificationFunction with a matching sentiment if possible. Think step by step.`;

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

            const sentimentClassificationFunction: OpenAIApi.Chat.ChatCompletionCreateParams.Function = {
                name: 'sentimentClassificationFunction',
                description: "Classifies the user's sentiment based on the given user message.",
                parameters: {
                    type: 'object',
                    properties: {
                        sentimentType: {
                            type: 'string',
                            description: 'The type of sentiment that best matches the user message: Positive, Negative or Neutral',
                        },
                        whyWasThisSentimentChosen: {
                            type: 'string',
                            description: 'Explain why this sentimentType was chosen.',
                        },
                        confidentPercentage: {
                            type: 'number',
                            description: 'The confidence level of the sentiment classification.',
                        },
                        successfullyClassified: {
                            type: 'boolean',
                            description: 'Whether or not the sentiment was successfully classified.',
                        },
                    },
                    required: ['successfullyClassified', 'confidentPercentage', 'sentimentType', 'whyWasThisSentimentChosen'],
                },
            };

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                functions: [sentimentClassificationFunction],
                temperature: 0,
            });

            if (!response.choices[0].message?.function_call?.name || !response.choices[0].message?.function_call?.arguments) {
                throw new Error(`No function call found in response: ${JSON.stringify(response)}`);
            }

            const args = JSON.parse(response.choices[0].message.function_call.arguments);

            console.log('SentimentClassificationAgent successfully completed in ', Date.now() - startTime, 'ms\n');

            return {
                json: {
                    sentiment: {
                        type: args.sentimentType ?? null,
                        whyWasThisSentimentChosen: args.whyWasThisSentimentChosen ?? null,
                        confidentPercentage: args.confidentPercentage ?? 0,
                        successfullyClassified: args.successfullyClassified ?? null,
                    },
                },
                success: true,
                duration: Date.now() - startTime, // duration in ms
            };
        } catch (error) {
            console.log('SentimentClassificationAgent failed in ', Date.now() - startTime, 'ms\n');

            return {
                json: {
                    sentiment: {
                        type: null,
                        whyWasThisSentimentChosen: null,
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

export default SentimentClassificationAgent;
