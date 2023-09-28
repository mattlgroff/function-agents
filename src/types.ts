export type FunctionAgentMessageResponse = {
    message: string;
    success: boolean;
    error?: unknown;
};

export type FunctionAgentJsonResponse = {
    json: any;
    success: boolean;
    error?: unknown;
};