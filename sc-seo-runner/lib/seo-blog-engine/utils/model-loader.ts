import 'server-only';
import { generateText } from 'ai';

/**
 * Model configuration with fallback strategy
 * Supports multiple AI providers via Vercel AI Gateway
 */

export type ModelProvider = 'anthropic' | 'openai' | 'google' | 'fallback';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  temperature?: number;
}

/**
 * Load model configuration based on environment and agent type
 * Falls back to Claude 3.5 Sonnet if not configured
 */
export function getModelConfig(agentType: string): ModelConfig {
  // Check for explicit model override in env vars
  const envModelKey = `${agentType.toUpperCase()}_MODEL`;
  const envModel = process.env[envModelKey];

  if (envModel) {
    return parseModelString(envModel);
  }

  // Default: Use Claude 3.5 Sonnet via Vercel AI Gateway
  // All major models are available zero-config through the gateway
  return {
    provider: 'anthropic',
    model: 'anthropic/claude-3-5-sonnet-20241022',
    temperature: 0.7,
  };
}

/**
 * Parse model string format: "provider/model-name"
 * Example: "anthropic/claude-3-5-sonnet-20241022"
 */
function parseModelString(modelStr: string): ModelConfig {
  const [provider, ...rest] = modelStr.split('/');
  const model = rest.join('/');

  if (!provider || !model) {
    throw new Error(`Invalid model string format: ${modelStr}. Expected: provider/model-name`);
  }

  return {
    provider: provider as ModelProvider,
    model,
    temperature: 0.7,
  };
}

/**
 * Generate text using configured AI model
 * Wrapper around AI SDK's generateText with proper error handling
 */
export async function generateAgentResponse(
  modelConfig: ModelConfig,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  try {
    console.log(
      `[v0] Calling model: ${modelConfig.model} with ${userMessage.length} char prompt`
    );

    const result = await generateText({
      model: modelConfig.model,
      system: systemPrompt,
      prompt: userMessage,
      temperature: modelConfig.temperature,
    });

    console.log(`[v0] Model response: ${result.text.substring(0, 100)}...`);
    return result.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[v0] Model call failed: ${errorMessage}`);
    throw new Error(`AI model call failed: ${errorMessage}`);
  }
}

/**
 * Validate model configuration at startup
 */
export function validateModelConfig(config: ModelConfig): boolean {
  if (!config.model || !config.provider) {
    console.error('[v0] Invalid model config:', config);
    return false;
  }

  // Model string should include provider prefix
  if (!config.model.includes('/')) {
    console.error(
      '[v0] Model should include provider prefix (e.g., "anthropic/claude-3-5-sonnet")'
    );
    return false;
  }

  return true;
}
