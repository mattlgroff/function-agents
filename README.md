# function-agents

## Introduction

`function-agents` is a collection of Function Agents with specific purposes, designed to simplify various tasks. To use these agents, you'll need to pass an OpenAI API Key upon construction.

For more examples and the full documentation, please visit [https://platform.openai.com/docs/guides/gpt/function-calling](https://platform.openai.com/docs/guides/gpt/function-calling).

## Installation

To install the package, run the following command:

```bash
npm install function-agents
```

## Dependencies

-   Node.js (or another JavaScript runtime environment like Bun)
-   OpenAI API Key

## Getting Started

Import the agent you want to use into your project:

```typescript
import { OpenAIDataTransformationAgent } from 'function-agents';
import { OpenAIJavascriptDeveloperAgent } from 'function-agents';
import { OpenAIMathAgent } from 'function-agents';
import { OpenAIJavascriptAdvancedAnalyticsAgent } from 'function-agents';

const jsInterpreterAgent = new OpenAIJavascriptInterpreterAgent(
    'your-openai-api-key',
    'gpt-4-0613' // or any other supported model
);

const result = await jsInterpreterAgent.run('function add(a, b) { return a + b; }');
```

## Agents
* OpenAIDataTransformationAgent - `/src/agents/openai-data-transformation.ts`
* OpenAIMathAgent - `/src/agents/openai-math.ts`
* OpenAIJavascriptDeveloperAgent - `/src/agents/openai-javascript-developer.ts`
* OpenAIJavascriptInterpreterAgent - `/src/agents/openai-javascript-interpreter.ts`
* OpenAIJavascriptAdvancedAnalyticsAgent - `/src/agents/openai-javascript-advanced-analytics.ts`

## Parameters

1. `openai_api_key`: Your OpenAI API Key.
2. `model`: The name of the OpenAI model. Must be either `gpt-3.5-turbo-0613` or `gpt-4-0613` or `gpt-4-32k-0613`
3. `systemMessage`: Optional. Some agents allow you to pass your own systemMessage.

## Example Console Output

```bash
OpenAIJavaScriptAdvancedAnalyticsAgent invoked with: What is the square root of 20? 

OpenAIJavascriptDeveloperAgent invoked with: Write a JavaScript function to calculate the square root of 20.

function calculateSquareRoot() {
    return Math.sqrt(20);
}

OpenAIJavascriptDeveloperAgent successfully completed in  1827 ms

OpenAIJavaScriptInterpreterAgent invoked with function code and arguments: function calculateSquareRoot() {
    return Math.sqrt(20);
} 

OpenAIJavaScriptInterpreterAgent successfully completed in  3111 ms

Generated OpenAI Function Call: {
  "name": "calculateSquareRoot",
  "description": "This function returns the square root of 20.",
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  }
}

Calling function with params: 

Function result: 4.47213595499958

OpenAIJavaScriptAdvancedAnalyticsAgent successfully completed in  11787 ms

# console.log(response); from agent.run()
response {
  message: "The square root of 20 is approximately 4.47.",
  success: true,
  duration: 11787
}
```

## Build Instructions

Install [Bun](https://bun.sh/)

Run the following commands:

```bash
bun install

bun run build
```

## Contributing

We welcome contributions! Please feel free to submit a pull request.

## License

This package is under the MIT License. See `LICENSE` file for more details.
