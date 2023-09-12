import { NextResponse } from 'next/server';
export const logger = require('pino')()

if (process.env.LOG_LEVEL) {
  logger.level = process.env.LOG_LEVEL;
}

//
// Generic error
//
export class ApplicationError extends Error {
  static readonly CLIENT_ERROR = 400;
  static readonly SERVER_ERROR = 500;

  status: number;

  constructor(message: string = 'Unexpected error.', status:number = ApplicationError.SERVER_ERROR) {
    super(message);
    this.status = status;
  }
}

//
// Create a NextResponse from an error object
//
export function errorResponse(error: any): NextResponse {
  if (error && error instanceof ApplicationError) {
    logger.error(error.message);
    return NextResponse.json({ message: error.message }, { status: error.status });
  } else {
    logger.error(error, 'Unhandled error.');
    return NextResponse.json({ message: 'Unhandled error.' }, { status: ApplicationError.SERVER_ERROR });
  }
}
