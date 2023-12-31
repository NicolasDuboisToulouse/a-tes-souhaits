import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { ApplicationError, errorResponse, logger } from '_lib/server/applicationError';
import { getDbStatement } from '_lib/server/database';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    if (user.isAdmin == false) {
      logger.warn("Non-admin user try to delete an other user");
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

    getDbStatement('deleteListOwnerByOwner', 'DELETE FROM listsOwners WHERE userName=?').run(userName);

    return NextResponse.json({}, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
