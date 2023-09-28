import OpenAIApi from 'openai';
import { FunctionAgentJsonResponse } from '@/types';

/**
 * OpenAIDataTransformationAgent Class
 *
 * This class is responsible for transforming unstructured text into a structured JSON response.
 * It leverages the OpenAI API to request a model's completion based on a predefined system message
 * and user input data.
 *
 * Usage:
 * const dataTransformAgent = new OpenAIDataTransformationAgent(apiKey, model, functionDefinition, systemMessage);
 * const response: MyJsonType = await dataTransformAgent.run(someUnstructuredTextString);
 *
 * @example
 * const functionDefinition = {
 *   name: 'convertTemperature',
 *   description: 'Converts a temperature value from one unit to another.',
 *   parameters: {
 *       type: 'object',
 *       properties: {
 *           temperature_number: {
 *               type: 'number',
 *               description: 'The temperature value to be converted',
 *           },
 *           temperature_current_type: {
 *               type: 'string',
 *               description: 'The current unit of the temperature value. Options are "Celsius", "Fahrenheit", or "Kelvin"',
 *           },
 *           temperature_desired_type: {
 *               type: 'string',
 *               description: 'The desired unit for the converted temperature. Options are "Celsius", "Fahrenheit", or "Kelvin"',
 *           },
 *       },
 *       required: ['temperature_number', 'temperature_current_type', 'temperature_desired_type'],
 *   },
 * };
 *
 *
 * const systemMessage = 'You are a data transformation agent. You can transform data from one format to another. You take in unstructured text and you use your functions to return structured, valid JSON responses.';
 *
 * const agent = new OpenAIDataTransformationAgent('openai-api-key', 'gpt-3.5-turbo-0613', functionDefinition, systemMessage);
 *
 * const response = await agent.run('I want to convert a temperature in Fahrenheit to Celsius. It is 32 degrees Fahrenheit.');
 */
class OpenAIDataTransformationAgent {
    private openai: OpenAIApi;
    private model: string;
    private functionDefinition: OpenAIApi.Chat.ChatCompletionCreateParams.Function;
    private systemMessage: string;

    constructor(
        openai_api_key: string,
        model: string,
        functionDefinition: OpenAIApi.Chat.ChatCompletionCreateParams.Function,
        systemMessage: string = 'You are a data transformation agent. You can transform data from one format to another. You take in unstructured text and you use your functions to return structured, valid JSON responses.'
    ) {
        this.openai = new OpenAIApi({
            apiKey: openai_api_key,
        });

        this.model = model;

        this.functionDefinition = functionDefinition;

        this.systemMessage = systemMessage;
    }

    async run(userMessage: string): Promise<FunctionAgentJsonResponse> {
        console.log('OpenAIDataTransformationAgent Agent invoked with:', userMessage, '\n');
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

            const response: OpenAIApi.Chat.ChatCompletion = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                functions: [this.functionDefinition],
                temperature: 0, // We might want to make this configurable in the future
            });

            if (!response.choices[0].message?.function_call?.name || !response.choices[0].message?.function_call?.arguments) {
                throw new Error(`No function call found in response: ${JSON.stringify(response)}`);
            }

            const args = JSON.parse(response.choices[0].message.function_call.arguments);

            return {
                json: args,
                success: true,
            };
        } catch (error) {
            return {
                json: {},
                success: false,
                error,
            };
        }
    }
}

export default OpenAIDataTransformationAgent;
