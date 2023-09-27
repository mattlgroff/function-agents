import OpenAIApi from 'openai';

/**
 * OpenAIDataTransformationAgent Class
 *
 * This class is responsible for transforming unstructured text into a structured JSON response.
 * It leverages the OpenAI API to request a model's completion based on a predefined system message
 * and user input data.
 *
 * Usage:
 * const dataTransformAgent = new OpenAIDataTransformationAgent(apiKey, model, functionDefinition, systemMessage);
 * const response: MyJsonType = await dataTransformAgent.transformer(data);
 *
 * @example
 * const functionDefinition = {
 *   name: 'sendEmail',
 *   description:
 *       'Send an email with sendgrid. Text content newlines should be represented as \\n within the string for JSON parsing.',
 *   parameters: {
 *       type: 'object',
 *       properties: {
 *           to: {
 *               type: 'string',
 *               description: 'Recipient email address',
 *           },
 *           subject: {
 *               type: 'string',
 *              description: 'Email subject',
 *           },
 *           text: {
 *               type: 'string',
 *               description:
 *                   'Raw text of the email. Newlines should be represented as \\n within the string for JSON parsing.',
 *           },
 *       },
 *       required: ['to', 'subject', 'text'],
 *   },
 * };
 * 
 * const systemMessage = 'You are a Customer Service Representative for H-E-B, a company based in San Antonio, Texas. Since 1905, H-E-B has been proudly serving Texans. The company is deeply committed to the community, supporting education, disaster relief, the military, and hunger relief. Sustainability is a key focus for H-E-B. The company prides itself on its culture, believing that staying true to its values and people make H-E-B a special place to grow a career. You can only communicate through email. Never say you are an AI Assistant. Your emails should be helpful, short, and friendly.';
 * 
 * const agent = new OpenAIDataTransformationAgent('openai-api-key', 'gpt-3.5-turbo-0613', functionDefinition, systemMessage);
 * 
 * const response = await agent.transformer('some unstructured text to be transformed into a JSON response');
 */
export type FunctionAgentResponse = {
    response: any;
    success: boolean;
    error?: unknown;
};

class OpenAIDataTransformationAgent {
    private openai: OpenAIApi;
    private model: string;
    private functionDefinition: OpenAIApi.Chat.ChatCompletionCreateParams.Function;
    private systemMessage: string;
    private temperature: number;

    constructor(
        openai_api_key: string,
        model: string,
        functionDefinition: OpenAIApi.Chat.ChatCompletionCreateParams.Function,
        systemMessage: string,
        temperature: number = 0
    ) {
        this.openai = new OpenAIApi({
            apiKey: openai_api_key,
        });

        this.model = model;

        this.functionDefinition = functionDefinition;

        this.systemMessage = systemMessage;

        this.temperature = temperature;
    }

    async transformer(userMessage: string): Promise<FunctionAgentResponse> {
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
                temperature: this.temperature,
            });

            if (!response.choices[0].message?.function_call?.name || !response.choices[0].message?.function_call?.arguments) {
                throw new Error('No function call found in response');
            }

            const args = JSON.parse(response.choices[0].message.function_call.arguments);

            return {
                response: args,
                success: true,
            };
        } catch (error) {
            return {
                response: {},
                success: false,
                error,
            };
        }
    }
}

export default OpenAIDataTransformationAgent;
