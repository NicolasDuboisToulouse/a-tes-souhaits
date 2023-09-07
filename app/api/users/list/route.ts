import { NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDatabase } from '_lib/server/database';
import { errorResponse } from '_lib/server/applicationError';

export async function POST() {
  try {
    const user = loginService.tokenLogOn();
    if (user.isAdmin == false) {
      console.log('Warn: non-admin user try to access users/list');
      throw new loginService.LoginError();
    }

    const users = getDatabase().listUsers();
    return NextResponse.json(users, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
