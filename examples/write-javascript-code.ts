import { OpenAIJavascriptDeveloperAgent } from 'function-agents';

try {
    const agent = new OpenAIJavascriptDeveloperAgent(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-0613');

    const response = await agent.run('Write a function to reverse a string.');

    console.log('response', response);
} catch (error) {
    console.log('error', error);
}
