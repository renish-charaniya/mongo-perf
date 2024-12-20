import mongoose from 'mongoose';
import GithubEvent from '../models/github.model';
import { Event } from '../types/githubevent.types';
import * as crypto from 'node:crypto';

export async function insertInDB(records: Array<unknown>): Promise<{
  success: boolean;
}> {
  const res = await GithubEvent.insertMany(records);
  if (!res) {
    return {
      success: false,
    };
  }
  return {
    success: true,
  };
}

export async function offsetBasedPagination(
  page: number,
  limit: number,
): Promise<{
  data: Event[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}> {
  const skip = (page - 1) * limit;
  const data = await GithubEvent.find({}).skip(skip).limit(limit);
  const totalItems = await GithubEvent.countDocuments();
  const totalPages = Math.ceil(totalItems / limit);

  return {
    meta: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
    },
    data,
  };
}

export async function cursorBasedPagination(
  cursor: string,
  limit: number,
): Promise<{
  data: Event[];
  meta: {
    hasMore: boolean;
    nextCursor: string | null;
  };
}> {
  let decryptedCursor;
  let data;

  if (cursor) {
    decryptedCursor = decrypt(cursor);

    // Since _id is an ObjectId, we can directly compare it
    const decryptedObjectId = new mongoose.Types.ObjectId(decryptedCursor);

    data = await GithubEvent.find({
      _id: { $lt: decryptedObjectId },
    })
      .sort({ _id: -1 }) // Sorting by _id in descending order to get newer documents first
      .limit(limit + 1); // Limit + 1 to determine if there's more data
  } else {
    console.log('>>>>>>>>> in else');

    data = await GithubEvent.find({})
      .sort({ _id: -1 })
      .limit(limit + 1);
  }

  const hasMore = data.length === limit + 1;

  let nextCursor = null;
  if (hasMore) {
    const nextCursorRecord = data[limit];

    // Get the ObjectId of the next record and convert it to string
    nextCursor = encrypt((nextCursorRecord as { _id: mongoose.Types.ObjectId })._id.toString());
    data.pop(); // Remove the extra record that was used for pagination
  }

  return {
    meta: {
      hasMore,
      nextCursor,
    },
    data,
  };
}

const ALGORITHM = 'aes-256-cbc'; // AES algorithm with CBC mode
const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY || '1234567890abcdef1234567890abcdef'; // Ensure the secret key is stored securely
const IV_LENGTH = 16; // AES block size (for CBC mode)

function getIv() {
  return crypto.randomBytes(IV_LENGTH); // Generate a random IV for each encryption
}

/**
 * Encrypts a value (e.g., ObjectId or other sensitive data)
 * @param {string} text The text to encrypt
 * @returns {string} The encrypted and base64 encoded result
 */
export function encrypt(text: string): string {
  const iv = getIv();
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'utf-8'), iv);

  let encrypted = cipher.update(text, 'utf-8', 'base64');
  encrypted += cipher.final('base64');

  // Return IV along with encrypted data, both encoded in base64
  return `${iv.toString('base64')}:${encrypted}`;
}

/**
 * Decrypts a previously encrypted value
 * @param {string} encryptedText The encrypted text in base64 format (IV + encrypted data)
 * @returns {string} The decrypted value
 */
export function decrypt(encryptedText: string): string {
  const [ivBase64, encryptedData] = encryptedText.split(':');

  // Convert IV from base64
  const iv = Buffer.from(<string>ivBase64, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'utf-8'), iv);

  let decrypted = decipher.update(<string>encryptedData, 'base64', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}
