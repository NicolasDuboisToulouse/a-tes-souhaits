import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDatabase, getDbStatement } from '_lib/server/database';
import { errorResponse } from '_lib/server/applicationError';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    const listInfos = {
      lists:    getDatabase().listLists(),
      myListId: -1,
    };

    // Select the list owned by userName with the lesser number of other owners
    const userList = getDbStatement('selectUserList', '\
        SELECT lstCount.listId, COUNT(lstCount.listId) AS count FROM listsOwners AS lstCount \
        INNER JOIN listsOwners AS lstOwner ON lstCount.listId == lstOwner.listId AND lstOwner.userName=? \
        GROUP BY lstCount.listId ORDER BY count').
      get<{ listId: number, count: number }>(user.userName);
    listInfos.myListId = (userList === undefined)? -1 : userList.listId;

    const { withOwners } = await request.json();
    if (withOwners) {
      if (user.isAdmin == false) {
        console.log('Warn: non-admin user try to access lists/list');
        throw new loginService.LoginError();
      }
      listInfos.lists = listInfos.lists.map((list) =>
        ({
          ...list,
          userNames: getDatabase().listListOwners(list.id)
        })
      );
    }

    return NextResponse.json(listInfos, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
