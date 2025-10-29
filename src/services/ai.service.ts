import { getGeminiModel } from '../config/gemini';
import { ILead, IOffer, IGeminiResponse } from '../types';
import { logger } from '../utils/logger';

export class AIService {
  private model = getGeminiModel();

  async classifyIntent(lead: ILead, offer: IOffer): Promise<IGeminiResponse> {
    try {
      const prompt = this.buildPrompt(lead, offer);
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return this.parseGeminiResponse(text);
    } catch (error) {
      logger.error('AI classification error:', error);
      // Fallback to default
      return {
        intent: 'Low',
        reasoning: 'AI classification unavailable, defaulted to Low intent.',
      };
    }
  }

  async classifyIntentBatch(
    leads: ILead[],
    offer: IOffer
  ): Promise<IGeminiResponse[]> {
    const batchSize = 10;
    const results: IGeminiResponse[] = [];

    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      const promises = batch.map((lead) => this.classifyIntent(lead, offer));
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return results;
  }

  private buildPrompt(lead: ILead, offer: IOffer): string {
    const systemInstruction = `You are an AI assistant specialized in B2B lead qualification and sales intelligence. Your task is to analyze leads and determine their buying intent for specific products or services.`;

    const userMessage = `
Analyze this lead's buying intent for our product/offer:

PRODUCT/OFFER:
- Name: ${offer.name}
- Value Propositions: ${offer.value_props.join(', ')}
- Ideal Use Cases: ${offer.ideal_use_cases.join(', ')}

LEAD INFORMATION:
- Name: ${lead.name}
- Role: ${lead.role}
- Company: ${lead.company}
- Industry: ${lead.industry}
- Location: ${lead.location}
- LinkedIn Bio: ${lead.linkedin_bio || 'Not provided'}

TASK:
Classify this lead's buying intent as High, Medium, or Low based on:
1. Role relevance to decision-making
2. Industry alignment with ideal use cases
3. Potential pain points this offer could solve
4. Likelihood of having budget authority

Respond ONLY in this exact JSON format (no additional text):
{
  "intent": "High|Medium|Low",
  "reasoning": "One concise sentence explaining the classification"
}
`;

    return `${systemInstruction}\n\n${userMessage}`;
  }

  private parseGeminiResponse(text: string): IGeminiResponse {
    try {
      // Remove markdown code blocks if present
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedText);

      // Validate intent
      const validIntents: Array<'High' | 'Medium' | 'Low'> = ['High', 'Medium', 'Low'];
      const intent = validIntents.includes(parsed.intent)
        ? parsed.intent
        : 'Medium';

      return {
        intent,
        reasoning: parsed.reasoning || 'AI analysis completed.',
      };
    } catch (error) {
      logger.error('Failed to parse Gemini response:', text, error);
      return {
        intent: 'Medium',
        reasoning: 'Unable to parse AI response, defaulted to Medium intent.',
      };
    }
  }
}
