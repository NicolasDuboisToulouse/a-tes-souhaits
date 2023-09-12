import { NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { errorResponse, logger } from '_lib/server/applicationError';

export async function POST() {
  try {
    const user = loginService.tokenLogOn({allowsNotConnected: true})
    if (user.isValid()) logger.info('Autologon: ' + user.userName);
    return NextResponse.json(user, { status: 200 });
  } catch(error) {
    return errorResponse(error);
  }
}
