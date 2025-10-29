import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CSVService } from '../services/csv.service';
import { Lead } from '../models/lead.model';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { config } from '../config/env';

const csvService = new CSVService();

export const uploadLeads = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
      throw new AppError('CSV file is required', 400);
    }

    const leads = await csvService.parseCSV(req.file.buffer);

    if (leads.length === 0) {
      throw new AppError('No valid leads found in CSV', 400);
    }

    if (leads.length > config.maxLeadsPerUpload) {
      throw new AppError(
        `Maximum ${config.maxLeadsPerUpload} leads allowed per upload`,
        400
      );
    }

    res.json({
      success: true,
      message: `Successfully parsed ${leads.length} leads`,
      count: leads.length,
      data: leads.slice(0, 5), // Return first 5 as preview
    });
  }
);

export const getResults = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { batchId, offerId, intent } = req.query;

    const filter: any = { userId: req.userId };

    if (batchId) filter.batchId = batchId;
    if (offerId) filter.offerId = offerId;
    if (intent) filter.intent = intent;

    const results = await Lead.find(filter)
      .sort({ score: -1 })
      .select('-userId -__v');

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  }
);

export const exportResults = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { batchId } = req.query;

    if (!batchId) {
      throw new AppError('batchId query parameter is required', 400);
    }

    const results = await Lead.find({
      userId: req.userId,
      batchId: batchId as string,
    })
      .sort({ score: -1 })
      .select('-_id -userId -__v -createdAt -updatedAt')
      .lean();

    if (results.length === 0) {
      throw new AppError('No results found for this batch', 404);
    }

    const csv = csvService.generateCSV(results);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=lead-scores-${batchId}.csv`
    );
    res.send(csv);
  }
);
