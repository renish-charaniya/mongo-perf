import type { Request } from 'express';

export function validateRequestData(req: Request): ValidationResponse {
  const errors = [];

  const secret = (<RequestData>req.query).authenticate;
  if (typeof secret !== 'string' || !secret) {
    errors.push('secret not found in query params.');
  }

  const { location } = <RequestData>req.query;
  if (location && typeof location !== 'string') {
    errors.push('location should be a string value.');
  }

  let errorMessage = '';
  if (errors.length) {
    errorMessage = errors.reduce((message, error, errorIndex) => {
      return (message += `Error(${errorIndex + 1}): ${error} `);
    }, '');
  }
  return { errorMessage };
}

export type RequestData = {
  authenticate?: string;
  location?: string;
};

interface ValidationResponse extends RequestData {
  errorMessage: string;
}
