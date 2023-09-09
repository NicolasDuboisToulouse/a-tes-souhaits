import { NextRequest } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { errorResponse } from '_lib/server/applicationError';

export async function POST(request: NextRequest) {
  try {
    const loginInfos = await request.json();
    return loginService.login(loginInfos);
  } catch(error) {
    return errorResponse(error);
  }
}
