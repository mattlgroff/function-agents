import { OpenAIJavaScriptFunctionCallTransformationAgent } from 'function-agents';

try {
    const agent = new OpenAIJavaScriptFunctionCallTransformationAgent(process.env.OPENAI_API_KEY, 'gpt-4-0613');

    const response = await agent.run("function reverseString(str) {\n    return str.split('').reverse().join('');\n}");

    console.log('response', response);
} catch (error) {
    console.log('error', error);
}
