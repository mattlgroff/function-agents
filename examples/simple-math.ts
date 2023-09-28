import { OpenAIMathAgent } from 'function-agents';

try {
    const agent = new OpenAIMathAgent(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-0613');

    const response = await agent.run('If Johnny has five apples, and Susie gives him two additional apples, how many apples does Johnny have?');

    console.log('response', response);
} catch (error) {
    console.log('error', error);
}
