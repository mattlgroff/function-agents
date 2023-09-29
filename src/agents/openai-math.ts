import OpenAIApi from 'openai';
import { FunctionAgentJsonResponse } from '@/types';
import OpenAIDataTransformationAgent from '@/agents/openai-data-transformation';

export type MathInput = {
    input1: number;
    input2: number;
    operation: string;
};

export type MathResult = {
    result: number;
};

/**
 * OpenAIMathAgent Class
 *
 * This class is responsible for performing mathematical operations based on the user's text input.
 * It utilizes one other agent for data transformation: 'openai-data-transformation'
 * The class uses OpenAI API to interact with the model specified during instantiation.
 *
 * Usage:
 * const mathAgent = new OpenAIMathAgent(apiKey, model, systemMessage);
 * const response: FunctionAgentJsonResponse = await mathAgent.run(userMessage);
 *
 * @example
 *
 * const agent = new OpenAIMathAgent('openai-api-key', 'gpt-3.5-turbo-0613');
 *
 * const response = await agent.run('If Johnny has five apples, and Susie gives him two additional apples, how many apples does Johnny have?');
 */
class OpenAIMathAgent {
    private openai: OpenAIApi;
    private model: string;
    private systemMessage: string;

    constructor(
        openai_api_key: string,
        model: string,
        systemMessage: string = 'You are a math expert agent. You will take inputs of multiple numbers and compute operations and use your functions to solve the equations.  Do not attempt to solve the problem without using your defined functions.'
    ) {
        this.openai = new OpenAIApi({
            apiKey: openai_api_key,
        });
        this.model = model;
        this.systemMessage = systemMessage;
    }

    async run(userMessage: string): Promise<FunctionAgentJsonResponse> {
        console.log('OpenAIMathAgent invoked with:', userMessage, '\n');
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

            const dataTransformationFunction: OpenAIApi.Chat.ChatCompletionCreateParams.Function = {
                name: 'dataTransformation',
                description: "This function will take the user's request and return input1, input2, and operation.",
                parameters: {
                    type: 'object',
                    properties: {
                        userMessage: {
                            type: 'string',
                            description: 'The user message requesting a math operation.',
                        },
                    },
                    required: ['userMessage'],
                },
            };

            const response: OpenAIApi.Chat.ChatCompletion = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                functions: [dataTransformationFunction],
                temperature: 0, // We might want to make this configurable in the future
            });

            if (!response.choices[0].message?.function_call?.name || !response.choices[0].message?.function_call?.arguments) {
                throw new Error(`No function call found in response: ${JSON.stringify(response)}`);
            }

            const functionName = response.choices[0].message.function_call.name;
            const args = JSON.parse(response.choices[0].message.function_call.arguments);

            if (functionName !== 'dataTransformation') {
                throw new Error(`Function name "${functionName}" does not match expected function name "dataTransformation"`);
            } else {
                const mathInputFunction: OpenAIApi.Chat.ChatCompletionCreateParams.Function = {
                    name: 'mathInputFunction',
                    description: "This function will take the user's request and return input1, input2, and operation.",
                    parameters: {
                        type: 'object',
                        properties: {
                            input1: {
                                type: 'number',
                                description: 'The first input number.',
                            },
                            input2: {
                                type: 'number',
                                description: 'The second input number.',
                            },
                            operation: {
                                type: 'string',
                                description:
                                    'The operation to perform on the two inputs. Can be "add", "subtract", "multiply", or "divide".',
                            },
                        },
                        required: ['input1', 'input2', 'operation'],
                    },
                };

                // Tool 1: Data Transformation to get the math inputs in JSON format (MathInput)
                const dataTransformationResult = await this.dataTransformation(mathInputFunction, args.userMessage);

                // If the other agent fails, throw an error
                if (!dataTransformationResult.success) {
                    throw new Error(`Error running data transformation agent: ${JSON.stringify(dataTransformationResult)}`);
                }

                // Get the math inputs from the data transformation agent
                const mathInputs = dataTransformationResult.json as MathInput;

                // Tool 2: Math Operation method to perform the math operation on the MathInput json object
                const mathOperationResult = this.mathOperation(mathInputs);

                // If the math operation agent fails, throw an error
                if (!mathOperationResult.success) {
                    throw new Error(`Error running math operation agent: ${JSON.stringify(mathOperationResult)}`);
                }

                // Get the math result from the math operation agent
                const mathOperationResultJson = mathOperationResult.json as MathResult;

                console.log('OpenAIMathAgent successfully completed in ', Date.now() - startTime, 'ms\n');

                return {
                    json: mathOperationResultJson,
                    success: true,
                    duration: Date.now() - startTime, // duration in ms
                };
            }
        } catch (error) {
            console.log('OpenAIMathAgent failed in ', Date.now() - startTime, 'ms\n');

            return {
                json: {},
                success: false,
                error: JSON.stringify(error),
                duration: Date.now() - startTime, // duration in ms
            };
        }
    }

    // This method is called by the math agent to transform the user's message into a json object
    async dataTransformation(
        dataTransformationFunction: OpenAIApi.Chat.ChatCompletionCreateParams.Function,
        userMessage: string
    ): Promise<FunctionAgentJsonResponse> {
        console.log('dataTransformation method invoked with:', userMessage, '\n');
        const startTime = Date.now();
        try {
            // Call the other agent 'openai-data-transformation'
            const agent = new OpenAIDataTransformationAgent(this.openai.apiKey, this.model, dataTransformationFunction);

            const response = await agent.run(userMessage);

            // If the other agent fails, throw an error
            if (!response.success) {
                throw new Error(`Error running data transformation agent: ${JSON.stringify(response)}`);
            }

            return {
                json: response.json,
                success: response.success,
                duration: Date.now() - startTime, // duration in ms
            };
        } catch (error) {
            return {
                json: {},
                success: false,
                error,
                duration: Date.now() - startTime, // duration in ms
            };
        }
    }

    // This method is called by the math agent to perform the math operation on the MathInput json object
    mathOperation(mathInput: MathInput): FunctionAgentJsonResponse {
        console.log('mathOperation method invoked with:', JSON.stringify(mathInput), '\n');
        const startTime = Date.now();
        if (mathInput.operation == null) {
            return {
                json: {},
                success: false,
                error: `No operation found in math input: ${JSON.stringify(mathInput)}`,
                duration: Date.now() - startTime, // duration in ms
            };
        }

        if (mathInput.input1 == null) {
            return {
                json: {},
                success: false,
                error: `No input1 found in math input: ${JSON.stringify(mathInput)}`,
                duration: Date.now() - startTime, // duration in ms
            };
        }

        if (mathInput.input2 == null) {
            return {
                json: {},
                success: false,
                error: `No input2 found in math input: ${JSON.stringify(mathInput)}`,
                duration: Date.now() - startTime, // duration in ms
            };
        }

        const input1 = Number(mathInput.input1);
        const input2 = Number(mathInput.input2);

        try {
            let result: number;
            switch (mathInput.operation) {
                case 'add':
                    result = this.add(input1, input2);
                    break;
                case 'subtract':
                    result = this.subtract(input1, input2);
                    break;
                case 'multiply':
                    result = this.multiply(input1, input2);
                    break;
                case 'divide':
                    result = this.divide(input1, input2);
                    break;
                default:
                    return {
                        json: {},
                        success: false,
                        error: `Invalid operation "${mathInput.operation}"`,
                        duration: Date.now() - startTime, // duration in ms
                    };
            }
            return {
                json: {
                    result,
                },
                success: true,
                duration: Date.now() - startTime, // duration in ms
            };
        } catch (error) {
            return {
                json: {},
                success: false,
                error,
                duration: Date.now() - startTime, // duration in ms
            };
        }
    }

    add(input1: number, input2: number): number {
        console.log('add method invoked with:', input1, input2, '\n');
        return input1 + input2;
    }

    subtract(input1: number, input2: number): number {
        console.log('subtract method invoked with:', input1, input2, '\n');
        return input1 - input2;
    }

    multiply(input1: number, input2: number): number {
        console.log('multiply method invoked with:', input1, input2, '\n');
        return input1 * input2;
    }

    divide(input1: number, input2: number): number {
        console.log('divide method invoked with:', input1, input2, '\n');
        if (input2 === 0) {
            throw new Error('Cannot divide by zero');
        }
        return input1 / input2;
    }
}

export default OpenAIMathAgent;
