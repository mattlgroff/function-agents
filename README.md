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

- Node.js
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

// Your function definition and system message here.
const functionDefinition = {
  // ...
};

const systemMessage = 'Your system message here';

const agent = new OpenAIDataTransformationAgent(
  'your-openai-api-key',
  'gpt-3.5-turbo-0613',
  functionDefinition,
  systemMessage
);

const response = await agent.transformer('your unstructured text');
```

#### Parameters

1. `openai_api_key`: Your OpenAI API Key.
2. `model`: The name of the OpenAI model. Must be either `gpt-3.5-turbo-0613` or `gpt-4-0613` or `gpt-4-32k-0613` 
3. `functionDefinition`: The function definition in JSON format.
4. `systemMessage`: The system message in string format.

#### Return Value

The `transformer` function for OpenAIDataTransformationAgent returns a Promise of type `FunctionAgentResponse`.

```
type FunctionAgentResponse = {
  response: any;
  success: boolean;
  error?: unknown;
};
```

## Contributing

We welcome contributions! Please feel free to submit a pull request.

## License

This package is under the MIT License. See `LICENSE` file for more details.
