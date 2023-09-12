import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDbStatement, SqliteError } from '_lib/server/database';
import { ApplicationError, errorResponse, logger } from '_lib/server/applicationError';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    if (user.isAdmin == false) {
      logger.warn('Non-admin user try to access lists/owner/del');
      throw new loginService.LoginError();
    }

    const { listId, userName } = await request.json();
    if (listId == null || userName == null || userName == '') {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    if (getDbStatement('deleteListOwner', 'DELETE FROM listsOwners WHERE listId=? AND userName=?')
      .run(listId, userName) == false
    ) {
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
