import OpenAIApi from 'openai';

export type FunctionAgentMessageResponse = {
    message: string;
    success: boolean;
    duration: number; // Time in ms
    error?: unknown;
};

export interface Citation {
    filename: string;
    pageNumber: number;
    explanationOfWhyThisSourceWasChosen: string;
}

export type FunctionAgentMessageResponseWithCitation = FunctionAgentMessageResponse & {
  citation?: Citation;
  context: string;
};

export type FunctionAgentJsonResponse = {
    json: any;
    success: boolean;
    duration: number; // Time in ms
    error?: unknown;
};

export type FunctionAgentCodeResponse = {
    code: string;
    language: 'javascript'; // Add more languages in the future as needed.
    success: boolean;
    duration: number; // Time in ms
    error?: unknown;
};

export interface ChatCompletionMessageWithFunction extends OpenAIApi.Chat.ChatCompletionMessage {
    name?: string;
}
