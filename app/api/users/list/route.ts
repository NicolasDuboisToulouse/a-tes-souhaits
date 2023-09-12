import { NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDbStatement } from '_lib/server/database';
import { User } from '_lib/user';
import { errorResponse, logger } from '_lib/server/applicationError';

export async function POST() {
  try {
    const user = loginService.tokenLogOn();
    if (user.isAdmin == false) {
      logger.warn('Non-admin user try to access users/list');
      throw new loginService.LoginError();
    }

    const users = getDbStatement('listUsers', 'SELECT userName, displayName, firstLogin, isAdmin FROM users')
      .all<{userName: string, displayName: string, firstLogin: number, isAdmin: number}>()
      .map(row => User.fromObject(row));

    return NextResponse.json(users, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
