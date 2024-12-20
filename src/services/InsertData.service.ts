import type { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import path from 'path';
import { cursorBasedPagination, insertInDB, offsetBasedPagination } from '../repositories/data.repository';

const PATH_1MIL = path.resolve('./dataset/large-file.json');

export async function insertData(_req: Request, res: Response) {
  console.time('Reading json');
  const records = JSON.parse(await readFile(PATH_1MIL, 'utf-8'));
  console.timeEnd('Reading json');

  try {
    console.log('[READING-FILE-COMPLETE] > [INSERTION-STARTED]');
    console.time('Inserting records');
    const { success } = await insertInDB(records);
    console.timeEnd('Inserting records');

    if (!success) {
      throw new Error('Error while saving data to db.');
    }

    return res.status(200).send({ success });
  } catch (error) {
    const message = (<Error>error)?.message;
    return res.status(message?.indexOf('AuthenticationError') ? 401 : 500).send({ message });
  }
}

export async function offsetPaginatedData(req: Request, res: Response) {
  const { page, limit } = req.query;

  const pageNumber = parseInt(<string>page) || 1;
  const limitNumber = parseInt(<string>limit) || 10;

  try {
    console.log('[FETCHING-DATA]');
    console.time('[OFFSET] - fetching records');
    const { data, meta } = await offsetBasedPagination(pageNumber, limitNumber);
    console.timeEnd('[OFFSET] - fetching records');

    const success = meta.totalPages > pageNumber ? true : false;

    return res.status(200).send({ success, data, meta });
  } catch (error) {
    const message = (<Error>error)?.message;
    return res.status(message?.indexOf('AuthenticationError') ? 401 : 500).send({ message });
  }
}

export async function cursorPaginatedData(req: Request, res: Response) {
  const { cursor, limit } = req.query;
  console.log('🚀 ~ paginatedData ~ req.query:', req.query);

  const limitNumber = parseInt(<string>limit) || 10;
  console.log('🚀 ~ paginatedData ~ limitNumber:', limitNumber);

  try {
    console.log('[FETCHING-DATA]');
    console.time('[OFFSET] - fetching records');
    const { data, meta } = await cursorBasedPagination(<string>cursor, limitNumber);
    console.timeEnd('[OFFSET] - fetching records');

    return res.status(200).send({ success: true, data, meta });
  } catch (error) {
    const message = (<Error>error)?.message;
    return res.status(message?.indexOf('AuthenticationError') ? 401 : 500).send({ message });
  }
}
