import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { ApplicationError, errorResponse } from '_lib/server/applicationError';
import { getDatabase } from '_lib/server/database';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    if (user.isAdmin == false) {
      console.log("Warn: non-admin user try to delete a list");
      throw new loginService.LoginError();
    }

    const { id } = await request.json();
    if (id == null) {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    if (getDatabase().deleteList(id) == false) {
      throw new ApplicationError('Unexpected error while deleting list.', ApplicationError.SERVER_ERROR);
    }

    return NextResponse.json({}, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
