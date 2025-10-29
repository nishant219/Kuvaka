import { ILead, IOffer } from '../types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateOffer = (offer: any): void => {
  if (!offer.name || typeof offer.name !== 'string') {
    throw new ValidationError('Offer name is required and must be a string');
  }

  if (!Array.isArray(offer.value_props) || offer.value_props.length === 0) {
    throw new ValidationError('Value props must be a non-empty array');
  }

  if (!Array.isArray(offer.ideal_use_cases) || offer.ideal_use_cases.length === 0) {
    throw new ValidationError('Ideal use cases must be a non-empty array');
  }
};

export const validateLead = (lead: any): void => {
  const requiredFields = ['name', 'role', 'company', 'industry', 'location'];
  
  for (const field of requiredFields) {
    if (!lead[field]) {
      throw new ValidationError(`Lead field '${field}' is required`);
    }
  }
};

export const sanitizeLeadData = (lead: any): ILead => {
  return {
    name: String(lead.name || '').trim(),
    role: String(lead.role || '').trim(),
    company: String(lead.company || '').trim(),
    industry: String(lead.industry || '').trim(),
    location: String(lead.location || '').trim(),
    linkedin_bio: String(lead.linkedin_bio || '').trim(),
  };
};
