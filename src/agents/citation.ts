import OpenAIApi from 'openai';
import { ChatCompletionMessageWithFunction, FunctionAgentMessageResponseWithCitation } from '@/types';
import BaseAgent from '@/agents/base-agent';

/**
 * CitationAgent Class
 *
 * This class serves as an agent for providing citations alongside responses to user queries, leveraging the OpenAI API.
 * The agent generates a function call to produce a cited response, returning a JSON object containing the response text,
 * a citation object that includes the filename and page number, an explanation of why this source was chosen, and flags indicating success and duration.
 *
 * The class utilizes OpenAI's Function Calling feature, defining a citation function schema to guide the model in delivering cited answers based on the provided context.
 *
 * @example
 *
 * const agent = new CitationAgent('openai-api-key', 'gpt-4-0613');
 * const context = `...`; // Your context goes here
 * const userMessage = 'What is bubble sort?';
 * const response = await agent.run(userMessage, context);
 *
 * console.log(response);
 *
 * response {
 *  message: 'Bubble sort is an algorithm...',
 *  citation: {
 *    filename: 'algorithms.pdf',
 *    pageNumber: 42,
 *    explanationOfWhyThisSourceWasChosen: 'This source provides a concise explanation'
 *  },
 *  success: true,
 *  duration: 4000
 * }
 */
class CitationAgent extends BaseAgent {
    private systemMessage: string;

    constructor(
        openai_api_key: string,
        model: string,
        systemMessage: string = 'You are a helpful AI Assistant. You must use your citation function to return the source used from the context provided when answering the question.'
    ) {
        super(openai_api_key, model);

        this.systemMessage = systemMessage;
    }

    // Handle context retrieval outside of this agent, and pass in the string of the context alongside the userMessage.
    async run(userMessage: string, context: string): Promise<FunctionAgentMessageResponseWithCitation> {
        if (!userMessage) {
            throw new Error('Missing user message');
        }

        if (!context) {
            throw new Error('Missing context');
        }

        console.log('CitationAgent invoked with:', userMessage, '\n');
        const startTime = Date.now();
        try {
            const messages: ChatCompletionMessageWithFunction[] = [
                {
                    role: 'system',
                    content: this.systemMessage,
                },
                {
                    role: 'user',
                    content: userMessage,
                },
                {
                    role: 'function',
                    name: 'context',
                    content: context,
                },
            ];

            const citationFunction: OpenAIApi.Chat.ChatCompletionCreateParams.Function = {
                name: 'citation',
                description: 'Returns the citation of source used from the context provided as well the response to the user message',
                parameters: {
                    type: 'object',
                    properties: {
                        responseToUsersMessage: {
                            type: 'string',
                            description: 'The response to the user message',
                        },
                        filename: {
                            type: 'string',
                            description: 'The filename of the source used from the context provided.',
                        },
                        pageNumber: {
                            type: 'number',
                            description: 'The page number of the source used from the context provided.',
                        },
                        explanationOfWhyThisSourceWasChosen: {
                            type: 'string',
                            description: 'Explain why this source was chosen, or why no source was chosen',
                        },
                    },
                    required: ['filename', 'pageNumber', 'explanationOfWhyThisSourceWasChosen', 'responseToUsersMessage'],
                },
            };

            const response: OpenAIApi.Chat.ChatCompletion = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                functions: [citationFunction],
                temperature: 0, // We might want to make this configurable in the future
            });

            if (!response.choices[0].message?.function_call?.name || !response.choices[0].message?.function_call?.arguments) {
                throw new Error(`No function call found in response: ${JSON.stringify(response)}`);
            }

            const args = JSON.parse(response.choices[0].message.function_call.arguments);

            console.log('CitationAgent successfully completed in ', Date.now() - startTime, 'ms\n');

            return {
                message: args.responseToUsersMessage,
                citation: {
                    filename: args.filename,
                    pageNumber: args.pageNumber,
                    explanationOfWhyThisSourceWasChosen: args.explanationOfWhyThisSourceWasChosen,
                },
                context,
                success: true,
                duration: Date.now() - startTime, // duration in ms
            };
        } catch (error) {
            console.log('CitationAgent failed in ', Date.now() - startTime, 'ms\n');

            return {
                message: 'An error occurred while running the agent.',
                context,
                success: false,
                error: JSON.stringify(error),
                duration: Date.now() - startTime, // duration in ms
            };
        }
    }
}

export default CitationAgent;
