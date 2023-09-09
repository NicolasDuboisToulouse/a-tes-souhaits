import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    const { password } = await request.json();
    loginService.setPassword(user, password);
    return NextResponse.json({}, { status: 200 });
  } catch(error) {
    return loginService.errorResponse(error);
  }
}
