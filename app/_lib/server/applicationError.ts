import { NextResponse } from 'next/server';

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
    console.log(error.message);
    return NextResponse.json({ message: error.message }, { status: error.status });
  } else {
    console.log('Unhandled error.');
    console.log(error);
    return NextResponse.json({ message: 'Unhandled error.' }, { status: ApplicationError.SERVER_ERROR });
  }
}
