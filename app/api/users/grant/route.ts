import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { ApplicationError, errorResponse, logger } from '_lib/server/applicationError';
import { getDbStatement } from '_lib/server/database';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    if (user.isAdmin == false) {
      logger.warn("Non-admin user try to change other's right");
      throw new loginService.LoginError();
    }

    const { userName, isAdmin } = await request.json();
    if (userName == null || isAdmin == null) {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    if (isAdmin == 0 && userName === user.userName) {
      throw new ApplicationError('You cannot un-grant yourself!', ApplicationError.CLIENT_ERROR);
    }

    if (getDbStatement('updateUserIsAdmin', 'UPDATE users SET isAdmin=? WHERE userName=?')
      .run(isAdmin? 1 : 0, userName) == false
    ) {
      throw new ApplicationError('Unexpected error while updating admin rights.', ApplicationError.SERVER_ERROR);
    }

    return NextResponse.json({}, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
