import { OpenAIJavaScriptCodeInterpreterAgent } from 'function-agents';

try {
    const agent = new OpenAIJavaScriptCodeInterpreterAgent(process.env.OPENAI_API_KEY, 'gpt-4-0613');

    const response = await agent.run("What is the square root of 20?");

    console.log('response', response);
} catch (error) {
    console.log('error', error);
}
