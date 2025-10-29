import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Offer } from '../models/offer.model';
import { validateOffer } from '../utils/validators';
import { asyncHandler } from '../middleware/error.middleware';

export const createOffer = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    validateOffer(req.body);

    const offer = new Offer({
      ...req.body,
      userId: req.userId,
    });

    await offer.save();

    res.status(201).json({
      success: true,
      data: offer,
    });
  }
);

export const getOffers = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const offers = await Offer.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  }
);

export const getOffer = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const offer = await Offer.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
      return;
    }

    res.json({
      success: true,
      data: offer,
    });
  }
);
