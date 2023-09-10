import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDatabase, SqliteError } from '_lib/server/database';
import { ApplicationError, errorResponse } from '_lib/server/applicationError';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    if (user.isAdmin == false) {
      console.log('Warn: non-admin user try to access lists/owner/del');
      throw new loginService.LoginError();
    }

    const { listId, userName } = await request.json();
    if (listId == null || userName == null || userName == '') {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    if (getDatabase().deleteListOwner(listId, userName) == false) {
      throw new ApplicationError('Unexpected error while deleting user to list owners.', ApplicationError.SERVER_ERROR);
    }

    return NextResponse.json({}, { status: 200 });

  } catch(error) {
    if (error instanceof SqliteError) {
      return errorResponse(new ApplicationError('Cannot delete list owner.', ApplicationError.SERVER_ERROR));
    }
    return errorResponse(error);
  }
}