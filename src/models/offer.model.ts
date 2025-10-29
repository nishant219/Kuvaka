import mongoose, { Schema, Document } from 'mongoose';
import { IOffer } from '../types';

export interface IOfferDocument extends Omit<IOffer, '_id' | 'createdAt' | 'updatedAt'>, Document { }

const offerSchema = new Schema<IOfferDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        value_props: {
            type: [String],
            required: true,
            validate: {
                validator: (v: string[]) => v.length > 0,
                message: 'Value props must contain at least one item',
            },
        },
        ideal_use_cases: {
            type: [String],
            required: true,
            validate: {
                validator: (v: string[]) => v.length > 0,
                message: 'Ideal use cases must contain at least one item',
            },
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Offer = mongoose.model<IOfferDocument>('Offer', offerSchema);
