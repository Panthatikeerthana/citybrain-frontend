import { apiFetch } from './api';

export interface AiChatRequest {
  message: string;
}

export interface AiChatResponse {
  response: string;
  status?: string;
  timestamp?: string;
}

/**
 * Sends a natural language query to the Spring Boot Gemini AI assistant.
 * Uses centralized apiFetch to automatically inject the JWT Bearer token.
 */
export const sendAiMessage = async (message: string): Promise<string> => {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error('Message cannot be blank');
  }

  const response = await apiFetch('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message: trimmed }),
  });

  if (!response.ok) {
    let errMsg = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      errMsg = errorJson.message || errorJson.error || errMsg;
    } catch {
      // response body was not JSON
    }

    if (response.status === 401) {
      throw new Error('Session expired or unauthorized. Please log in to consult City Brain AI.');
    }
    if (response.status === 429) {
      throw new Error(errMsg || 'Rate limit exceeded: Too many AI requests. Please wait a minute before querying again.');
    }
    if (response.status === 400) {
      throw new Error(errMsg || 'Validation failed: Invalid message format or message too long.');
    }
    throw new Error(errMsg);
  }

  const data: AiChatResponse = await response.json();
  return data.response;
};
