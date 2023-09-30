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
import { JavaScriptFunctionCallTransformationAgent } from 'function-agents';

const javascriptFunctionCallTransformationAgent = new JavaScriptFunctionCallTransformationAgent(
    'your-openai-api-key',
    'gpt-4-0613' // or any other supported model
);

const result = await javascriptFunctionCallTransformationAgent.run('function add(a, b) { return a + b; }');
```

## Agents

Here's a list of available agents with brief descriptions and direct links to their code:

### Data Transformation

-   **[DataTransformationAgent](https://github.com/mattlgroff/function-agents/blob/main/src/agents/data-transformation.ts)**
    -   Transforms data based on predefined rules. Currently only supports JSON.

### Intent Classification

-   **[IntentClassificationAgent](https://github.com/mattlgroff/function-agents/blob/main/src/agents/intent-classification.ts)**
    -   Classifies user intents based on a set of predefined intents.

### Sentiment Classification

-   **[SentimentClassificationAgent](https://github.com/mattlgroff/function-agents/blob/main/src/agents/sentiment-classification.ts)**
    -   Classifies user message's sentiment.

### Code Interpretation

-   **[JavaScriptCodeInterpreterAgent](https://github.com/mattlgroff/function-agents/blob/main/src/agents/javascript-code-interpreter.ts)**
    -   Interprets and runs JavaScript code based on prompts from the OpenAI API.

### Function Call Transformation

-   **[JavaScriptFunctionCallTransformationAgent](https://github.com/mattlgroff/function-agents/blob/main/src/agents/javascript-function-call-transformation.ts)**
    -   Transforms JavaScript functions to fit OpenAI's Function Calling Schema.

### JavaScript Development

-   **[JavascriptDeveloperAgent](https://github.com/mattlgroff/function-agents/blob/main/src/agents/javascript-developer.ts)**
    -   Generates JavaScript functions based on user-provided prompts.

### Math Operations

-   **[MathAgent](https://github.com/mattlgroff/function-agents/blob/main/src/agents/math.ts)**
    -   Performs mathematical operations based on user requests. (addition, subtraction, multiplication, and division so far))

## Parameters

1. `openai_api_key`: Your OpenAI API Key.
2. `model`: The name of the OpenAI model. Must be either `gpt-3.5-turbo-0613` or `gpt-4-0613` or `gpt-4-32k-0613`

Note: Some agents may have additional parameters such as the `IntentClassificationAgent` which requires a list of intents to be passed in.

## Example Console Output

```bash
JavaScriptCodeInterpreterAgent invoked with: What is the square root of 20?

JavascriptDeveloperAgent invoked with: Write a JavaScript function to calculate the square root of 20.

function calculateSquareRoot() {
    return Math.sqrt(20);
}

JavascriptDeveloperAgent successfully completed in  1827 ms

JavaScriptFunctionCallTransformationAgent invoked with function code and arguments: function calculateSquareRoot() {
    return Math.sqrt(20);
}

JavaScriptInterpreterAgent successfully completed in  3111 ms

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

JavaScriptCodeInterpreterAgent successfully completed in  11787 ms

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
