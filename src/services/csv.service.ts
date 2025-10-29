import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { ILead } from '../types';
import { sanitizeLeadData } from '../utils/validators';
import { logger } from '../utils/logger';

export class CSVService {
  async parseCSV(buffer: Buffer): Promise<ILead[]> {
    return new Promise((resolve, reject) => {
      const leads: ILead[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csvParser())
        .on('data', (row: any) => {
          try {
            const lead = sanitizeLeadData(row);
            leads.push(lead);
          } catch (error) {
            logger.warn('Invalid lead row, skipping:', error);
          }
        })
        .on('end', () => {
          logger.info(`Parsed ${leads.length} leads from CSV`);
          resolve(leads);
        })
        .on('error', (error) => {
          logger.error('CSV parsing error:', error);
          reject(new Error('Failed to parse CSV file'));
        });
    });
  }

  generateCSV(results: any[]): string {
    if (results.length === 0) {
      return '';
    }

    const headers = Object.keys(results[0]);
    const csvRows = [headers.join(',')];

    for (const result of results) {
      const values = headers.map(header => {
        const value = result[header];
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}
