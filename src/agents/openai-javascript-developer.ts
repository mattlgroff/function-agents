import OpenAIApi from 'openai';
import { FunctionAgentCodeResponse } from '@/types';

/**
 * OpenAIJavascriptDeveloperAgent Class
 *
 * This class is responsible for generating valid JavaScript code based on a given natural language request.
 * It utilizes the OpenAI API to get model completions tailored to JavaScript development, given a predefined system message
 * and user input in natural language.
 *
 * Usage:
 * const jsDeveloperAgent = new OpenAIJavascriptDeveloperAgent(apiKey, model, systemMessage);
 * const response: FunctionAgentCodeResponse = await jsDeveloperAgent.run('Write a function to reverse a string in JavaScript.');
 *
 * @example
 *
 * const agent = new OpenAIJavascriptDeveloperAgent('openai-api-key', 'gpt-4-0613');
 *
 * const response = await agent.run('Write a function that reverses a string.');
 */
class OpenAIJavascriptDeveloperAgent {
    private openai: OpenAIApi;
    private model: string;
    private systemMessage: string;

    constructor(
        openai_api_key: string,
        model: string,
        systemMessage: string = 'You are an expert JavaScript developer agent. Your primary task is to generate valid JavaScript code based on the natural language requirements presented to you. Never write code that exposes secrets or environmental variables. When asked to write code, your response should consist solely of valid JavaScript code with no accompanying commentary or explanation. Do not ask further questions; just think step by step and return the requested JavaScript code. Do not return in a codeblock or with any comments or console log examples. Return only valid Javascript code. Do not explain your steps in your output.'
    ) {
        this.openai = new OpenAIApi({
            apiKey: openai_api_key,
        });

        this.model = model;
        this.systemMessage = systemMessage;
    }

    async run(userMessage: string): Promise<FunctionAgentCodeResponse> {
        console.log('OpenAIJavascriptDeveloperAgent invoked with:', userMessage, '\n');
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

            const response: OpenAIApi.Chat.ChatCompletion = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                temperature: 0.2, // We might want to make this configurable in the future
            });

            if (!response.choices[0].message?.content) {
                throw new Error(`No content found in response: ${JSON.stringify(response)}`);
            }

            const generatedCode = response.choices[0].message.content;

            console.log('OpenAIJavascriptDeveloperAgent successfully completed in ', Date.now() - startTime, 'ms\n');

            return {
                code: generatedCode,
                language: 'javascript',
                success: true,
                duration: Date.now() - startTime, // duration in ms
            };
        } catch (error) {
            console.log('OpenAIJavascriptDeveloperAgent failed in ', Date.now() - startTime, 'ms\n');

            return {
                code: '',
                language: 'javascript',
                success: false,
                error: JSON.stringify(error),
                duration: Date.now() - startTime, // duration in ms
            };
        }
    }
}

export default OpenAIJavascriptDeveloperAgent;
