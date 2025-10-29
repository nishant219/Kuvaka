import { ILead, IOffer, IScoringResult } from '../types';
import { AIService } from './ai.service';
import { logger } from '../utils/logger';

export class ScoringService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  calculateRuleScore(lead: ILead, offer: IOffer): number {
    let score = 0;

    // Role relevance (max 20 points)
    score += this.scoreRole(lead.role);

    // Industry match (max 20 points)
    score += this.scoreIndustry(lead.industry, offer.ideal_use_cases);

    // Data completeness (max 10 points)
    score += this.scoreCompleteness(lead);

    return Math.min(score, 50);
  }

  scoreRole(role: string): number {
    const roleLower = role.toLowerCase();

    const decisionMakers = [
      'ceo', 'cto', 'cfo', 'coo', 'president', 'founder', 
      'owner', 'director', 'vp', 'vice president', 'head of',
      'chief', 'general manager', 'gm'
    ];

    const influencers = [
      'manager', 'lead', 'senior', 'principal', 
      'architect', 'specialist', 'coordinator'
    ];

    for (const title of decisionMakers) {
      if (roleLower.includes(title)) {
        return 20;
      }
    }

    for (const title of influencers) {
      if (roleLower.includes(title)) {
        return 10;
      }
    }

    return 0;
  }

  scoreIndustry(industry: string, idealUseCases: string[]): number {
    const industryLower = industry.toLowerCase();

    for (const useCase of idealUseCases) {
      const useCaseLower = useCase.toLowerCase();
      
      // Exact match
      if (industryLower === useCaseLower) {
        return 20;
      }

      // Partial match
      const useCaseWords = useCaseLower.split(/\s+/);
      const industryWords = industryLower.split(/\s+/);

      const hasMatch = useCaseWords.some(word => 
        industryWords.some(iWord => 
          iWord.includes(word) || word.includes(iWord)
        )
      );

      if (hasMatch) {
        return 10;
      }
    }

    return 0;
  }

  scoreCompleteness(lead: ILead): number {
    const requiredFields: (keyof ILead)[] = [
      'name', 'role', 'company', 'industry', 'location', 'linkedin_bio'
    ];

    const filledFields = requiredFields.filter(
      field => lead[field] && String(lead[field]).trim().length > 0
    );

    return filledFields.length === requiredFields.length ? 10 : 0;
  }

  async scoreLead(lead: ILead, offer: IOffer): Promise<IScoringResult> {
    // Calculate rule-based score
    const ruleScore = this.calculateRuleScore(lead, offer);

    // Get AI classification
    const aiResult = await this.aiService.classifyIntent(lead, offer);

    // Map AI intent to score
    const aiScoreMap: Record<'High' | 'Medium' | 'Low', number> = {
      High: 50,
      Medium: 30,
      Low: 10,
    };

    const aiScore = aiScoreMap[aiResult.intent];
    const totalScore = ruleScore + aiScore;

    // Determine final intent based on total score
    let finalIntent: 'High' | 'Medium' | 'Low';
    if (totalScore >= 70) {
      finalIntent = 'High';
    } else if (totalScore >= 40) {
      finalIntent = 'Medium';
    } else {
      finalIntent = 'Low';
    }

    return {
      ...lead,
      intent: finalIntent,
      score: totalScore,
      reasoning: aiResult.reasoning,
      ruleScore,
      aiScore,
    };
  }

  async scoreLeadsBatch(
    leads: ILead[],
    offer: IOffer
  ): Promise<IScoringResult[]> {
    logger.info(`Starting batch scoring for ${leads.length} leads`);

    const results: IScoringResult[] = [];

    // Process in parallel batches of 5
    const batchSize = 5;
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      const batchPromises = batch.map(lead => this.scoreLead(lead, offer));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      logger.info(`Processed ${Math.min(i + batchSize, leads.length)}/${leads.length} leads`);
    }

    logger.info(`Completed batch scoring for ${leads.length} leads`);
    return results;
  }
}
