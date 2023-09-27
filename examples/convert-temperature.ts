import { OpenAIDataTransformationAgent } from 'function-agents';

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

const systemMessage = 'You are a data transformation agent. You can transform data from one format to another. You take in unstructured text and you use your functions to return structured, valid JSON responses.';


try {
  const agent = new OpenAIDataTransformationAgent(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-0613', functionDefinition, systemMessage);

  const response = await agent.run('I want to convert a temperature in Fahrenheit to Celsius. It is 32 degrees Fahrenheit.')
  
  console.log('response', response);
} catch (error) {
  console.log('error', error);
}