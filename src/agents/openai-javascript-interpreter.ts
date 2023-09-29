import OpenAIApi from 'openai';
import { FunctionAgentJsonResponse } from '@/types';

/**
 * OpenAIJavaScriptInterpreterAgent Class
 *
 * This class serves as an interface between a JavaScript function definition and the OpenAI API.
 * It takes in JavaScript function code as a string and outputs a JSON object adhering to the OpenAI Function Calling Schema.
 * The class uses a pre-defined system message to set the context for the OpenAI model.
 *
 * Usage:
 * const jsInterpreter = new OpenAIJavaScriptInterpreterAgent(apiKey, model, systemMessage);
 * const response: FunctionAgentJsonResponse = await jsInterpreter.run('function add(a, b) { return a + b; }');
 *
 * @example
 *
 * const jsInterpreter = new OpenAIJavaScriptInterpreterAgent('openai-api-key', 'gpt-4-0613');
 * const response = await jsInterpreter.run('function add(a, b) { return a + b; }');
 */
class OpenAIJavaScriptInterpreterAgent {
    private openai: OpenAIApi;
    private model: string;
    private systemMessage: string;

    constructor(
        openai_api_key: string,
        model: string,
        systemMessage: string = 'You are a JavaScript interpreter agent. You take in JavaScript function code. Your task is to take the function and output in the form of a JSON object matching the OpenAI Function Calling schema using only the interpreterFunction. Do not add any commentary or ask any questions. Strictly run the interpreterFunction and return the JSON object.'
    ) {
        this.openai = new OpenAIApi({
            apiKey: openai_api_key,
        });

        this.model = model;

        this.systemMessage = systemMessage;
    }

    async run(userMessage: string): Promise<FunctionAgentJsonResponse> {
        console.log('OpenAIJavaScriptInterpreterAgent invoked with function code and arguments:', userMessage, '\n');
        const startTime = Date.now();
        try {
            const messages: OpenAIApi.Chat.ChatCompletionMessage[] = [
                {
                    role: 'system',
                    content: this.systemMessage,
                },
                {
                    role: 'user',
                    content: userMessage,
                },
            ];

            const interpreterFunction: OpenAIApi.Chat.ChatCompletionCreateParams.Function = {
                name: 'interpreterFunction',
                description: 'Interprets JavaScript function and returns OpenAI Function Calling Schema.',
                parameters: {
                    type: 'object',
                    properties: {
                        functionName: {
                            type: 'string',
                            description: 'The JavaScript function name to be called',
                        },
                        functionDescription: {
                            type: 'string',
                            description: 'The description of the JavaScript function',
                        },
                        functionArguments: {
                            type: 'array',
                            description: 'The JavaScript function arguments to be passed to the function',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                        description: 'The name of the JavaScript function argument',
                                    },
                                    type: {
                                        type: 'string',
                                        description: 'The type of the JavaScript function argument',
                                    },
                                    description: {
                                        type: 'string',
                                        description: 'The description of the JavaScript function argument',
                                    },
                                },
                            },
                        },
                    },
                    required: ['functionName', 'functionDescription', 'functionArguments'],
                },
            };

            const response: OpenAIApi.Chat.ChatCompletion = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                functions: [interpreterFunction],
                temperature: 0,
            });

            if (!response.choices[0].message?.function_call?.name || !response.choices[0].message?.function_call?.arguments) {
                throw new Error(`No function call found in response: ${JSON.stringify(response)}`);
            }

            const args = JSON.parse(response.choices[0].message.function_call.arguments);

            type FunctionArgument = {
                name: string;
                type: string;
                description: string;
            };

            const json: OpenAIApi.Chat.ChatCompletionCreateParams.Function = {
                name: args.functionName,
                description: args.functionDescription,
                parameters: {
                    type: 'object',
                    properties: args.functionArguments.reduce((acc: any, arg: FunctionArgument) => {
                        acc[arg.name] = {
                            type: arg.type,
                            description: arg.description,
                        };
                        return acc;
                    }, {}),
                    required: args.functionArguments.map((arg: FunctionArgument) => arg.name),
                },
            };

            console.log('OpenAIJavaScriptInterpreterAgent successfully completed in ', Date.now() - startTime, 'ms\n');

            return {
                json,
                success: true,
                duration: Date.now() - startTime, // duration in ms
            };
        } catch (error) {
            console.log('OpenAIJavaScriptInterpreterAgent failed in ', Date.now() - startTime, 'ms\n');

            return {
                json: {},
                success: false,
                error,
                duration: Date.now() - startTime, // duration in ms
            };
        }
    }
}

export default OpenAIJavaScriptInterpreterAgent;
