# function-agents

## Introduction

`function-agents` is a collection of Function Agents with specific purposes, designed to simplify various tasks. To use these agents, you'll need to pass an OpenAI API Key upon construction. This package allows you to interact with different OpenAI agents, transforming unstructured text into a structured JSON response.

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

Import the package and initialize it as follows:

```javascript
import { OpenAIDataTransformationAgent } from 'function-agents';
```

## Usage

### OpenAIDataTransformationAgent

This agent is responsible for transforming unstructured text into a structured JSON response using OpenAI's API.

```javascript
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
```js
response {
  json: {
    temperature_number: 32,
    temperature_current_type: "Fahrenheit",
    temperature_desired_type: "Celsius"
  },
  success: true
}
```

#### Parameters

1. `openai_api_key`: Your OpenAI API Key.
2. `model`: The name of the OpenAI model. Must be either `gpt-3.5-turbo-0613` or `gpt-4-0613` or `gpt-4-32k-0613` 
3. `functionDefinition`: The function definition in JSON format.
4. `systemMessage`: The system message in string format.

#### Return Value

The `transform` function for OpenAIDataTransformationAgent returns a Promise of type `FunctionAgentResponse`.

```
type FunctionAgentResponse = {
  json: any;
  success: boolean;
  error?: unknown;
};
```

## Contributing

We welcome contributions! Please feel free to submit a pull request.

## License

This package is under the MIT License. See `LICENSE` file for more details.
