import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDbStatement } from '_lib/server/database';
import { errorResponse, ApplicationError } from '_lib/server/applicationError';
import { isListOwner } from '_lib/server/wishList';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();

    const { listId } = await request.json();
    if (listId == null) {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    const infos = {
      isOwner: isListOwner(listId, user.userName!),
      wishes: Array<any>(),
    };

    if(infos.isOwner == false) {
      // Select wishes of another user (exclude draft wished)
      infos.wishes = getDbStatement('listOthersWishes', 'SELECT id, label, description, bookedBy FROM wishes WHERE draft=0 AND listId=?').
        all<{id: number, label: string, description: string, bookedBy: string}>(listId);
    } else {
      // Select my wishes (exclude bookedBy)
      infos.wishes = getDbStatement('listMyWishes', 'SELECT id, label, description, draft FROM wishes WHERE listId=?').
        all<{id: number, label: string, description: string, draft: number}>(listId);
    }

    return NextResponse.json(infos, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
