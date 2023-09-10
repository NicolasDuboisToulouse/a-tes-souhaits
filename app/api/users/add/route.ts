import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDbStatement, SqliteError } from '_lib/server/database';
import { ApplicationError, errorResponse } from '_lib/server/applicationError';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    if (user.isAdmin == false) {
      console.log('Warn: non-admin user try to access users/add');
      throw new loginService.LoginError();
    }

    const { userName, displayName } = await request.json();
    if (userName == null || userName == '' || displayName == null || displayName == '') {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    const passwordHash = loginService.getPasswordHash(userName);
    if (getDbStatement('insertUser', 'INSERT INTO users (userName, displayName, passwordHash, firstLogin, isAdmin) VALUES(?, ?, ?, 1, 0)')
      .run(userName, displayName, passwordHash) == false
    ) {
      throw new ApplicationError('Unexpected error while adding user', ApplicationError.SERVER_ERROR);
    }

    return NextResponse.json({}, { status: 200 });

  } catch(error) {
    if (error instanceof SqliteError) {
      return errorResponse(new ApplicationError('Cannot add user.', ApplicationError.SERVER_ERROR));
    }
    return errorResponse(error);
  }
}
