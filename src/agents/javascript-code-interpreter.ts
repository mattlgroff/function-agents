import OpenAIApi from 'openai';
import {
    ChatCompletionMessageWithFunction,
    FunctionAgentJsonResponse,
    FunctionAgentMessageResponse,
    FunctionAgentCodeResponse,
} from '@/types';
import JavascriptDeveloperAgent from '@/agents/javascript-developer';
import JavaScriptFunctionCallTransformationAgent from '@/agents/javascript-function-call-transformation';
import BaseAgent from '@/agents/base-agent';

/**
 * JavaScriptCodeInterpreterAgent Class
 *
 * This class serves as a specialized code interpreter agent that orchestrates various sub-agents
 * for interpreting and running JavaScript code based on prompts from the OpenAI API. The agent
 * is responsible for generating JavaScript functions, interpreting those functions to fit OpenAI's
 * Function Calling Schema, and executing the dynamically generated functions.
 *
 * The class maintains private instances of OpenAIJavascriptDeveloperAgent and OpenAIJavaScriptInterpreter,
 * which handle the actual function generation and interpretation tasks, respectively.
 *
 * Usage:
 * const analyticsAgent = new JavaScriptCodeInterpreterAgent(apiKey, model);
 * const response: FunctionAgentMessageResponse = await analyticsAgent.run('Calculate the square root of 20.');
 *
 * @example
 *
 * const analyticsAgent = new OpenAIJavaScriptAdvancedAnalyticsAgent('openai-api-key', 'gpt-4-0613');
 * const response = await analyticsAgent.run('Calculate the square root of 20.');
 */
class JavaScriptCodeInterpreterAgent extends BaseAgent {
    private javascriptDeveloperAgent: JavascriptDeveloperAgent;
    private javascriptFunctionCallTransformationAgent: JavaScriptFunctionCallTransformationAgent;

    constructor(openai_api_key: string, model: string) {
        super(openai_api_key, model);

        this.javascriptDeveloperAgent = new JavascriptDeveloperAgent(openai_api_key, model);

        this.javascriptFunctionCallTransformationAgent = new JavaScriptFunctionCallTransformationAgent(openai_api_key, model);
    }

    async run(userMessage: string): Promise<FunctionAgentMessageResponse> {
        // Logging the invocation and starting the timer
        console.log('OpenAIJavaScriptCodeInterpreterAgent invoked with:', userMessage, '\n');
        const startTime = Date.now();

        try {
            // Step 1: Generate a prompt for creating a JavaScript function based on the user's message
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

            // Error handling: Check if a prompt was actually generated
            if (!response.choices[0].message?.content) {
                throw new Error(`No content found in response: ${JSON.stringify(response)}`);
            }

            // Extract the generated prompt
            const promptToGenerateFunction = response.choices[0].message?.content;

            // Step 2: Generate the actual JavaScript function using the extracted prompt
            const functionResponse: FunctionAgentCodeResponse = await this.javascriptDeveloperAgent.run(promptToGenerateFunction);

            // Error handling: Check if the function was generated successfully
            if (!functionResponse.success) {
                throw new Error(`Error generating function: ${JSON.stringify(functionResponse)}`);
            }

            // Extract the generated JavaScript function code
            const functionCode = functionResponse.code;

            // Step 3: Interpret the JavaScript function to conform to OpenAI's Function Calling Schema
            const interpreterResponse: FunctionAgentJsonResponse = await this.javascriptFunctionCallTransformationAgent.run(functionCode);

            // Error handling: Check if the function was interpreted successfully
            if (!interpreterResponse.success) {
                throw new Error(`Error interpreting function: ${JSON.stringify(interpreterResponse)}`);
            }

            const interpretedFunction: OpenAIApi.Chat.ChatCompletionCreateParams.Function = interpreterResponse.json;
            console.log('Generated OpenAI Function Call:', JSON.stringify(interpretedFunction, null, 2) + '\n');

            // Step 4: Call the interpreted function using OpenAI Function Calling
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

            // Error handling: Check if the function was called successfully
            if (
                !functionCallResponse.choices[0].message?.function_call?.name ||
                !functionCallResponse.choices[0].message?.function_call?.arguments
            ) {
                throw new Error(`No function call found in functionCallResponse: ${JSON.stringify(functionCallResponse)}`);
            }

            // Parse the arguments from the function call
            const args = JSON.parse(functionCallResponse.choices[0].message.function_call.arguments);

            // Dynamically execute the generated JavaScript function
            // Extract parameter names from the interpreted function schema
            const paramNames = Object.keys(interpretedFunction.parameters?.properties || {});

            // Get the actual values for the parameters
            const paramValues = paramNames.map(name => args[name]);

            // Create the function dynamically
            const functionArgs = paramNames.join(', ');
            const functionToExecute = new Function(functionArgs, `return ${functionCode}(${functionArgs});`);

            // Step 5: Execute the function and capture the result
            const functionResult = functionToExecute(...paramValues);

            // Log the result of the function execution
            console.log('Function result:', functionResult + '\n');

            // Step 6: Generate the final response to the user
            const finalResponseMessages: ChatCompletionMessageWithFunction[] = [
                {
                    role: 'system',
                    content:
                        'You are an advanced Javascript Analytics agent. Do not show code examples to the user, just return the requested result with a brief and friendly manner.',
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

            // Create the final response using OpenAI's ChatCompletion API
            const finalResponse: OpenAIApi.Chat.ChatCompletion = await this.openai.chat.completions.create({
                model: this.model,
                messages: finalResponseMessages,
                temperature: 0,
            });

            // Error handling: Check if the final response was generated successfully
            if (!finalResponse.choices[0].message?.content) {
                throw new Error(`No content found in finalResponse: ${JSON.stringify(finalResponse)}`);
            }

            // Capture the content of the final response message
            const finalResponseMessage = finalResponse.choices[0].message.content;

            // Log the time taken and completion status
            console.log('JavaScriptCodeInterpreterAgent successfully completed in ', Date.now() - startTime, 'ms\n');

            // Return the success response to the caller
            return {
                message: finalResponseMessage,
                success: true,
                duration: Date.now() - startTime, // duration in ms
            };
        } catch (error) {
            // Log error details and time taken in case of failure
            console.log('JavaScriptCodeInterpreterAgent failed in ', Date.now() - startTime, 'ms\n');

            // Return the failure response to the caller
            return {
                message: 'An error occurred while running the agent.',
                success: false,
                error: JSON.stringify(error),
                duration: Date.now() - startTime, // duration in ms
            };
        }
    }
}

export default JavaScriptCodeInterpreterAgent;
