const { GoogleGenAI } = require('@google/genai');
const ErrorResponse = require('../../utils/ErrorResponse');

/**
 * Service to manage Google Gemini API client and generation requests.
 */
class GeminiClientService {
  constructor() {
    this.client = null;
    this.cachedApiKey = null;
  }

  /**
   * Get or initialize the GoogleGenAI instance using configured API key.
   */
  getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key') {
      throw new ErrorResponse(
        'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in the backend environment.',
        503
      );
    }

    if (!this.client || this.cachedApiKey !== apiKey) {
      this.client = new GoogleGenAI({
        apiKey,
        apiVersion: 'v1beta',
      });
      this.cachedApiKey = apiKey;
    }

    return this.client;
  }

  /**
   * Direct REST fallback using Generative Language v1beta API.
   * Guarantees reliability regardless of SDK version or default path quirks.
   */
  async generateViaRest({ model, prompt, systemInstruction, responseMimeType, timeoutMs = 15000 }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ErrorResponse('Gemini API key is not configured.', 503);
    }

    const cleanModel = String(model).replace(/^models\//, '');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };
    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }
    if (responseMimeType) {
      body.generationConfig = {
        responseMimeType,
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data?.error?.message || `HTTP ${response.status}`;
        throw new Error(errorMsg);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text || typeof text !== 'string') {
        throw new Error('No candidate text returned in Gemini REST response');
      }
      return text.trim();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Get candidate models in order of preference:
   * 1. Explicitly configured GEMINI_MODEL (e.g. 'gemini-3-flash-preview')
   * 2. Verified active fallback models ('gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-3.8-flash')
   */
  getCandidateModels() {
    const configured = process.env.GEMINI_MODEL?.trim();
    const defaults = ['gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-3.8-flash'];
    if (configured) {
      return [configured, ...defaults.filter((m) => m !== configured)];
    }
    return defaults;
  }

  /**
   * Safe content generation with candidate fallbacks, timeout, structured config, and error sanitization.
   */
  async generate({ prompt, systemInstruction, responseMimeType, responseSchema, timeoutMs = 15000 }) {
    const ai = this.getClient();
    const candidates = this.getCandidateModels();

    const config = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (responseMimeType) {
      config.responseMimeType = responseMimeType;
    }
    if (responseSchema) {
      config.responseSchema = responseSchema;
    }

    let lastError = null;

    for (let i = 0; i < candidates.length; i++) {
      const model = candidates[i];
      let timerId = null;

      // 1. Try official SDK with apiVersion: 'v1beta'
      const timeoutPromise = new Promise((_, reject) => {
        timerId = setTimeout(() => {
          reject(new ErrorResponse(`AI request to ${model} timed out after ${timeoutMs}ms.`, 504));
        }, timeoutMs);
      });

      try {
        const apiCall = ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        const response = await Promise.race([apiCall, timeoutPromise]);
        if (timerId) clearTimeout(timerId);

        if (response && (response.text || typeof response.text === 'string')) {
          return response.text.trim();
        }

        throw new ErrorResponse('No text returned by Gemini AI.', 502);
      } catch (sdkError) {
        if (timerId) clearTimeout(timerId);

        // 2. Immediate direct REST fallback on the same model if SDK call fails or 404s
        try {
          const restResult = await this.generateViaRest({
            model,
            prompt,
            systemInstruction,
            responseMimeType,
            timeoutMs,
          });
          if (restResult) {
            return restResult;
          }
        } catch (restError) {
          lastError = restError;
        }

        lastError = sdkError;

        const rawMessage = lastError?.message || String(lastError);
        const isDeprecationOrNotFound =
          rawMessage.includes('404') ||
          rawMessage.toLowerCase().includes('not found') ||
          rawMessage.toLowerCase().includes('no longer available') ||
          rawMessage.toLowerCase().includes('update your code');
        const isHighDemand =
          rawMessage.includes('503') ||
          rawMessage.toLowerCase().includes('high demand') ||
          rawMessage.toLowerCase().includes('unavailable');
        const isTimeout =
          rawMessage.toLowerCase().includes('timed out') ||
          rawMessage.toLowerCase().includes('aborted') ||
          (lastError instanceof ErrorResponse && lastError.statusCode === 504);

        // If it's a 404, 503, or timeout, and we have another candidate model, fall back gracefully
        if ((isDeprecationOrNotFound || isHighDemand || isTimeout) && i < candidates.length - 1) {
          const reason = isTimeout ? 'Timed out' : (isHighDemand ? '503 (High Demand)' : '404 (Not Found)');
          console.warn(`[Gemini AI] Model ${model} ${reason}. Falling back to ${candidates[i + 1]}...`);
          continue;
        }

        // For other errors (auth, quota) or if last candidate failed, break out
        break;
      }
    }

    // Process and sanitize the final error
    if (lastError instanceof ErrorResponse) {
      throw lastError;
    }

    console.error('[Gemini AI Error]:', lastError?.message || lastError);

    // Sanitize any API key exposure in logs or error messages
    const rawMessage = lastError?.message || 'Gemini API call failed';
    let cleanMsg = rawMessage.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=***');

    try {
      const parsedJson = JSON.parse(cleanMsg);
      if (parsedJson?.error?.message) {
        cleanMsg = parsedJson.error.message;
      }
    } catch (_) {
      // Not JSON, keep cleanMsg
    }

    if (cleanMsg.toLowerCase().includes('quota') || cleanMsg.includes('429')) {
      throw new ErrorResponse('AI service rate limit exceeded. Please try again shortly.', 429);
    }
    if (cleanMsg.toLowerCase().includes('api_key') || cleanMsg.toLowerCase().includes('unauthenticated')) {
      throw new ErrorResponse('Invalid or unauthorized Gemini API key.', 401);
    }

    throw new ErrorResponse(`AI service error: ${cleanMsg}`, 502);
  }
}

const geminiService = new GeminiClientService();

module.exports = geminiService;
