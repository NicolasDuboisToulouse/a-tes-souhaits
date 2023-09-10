import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDbStatement, SqliteError } from '_lib/server/database';
import { ApplicationError, errorResponse } from '_lib/server/applicationError';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    if (user.isAdmin == false) {
      console.log('Warn: non-admin user try to access lists/owner/add');
      throw new loginService.LoginError();
    }

    const { listId, userName } = await request.json();
    if (listId == null || userName == null || userName == '') {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    const owner = loginService.getUser(userName);
    if (owner.isValid() == false) {
      throw new ApplicationError('User to add to list owners does not exists!', ApplicationError.SERVER_ERROR);
    }

    if (getDbStatement('insertListOwner', 'INSERT INTO listsOwners (listId, userName) VALUES(?, ?)')
      .run(listId, userName) == false
    ) {
      throw new ApplicationError('Unexpected error while adding user to list owners.', ApplicationError.SERVER_ERROR);
    }

    return NextResponse.json({}, { status: 200 });

  } catch(error) {
    if (error instanceof SqliteError) {
      return errorResponse(new ApplicationError('Cannot add list owner.', ApplicationError.SERVER_ERROR));
    }
    return errorResponse(error);
  }
}
