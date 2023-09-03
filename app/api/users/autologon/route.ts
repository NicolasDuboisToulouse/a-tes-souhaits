import { NextResponse } from 'next/server';
import * as loginService from '_lib/loginService';

export async function GET() {
  try {
    const user = loginService.tokenLogOn({allowsNotConnected: true})
    if (user.isValid()) console.log('Autologon: ' + user.userName);
    return NextResponse.json(user, { status: 200 });
  } catch(error) {
    return loginService.errorResponse(error);
  }
}
