import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { ApplicationError, errorResponse } from '_lib/server/applicationError';
import { getDbStatement } from '_lib/server/database';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    if (user.isAdmin == false) {
      console.log("Warn: non-admin user try to delete an other user");
      throw new loginService.LoginError();
    }

    const { userName } = await request.json();
    if (userName == null) {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    if (userName === user.userName) {
      throw new ApplicationError('You cannot delete yourself!', ApplicationError.CLIENT_ERROR);
    }

    if (getDbStatement('deleteUser', 'DELETE FROM users WHERE userName=?')
      .run(userName) == false
    ) {
      throw new ApplicationError('Unexpected error while deleting user.', ApplicationError.SERVER_ERROR);
    }
    if (getDbStatement('deleteListOwnerByOwner', 'DELETE FROM listsOwners WHERE userName=?')
      .run(userName) == false
    ) {
      throw new ApplicationError('Unexpected error while deleting user from listsOwners.', ApplicationError.SERVER_ERROR);
    }

    return NextResponse.json({}, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
