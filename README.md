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

- Node.js (or another JavaScript runtime environment like Bun)
- OpenAI API Key

## Getting Started

Import the agent you want to use into your project:

```typescript
import { OpenAIDataTransformationAgent } from 'function-agents';
```

```typescript
import { OpenAIMathAgent } from 'function-agents';
```

## Usage

### OpenAIDataTransformationAgent

This agent is responsible for transforming unstructured text into a structured JSON response using OpenAI's API.

#### Parameters

1. `openai_api_key`: Your OpenAI API Key.
2. `model`: The name of the OpenAI model. Must be either `gpt-3.5-turbo-0613` or `gpt-4-0613` or `gpt-4-32k-0613` 
3. `functionDefinition`: The function definition in JSON format.
4. `systemMessage`: Optional. The system message in string format. Defaults to "You are a data transformation agent. You can transform data from one format to another. You take in unstructured text and you use your functions to return structured, valid JSON responses" if a systemMessage is not provided.


```typescript
import { OpenAIDataTransformationAgent } from 'function-agents';

// Your function definition in JSON format (see examples here https://platform.openai.com/docs/guides/gpt/function-calling )
  const functionDefinition = {
    name: 'convertTemperature',
    description: 'Converts a temperature value from one unit to another.',
    parameters: {
        type: 'object',
        properties: {
            temperature_number: {
                type: 'number',
                description: 'The temperature value to be converted',
            },
            temperature_current_type: {
                type: 'string',
                description: 'The current unit of the temperature value. Options are "Celsius", "Fahrenheit", or "Kelvin"',
            },
            temperature_desired_type: {
                type: 'string',
                description: 'The desired unit for the converted temperature. Options are "Celsius", "Fahrenheit", or "Kelvin"',
            },
        },
        required: ['temperature_number', 'temperature_current_type', 'temperature_desired_type'],
    },
  };

// Initialize the agent
const agent = new OpenAIDataTransformationAgent(
  'your-openai-api-key',
  'gpt-3.5-turbo-0613',
  functionDefinition,
);


/*
  Note: You can optionally pass a system message to the agent upon initialization. It defaults to "You are a data transformation agent. You can transform data from one format to another. You take in unstructured text and you use your functions to return structured, valid JSON responses" if a systemMessage is not provided.

  const agent = new OpenAIDataTransformationAgent(
    'your-openai-api-key',
    'gpt-3.5-turbo-0613',
    functionDefinition,
    systemMessage,
  );
*/


// Call the run method on the agent
 const response = await agent.run('I want to convert a temperature in Fahrenheit to Celsius. It is 32 degrees Fahrenheit.');
```

If you were to `console.log` out the response, you would see the following:
```

OpenAIDataTransformationAgent Agent invoked with: Convert 100 degrees Fahrenheit to Celsius 

response {
  json: {
    temperature_number: 100,
    temperature_current_type: "Fahrenheit",
    temperature_desired_type: "Celsius"
  },
  success: true
}
```

### OpenAIMathAgent
This agent specializes in performing simple mathematical computations and returns the results.

#### Parameters

1. `openai_api_key`: Your OpenAI API Key.
2. `model`: The name of the OpenAI model. Must be either `gpt-3.5-turbo-0613` or `gpt-4-0613` or `gpt-4-32k-0613` 
3. `functionDefinition`: The function definition in JSON format.
4. `systemMessage`: Optional. The system message in string format. Defaults to "You are a data transformation agent. You can transform data from one format to another. You take in unstructured text and you use your functions to return structured, valid JSON responses" if a systemMessage is not provided.

```javascript
import { OpenAIMathAgent } from 'function-agents';

// Initialize the agent
const mathAgent = new OpenAIMathAgent(
  'your-openai-api-key',
  'gpt-3.5-turbo-0613', // Note: GPT 3.5 struggles unless the prompt is extremely clear which numbers are being operated on. GPT 4 is recommended.
);

// Example usage
const response = await mathAgent.run('If Johnny has five apples, and Susie gives him two additional apples, how many apples does Johnny have?');
```

If you were to `console.log` out the response, you would see the following:
```
OpenAIMath Agent invoked with: If Johnny has five apples, and Susie gives him two additional apples, how many apples does Johnny have? 

dataTransformation method invoked with: Johnny has five apples, and Susie gives him two additional apples. 

OpenAIDataTransformationAgent Agent invoked with: Johnny has five apples, and Susie gives him two additional apples. 

mathOperation method invoked with: {"input1":5,"input2":2,"operation":"add"} 

add method invoked with: 5 2 

response {
  json: {
    result: 7
  },
  success: true
}
```

## Return Value for Agent.run()

The `run` method for both agents returns a Promise of type `FunctionAgentJsonResponse`.

```typescript
type FunctionAgentResponse = {
  json: any;
  success: boolean;
  error?: unknown;
};
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
