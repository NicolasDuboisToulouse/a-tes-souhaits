import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDbStatement, SqliteError } from '_lib/server/database';
import { ApplicationError, errorResponse } from '_lib/server/applicationError';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    if (user.isAdmin == false) {
      console.log('Warn: non-admin user try to access lists/add');
      throw new loginService.LoginError();
    }

    const { title } = await request.json();
    if (title == null || title == '') {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    if (getDbStatement('insertList', 'INSERT INTO lists (title) VALUES(?)')
      .run(title) == false
    ) {
      throw new ApplicationError('Unexpected error while adding list', ApplicationError.SERVER_ERROR);
    }

    return NextResponse.json({}, { status: 200 });

  } catch(error) {
    if (error instanceof SqliteError) {
      return errorResponse(new ApplicationError('Cannot add list.', ApplicationError.SERVER_ERROR));
    }
    return errorResponse(error);
  }
}
