import {
  LinkedinScraper,
  timeFilter,
  typeFilter,
  relevanceFilter,
  experienceLevelFilter,
  onSiteOrRemoteFilter,
  events,
} from 'linkedin-jobs-scraper';
import type { RequestData } from './requestValidator';
import type { IData } from 'linkedin-jobs-scraper/build/scraper/events';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const scrapeJobs = async (_requestData: RequestData, jobIds: Array<string> | null) => {
  const jobs: IData[] = [];
  const scraper = new LinkedinScraper({
    headless: true,
    slowMo: 200,
    timeout:80000,
    waitForInitialPage:true,
    args: ['--lang=en-GB'],
    executablePath: process.env.NODE_ENV == 'production' ? <string>process.env.PUPPETEER_EXECUTABLE_PATH : '',

  });

  scraper.on(events.scraper.data, async (data) => {
    // await fs.promises.appendFile('data.json', JSON.stringify(data, null, 2));
    if (data.jobId == 'search') {
      data.jobId = new URL(data.link).searchParams.get('currentJobId') ?? 'error-currentJobId';
    }
    if (jobIds != null && !jobIds.includes(data.jobId)) {
      if (!jobs.some((j) => j.jobId == data.jobId)) {
        jobs.push(data);
      } else {
        console.error('!! >?> Dulplicate JobId discovered', data.jobId);
      }

      // await fs.appendFile(`interim-scan.json`, JSON.stringify(data, null, 2), 'utf-8');
    } else if (jobIds == null) {
      if (!jobs.some((j) => j.jobId == data.jobId)) {
        jobs.push(data);
      }
      // await fs.appendFile(`fresh-scan.json`, JSON.stringify(data, null, 2), 'utf-8');
    }
  });
  const scanLimit: number = parseInt(process.env.LINKEDIN_SCAN_LIMIT as string) || 25;
  try {
    await Promise.all([
      // Run queries serially
      scraper.run(
        [
          {
            // query: '("Software Engineer" OR "Backend") and "Nodejs"',
            // query: '"Software Engineer" AND "nodejs"',
            query: '"nodejs"',
            options: {
              locations: ['India'], // This will override global options ["Europe"]
              pageOffset: 0,
              limit: scanLimit,
              // optimize: true,
              skills: true,
              filters: {
                relevance: relevanceFilter.RECENT,
                time: timeFilter.MONTH,
                type: [typeFilter.FULL_TIME],
                experience: [experienceLevelFilter.ASSOCIATE, experienceLevelFilter.MID_SENIOR],
                onSiteOrRemote: [
                  onSiteOrRemoteFilter.ON_SITE,
                  onSiteOrRemoteFilter.REMOTE,
                  onSiteOrRemoteFilter.HYBRID,
                ],
                // industry: ['4'],
                // baseSalary: baseSalaryFilter.SALARY_100K,
              },
            },
          },
          //   {
          //       query: "Sales",
          //       options: {
          // pageOffset: 2, // How many pages to skip. Default 0
          //           limit: 10, // This will override global option limit (33)
          //           applyLink: true, // Try to extract apply link. If set to true, scraping is slower because an additional page mus be navigated. Default to false
          //           skipPromotedJobs: true, // Skip promoted jobs: Default to false
          //           skills: true, // Extract required skills for this job. If enabled execution can be slower. Default to false.
          //           descriptionFn: descriptionFn, // Custom job description processor [optional]
          //       }
          //   },
        ],
        {
          // Global options, will be merged individually with each query options
          locations: ['Europe'],
          limit: 33,
        },
      ),
    ]);
    return jobs;
  } catch (error) {
    //TODO - Make sure even if error occurs the alresdy scanned jobs data doesn't get lost.
    // await fs.appendFile(`scanned.json`, JSON.stringify(jobs, null, 2), 'utf-8');

    console.error('Error While scrapping:', error);
  } finally {
    await scraper.close();
  }

  return;
};
