import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDbStatement } from '_lib/server/database';
import { errorResponse, ApplicationError, logger } from '_lib/server/applicationError';
import { isListOwner } from '_lib/server/wishList';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();

    const { listId, label, description, draft } = await request.json();
    if (listId == null || label == null || description == null || draft == null) {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }
    if (isListOwner(listId, user.userName!) == false) {
      logger.warn(user.userName + " try to add a wish in the non-owned list " + listId + "!");
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    if (getDbStatement('addWish', 'INSERT into wishes (listId, label, description, draft) VALUES (?, ?, ?, ?)')
      .run(listId, label, description, (draft)? 1:0) != true
    ) {
      throw new ApplicationError('Unexpected error while adding a wish', ApplicationError.SERVER_ERROR);
    }

    return NextResponse.json({}, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
