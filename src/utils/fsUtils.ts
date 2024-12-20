import type { IData } from 'linkedin-jobs-scraper/build/scraper/events';
import fs from 'node:fs';

export async function writeFetchedJobs(data: IData[] | undefined): Promise<{ success: boolean }> {
  try {
    await fs.promises.appendFile('data.json', JSON.stringify(data, null, 2));
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error writing file:', error);
    return {
      success: false,
    };
  }
}
