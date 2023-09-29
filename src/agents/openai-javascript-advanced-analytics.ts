import OpenAIApi from 'openai';
import {
    ChatCompletionMessageWithFunction,
    FunctionAgentJsonResponse,
    FunctionAgentMessageResponse,
    FunctionAgentCodeResponse,
} from '@/types';
import OpenAIJavascriptDeveloperAgent from '@/agents/openai-javascript-developer';
import OpenAIJavaScriptInterpreter from '@/agents/openai-javascript-interpreter';

/**
 * OpenAIJavaScriptAdvancedAnalyticsAgent Class
 * 
 * This class serves as a specialized analytics agent that orchestrates various sub-agents
 * for interpreting and running JavaScript code based on prompts from the OpenAI API. The agent
 * is responsible for generating JavaScript functions, interpreting those functions to fit OpenAI's
 * Function Calling Schema, and executing the dynamically generated functions.
 * 
 * The class maintains private instances of OpenAIJavascriptDeveloperAgent and OpenAIJavaScriptInterpreter,
 * which handle the actual function generation and interpretation tasks, respectively.
 * 
 * Usage:
 * const analyticsAgent = new OpenAIJavaScriptAdvancedAnalyticsAgent(apiKey, model);
 * const response: FunctionAgentMessageResponse = await analyticsAgent.run('Calculate the square root of 20.');
 * 
 * @example
 * 
 * const analyticsAgent = new OpenAIJavaScriptAdvancedAnalyticsAgent('openai-api-key', 'gpt-4-0613');
 * const response = await analyticsAgent.run('Calculate the square root of 20.');
 */
class OpenAIJavaScriptAdvancedAnalyticsAgent {
    private openai: OpenAIApi;
    private model: string;
    private javascriptDeveloperAgent: OpenAIJavascriptDeveloperAgent;
    private javascriptInterpreterAgent: OpenAIJavaScriptInterpreter;

    constructor(openai_api_key: string, model: string) {
        this.openai = new OpenAIApi({
            apiKey: openai_api_key,
        });

        this.model = model;

        this.javascriptDeveloperAgent = new OpenAIJavascriptDeveloperAgent(openai_api_key, model);

        this.javascriptInterpreterAgent = new OpenAIJavaScriptInterpreter(openai_api_key, model);
    }

    async run(userMessage: string): Promise<FunctionAgentMessageResponse> {
        console.log('OpenAIJavaScriptAdvancedAnalyticsAgent invoked with:', userMessage, '\n');
        const startTime = Date.now();
        try {
            // Prompt OpenAI to generate a prompt to generate a JavaScript function to complete the task
            const messages: OpenAIApi.Chat.ChatCompletionMessage[] = [
                {
                    role: 'system',
                    content:
                        'You are an advanced Javascript Analytics agent and a prompt engineering expert. Think step by step. In your response, include only the prompt for generating a JavaScript function to complete the task in the user message. Do not provide any commentary or ask any additional questions. Think step by step.',
                },
                {
                    role: 'user',
                    content: userMessage,
                },
            ];

            const response: OpenAIApi.Chat.ChatCompletion = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                temperature: 0,
            });

            if (!response.choices[0].message?.content) {
                throw new Error(`No content found in response: ${JSON.stringify(response)}`);
            }

            // The prompt to generate a JavaScript function from the response
            const promptToGenerateFunction = response.choices[0].message?.content;

            // Generate the JavaScript function
            const functionResponse: FunctionAgentCodeResponse = await this.javascriptDeveloperAgent.run(promptToGenerateFunction);

            // Check if the function was generated successfully
            if (!functionResponse.success) {
                throw new Error(`Error generating function: ${JSON.stringify(functionResponse)}`);
            }

            // Get the JavaScript function code from the response
            const functionCode = functionResponse.code;

            // Interpret the JavaScript function to get the OpenAI Function Calling Schema
            const interpreterResponse: FunctionAgentJsonResponse = await this.javascriptInterpreterAgent.run(functionCode);

            // Check if the function was interpreted successfully
            if (!interpreterResponse.success) {
                throw new Error(`Error interpreting function: ${JSON.stringify(interpreterResponse)}`);
            }

            const interpretedFunction: OpenAIApi.Chat.ChatCompletionCreateParams.Function = interpreterResponse.json;
            console.log('Generated OpenAI Function Call:', JSON.stringify(interpretedFunction, null, 2) + '\n');

            // Prompt OpenAI to call the interpreted function
            const functionCallMessages: OpenAIApi.Chat.ChatCompletionMessage[] = [
                {
                    role: 'system',
                    content:
                        'You are an advanced Javascript Analytics agent. You must use your functions to accomplish the task at hand. Do not provide any commentary or ask any additional questions, just use your functions.',
                },
                {
                    role: 'user',
                    content: userMessage,
                },
            ];

            const functionCallResponse: OpenAIApi.Chat.ChatCompletion = await this.openai.chat.completions.create({
                model: this.model,
                messages: functionCallMessages,
                functions: [interpretedFunction],
                temperature: 0,
            });

            if (
                !functionCallResponse.choices[0].message?.function_call?.name ||
                !functionCallResponse.choices[0].message?.function_call?.arguments
            ) {
                throw new Error(`No function call found in functionCallResponse: ${JSON.stringify(functionCallResponse)}`);
            }

            const args = JSON.parse(functionCallResponse.choices[0].message.function_call.arguments);

            // Dynamically execute the generated JavaScript function
            // Extract parameter names from the interpreted function schema
            const paramNames = Object.keys(interpretedFunction.parameters?.properties || {});
            const paramValues = paramNames.map(name => args[name]); // Assuming `args` contains the actual values

            // Generate the dynamic function using `new Function`
            const functionArgs = paramNames.join(', ');
            const functionToExecute = new Function(functionArgs, `return ${functionCode}(${functionArgs});`);

            // Call the dynamic function
            const functionResult = functionToExecute(...paramValues);

            console.log('Function result:', functionResult + '\n');

            // Generate the final response to the user
            const finalResponseMessages: ChatCompletionMessageWithFunction[] = [
                {
                    role: 'system',
                    content: 'You are an advanced Javascript Analytics agent.',
                },
                {
                    role: 'user',
                    content: userMessage,
                },
                {
                    role: 'function',
                    name: interpretedFunction.name,
                    content: `${functionResult}`,
                },
            ];

            const finalResponse: OpenAIApi.Chat.ChatCompletion = await this.openai.chat.completions.create({
                model: this.model,
                messages: finalResponseMessages,
                temperature: 0,
            });

            if (!finalResponse.choices[0].message?.content) {
                throw new Error(`No content found in finalResponse: ${JSON.stringify(finalResponse)}`);
            }

            const finalResponseMessage = finalResponse.choices[0].message.content;

            console.log('OpenAIJavaScriptAdvancedAnalyticsAgent successfully completed in ', Date.now() - startTime, 'ms\n');

            return {
                message: finalResponseMessage,
                success: true,
                duration: Date.now() - startTime, // duration in ms
            };
        } catch (error) {
            console.log('OpenAIJavaScriptAdvancedAnalyticsAgent failed in ', Date.now() - startTime, 'ms\n');

            return {
                message: 'An error occurred while running the agent.',
                success: false,
                error,
                duration: Date.now() - startTime, // duration in ms
            };
        }
    }
}

export default OpenAIJavaScriptAdvancedAnalyticsAgent;
