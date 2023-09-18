import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDbStatement } from '_lib/server/database';
import { errorResponse, ApplicationError } from '_lib/server/applicationError';
import { isListOwner } from '_lib/server/wishList';
import { BookedBy, WishArray } from '_lib/wish';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();

    const { listId } = await request.json();
    if (listId == null) {
      throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
    }

    const infos: {isOwner: boolean, wishArray: WishArray } = {
      isOwner: isListOwner(listId, user.userName!),
      wishArray: [],
    };

    if(infos.isOwner == false) {
      // Select wishes of another user (exclude draft wished)
      const wishArray = getDbStatement('listOthersWishes', 'SELECT id, label, description, bookedBy FROM wishes WHERE draft=0 AND listId=?').
        all<{id: number, label: string, description: string, bookedBy: string}>(listId);

      infos.wishArray = wishArray.map(wish => {
        const targetWish = {id: wish.id, label: wish.label, description: wish.description, bookedBy: BookedBy.Nobody, draft: false}
        if (wish.bookedBy.length != 0) {
          if (wish.bookedBy == user.userName) {
            targetWish.bookedBy = BookedBy.Me;
          } else {
            targetWish.bookedBy = BookedBy.Other;
          }
        }
        return targetWish;
      });

    } else {
      // Select my wishes (exclude bookedBy)
      const wishArray = getDbStatement('listMyWishes', 'SELECT id, label, description, draft FROM wishes WHERE listId=?').
        all<{id: number, label: string, description: string, draft: number}>(listId);
      infos.wishArray = wishArray.map(wish => {
        return {id: wish.id, label: wish.label, description: wish.description, bookedBy: BookedBy.Nobody, draft: wish.draft != 0}
      });
    }

    return NextResponse.json(infos, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
