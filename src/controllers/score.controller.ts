import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth.middleware';
import { ScoringService } from '../services/scoring.service';
import { CSVService } from '../services/csv.service';
import { Offer } from '../models/offer.model';
import { Lead } from '../models/lead.model';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { IOffer } from '../types';

const scoringService = new ScoringService();
const csvService = new CSVService();

export const scoreLeads = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
        const { offerId, leads: leadsData } = req.body;

        if (!offerId) {
            throw new AppError('offerId is required', 400);
        }

        // Fetch offer
        const offer = await Offer.findOne({
            _id: offerId,
            userId: req.userId,
        });

        if (!offer) {
            throw new AppError('Offer not found', 404);
        }

        // Parse leads (can be from body or uploaded file)
        let leads = leadsData;

        if (req.file) {
            leads = await csvService.parseCSV(req.file.buffer);
        }

        if (!leads || leads.length === 0) {
            throw new AppError('No leads provided', 400);
        }

        // Generate batch ID
        const batchId = uuidv4();

        logger.info(`Starting scoring for batch ${batchId} with ${leads.length} leads`);

        // Convert offer to plain object matching IOffer interface
        const offerData: IOffer = {
            _id: String(offer._id),
            name: offer.name,
            value_props: offer.value_props,
            ideal_use_cases: offer.ideal_use_cases,
            userId: offer.userId,
        };

        // Score leads in background
        scoringService.scoreLeadsBatch(leads, offerData).then(async (results) => {
            // Save results to database
            const leadDocuments = results.map(result => ({
                ...result,
                userId: req.userId,
                offerId: offer._id,
                batchId,
            }));

            await Lead.insertMany(leadDocuments);
            logger.info(`Saved ${leadDocuments.length} scored leads for batch ${batchId}`);
        }).catch(error => {
            logger.error(`Error in background scoring for batch ${batchId}:`, error);
        });

        res.status(202).json({
            success: true,
            message: 'Scoring initiated. Use batchId to retrieve results.',
            batchId,
            leadsCount: leads.length,
        });
    }
);

export const getScoreStatus = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
        const { batchId } = req.params;

        const count = await Lead.countDocuments({
            userId: req.userId,
            batchId,
        });

        const status = count > 0 ? 'completed' : 'processing';

        res.json({
            success: true,
            batchId,
            status,
            resultsCount: count,
        });
    }
);
