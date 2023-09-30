import OpenAIApi from 'openai';

class BaseAgent {
    protected openai: OpenAIApi;
    protected model: string;

    constructor(openai_api_key: string, model: string) {
        if (!openai_api_key) {
            throw new Error('Missing OpenAI API key');
        }

        if (!model) {
            throw new Error('Missing model identifier');
        }

        this.openai = new OpenAIApi({
            apiKey: openai_api_key,
        });

        this.model = model;
    }
}

export default BaseAgent;
