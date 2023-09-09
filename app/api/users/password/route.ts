import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { errorResponse } from '_lib/server/applicationError';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    const { password } = await request.json();
    loginService.setPassword(user, password);
    return NextResponse.json({}, { status: 200 });
  } catch(error) {
    return errorResponse(error);
  }
}
