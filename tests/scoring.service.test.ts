import { ScoringService } from '../src/services/scoring.service';
import { ILead, IOffer } from '../src/types';

describe('ScoringService - Rule Layer', () => {
    let scoringService: ScoringService;

    beforeEach(() => {
        scoringService = new ScoringService();
    });

    describe('scoreRole', () => {
        it('should give 20 points for decision maker roles', () => {
            expect(scoringService.scoreRole('CEO')).toBe(20);
            expect(scoringService.scoreRole('CTO')).toBe(20);
            expect(scoringService.scoreRole('VP of Engineering')).toBe(20);
            expect(scoringService.scoreRole('Head of Sales')).toBe(20);
            expect(scoringService.scoreRole('Founder')).toBe(20);
        });

        it('should give 10 points for influencer roles', () => {
            expect(scoringService.scoreRole('Engineering Manager')).toBe(10);
            expect(scoringService.scoreRole('Senior Developer')).toBe(10);
            expect(scoringService.scoreRole('Lead Designer')).toBe(10);
            expect(scoringService.scoreRole('Product Manager')).toBe(10);
        });

        it('should give 0 points for non-decision maker roles', () => {
            expect(scoringService.scoreRole('Junior Developer')).toBe(0);
            expect(scoringService.scoreRole('Intern')).toBe(0);
            expect(scoringService.scoreRole('Associate')).toBe(0);
        });

        it('should be case insensitive', () => {
            expect(scoringService.scoreRole('ceo')).toBe(20);
            expect(scoringService.scoreRole('CEO')).toBe(20);
            expect(scoringService.scoreRole('Chief Executive Officer')).toBe(20);
        });
    });

    describe('scoreIndustry', () => {
        const idealUseCases = ['B2B SaaS mid-market', 'Enterprise Software'];

        it('should give 20 points for exact match', () => {
            expect(scoringService.scoreIndustry('B2B SaaS mid-market', idealUseCases)).toBe(20);
        });

        it('should give 10 points for partial match', () => {
            expect(scoringService.scoreIndustry('B2B SaaS', idealUseCases)).toBe(10);
            expect(scoringService.scoreIndustry('SaaS Company', idealUseCases)).toBe(10);
            expect(scoringService.scoreIndustry('Enterprise', idealUseCases)).toBe(10);
        });

        it('should give 0 points for no match', () => {
            expect(scoringService.scoreIndustry('Healthcare', idealUseCases)).toBe(0);
            expect(scoringService.scoreIndustry('Retail', idealUseCases)).toBe(0);
        });
    });

    describe('scoreCompleteness', () => {
        it('should give 10 points when all fields are present', () => {
            const completeLead: ILead = {
                name: 'John Doe',
                role: 'CEO',
                company: 'Acme Inc',
                industry: 'SaaS',
                location: 'San Francisco',
                linkedin_bio: 'Experienced CEO...',
            };
            expect(scoringService.scoreCompleteness(completeLead)).toBe(10);
        });

        it('should give 0 points when any field is missing', () => {
            const incompleteLead: ILead = {
                name: 'John Doe',
                role: 'CEO',
                company: 'Acme Inc',
                industry: 'SaaS',
                location: 'San Francisco',
                linkedin_bio: '',
            };
            expect(scoringService.scoreCompleteness(incompleteLead)).toBe(0);
        });
    });

    describe('calculateRuleScore', () => {
        const offer: IOffer = {
            name: 'AI Outreach Automation',
            value_props: ['24/7 outreach', '6x more meetings'],
            ideal_use_cases: ['B2B SaaS mid-market'],
            userId: 'test-user',
        };

        it('should calculate total score correctly for high-quality lead', () => {
            const lead: ILead = {
                name: 'Jane Smith',
                role: 'VP of Sales',
                company: 'TechCorp',
                industry: 'B2B SaaS mid-market',
                location: 'New York',
                linkedin_bio: 'Sales leader with 10 years experience',
            };

            const score = scoringService.calculateRuleScore(lead, offer);
            expect(score).toBe(50); // 20 (role) + 20 (industry) + 10 (complete)
        });

        it('should calculate score for medium-quality lead', () => {
            const lead: ILead = {
                name: 'Bob Johnson',
                role: 'Sales Manager',
                company: 'SomeCorp',
                industry: 'SaaS',
                location: 'Austin',
                linkedin_bio: 'Sales professional',
            };

            const score = scoringService.calculateRuleScore(lead, offer);
            expect(score).toBe(30); // 10 (role) + 10 (industry partial) + 10 (complete)
        });

        it('should not exceed 50 points', () => {
            const lead: ILead = {
                name: 'Test',
                role: 'CEO',
                company: 'Test Corp',
                industry: 'B2B SaaS mid-market',
                location: 'SF',
                linkedin_bio: 'Bio',
            };

            const score = scoringService.calculateRuleScore(lead, offer);
            expect(score).toBeLessThanOrEqual(50);
        });
    });
});
