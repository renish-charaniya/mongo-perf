import axios from 'axios';

export async function testOffsetPagination() {
  const BASE_URL = 'http://localhost:3000/paginate/offset';
  const LIMIT = 500; // Number of records per page
  let currentPage = 1;
  let totalRecords = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      console.log(`Fetching page ${currentPage}...`);

      console.time('>>>>>>> Offset Based pagination <<<<<<<');
      const response = await axios.get(`${BASE_URL}?page=${currentPage}&limit=${LIMIT}`);
      console.timeEnd('>>>>>>> Offset Based pagination <<<<<<<');

      if (response.data.data.length == 0) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const records = response.data?.data || [];

      // Count total records fetched
      totalRecords += records.length;

      // Log some details for debugging
      console.log(`Page ${currentPage}: Fetched ${records.length} records`);

      // Check if more pages are available
      hasMore = records.length === LIMIT; // Assume hasMore if the page is full
      currentPage++;
    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, (error as Error).message);
      break;
    }
  }

  console.log(`Finished! Total records fetched: ${totalRecords}`);
}

export async function testCursorPagination() {
  let cursor = null; // Start with no cursor
  let totalRecords = 0;
  let hasMore = true;
  const BASE_URL = 'http://localhost:3000/paginate/cursor';
  const LIMIT = 500; // Number of records per page

  while (hasMore) {
    try {
      // Construct the query URL
      const url: string = `${BASE_URL}?limit=${LIMIT}&${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
      console.log(`Fetching URL: ${url}`);

      // Fetch the response
      const response = await axios.get(url);

      if (response.data.data.length == 0) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const records = response.data.data;
      const nextCursor = response?.data.meta?.nextCursor;

      // Count total records fetched
      totalRecords += records.length;

      // Log some details
      console.log(`Fetched ${records.length} records, nextCursor: ${nextCursor}`);

      // Check if more pages are available
      hasMore = response?.data?.meta?.hasMore;
      cursor = nextCursor; // Update cursor for the next request
    } catch (error) {
      console.error('Error fetching data:', (error as Error).message);
      break;
    }
  }

  console.log(`Finished! Total records fetched: ${totalRecords}`);
}
