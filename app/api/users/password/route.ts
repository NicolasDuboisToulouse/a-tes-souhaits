import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { errorResponse } from '_lib/server/applicationError';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    const { password, userName } = await request.json();

    if (userName == null) {
      // User change its own password
      loginService.setPassword(user.userName!, password);
    } else {
      // User change password of someone else
      if (user.isAdmin == false) {
        console.log("Warn: non-admin user try to change other's password");
        throw new loginService.LoginError();
      }
       loginService.setPassword(userName, password, true);
    }

    return NextResponse.json({}, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
