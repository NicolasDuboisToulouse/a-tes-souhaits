import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDbStatement } from '_lib/server/database';
import { errorResponse, ApplicationError, logger } from '_lib/server/applicationError';
import { isWishOwner } from '_lib/server/wish';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();

    const { wishId } = await request.json();
    if (wishId == null) {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    if (isWishOwner(wishId, user.userName!) == false) {
      logger.warn(user.userName + " try to delete a non-owned wish!");
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    if (getDbStatement('deleteWish', 'DELETE FROM wishes WHERE id=?').run(wishId) == false) {
      throw new ApplicationError('Unexpected error while deleting a wish', ApplicationError.SERVER_ERROR);
    }

    return NextResponse.json({}, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
