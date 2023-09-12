import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDbStatement } from '_lib/server/database';
import { errorResponse, logger } from '_lib/server/applicationError';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();

    // Select all lists
    const lists = getDbStatement('listLists', 'SELECT id, title FROM lists')
      .all<{id: number, title: string}>();

    // Select the list owned by userName with the lesser number of other owners
    const userList = getDbStatement('selectUserList', '\
        SELECT lstCount.listId, COUNT(lstCount.listId) AS count FROM listsOwners AS lstCount \
        INNER JOIN listsOwners AS lstOwner ON lstCount.listId == lstOwner.listId AND lstOwner.userName=? \
        GROUP BY lstCount.listId ORDER BY count').
      get<{ listId: number, count: number }>(user.userName);

    const listInfos = {
      lists,
      myListId: (userList === undefined)? -1 : userList.listId,
    };

    const { withOwners } = await request.json();
    if (withOwners) {
      if (user.isAdmin == false) {
        logger.warn('Non-admin user try to access lists/list');
        throw new loginService.LoginError();
      }
      const listListOwners = getDbStatement('listListOwners', 'SELECT userName FROM listsOwners WHERE listId=?', {pluck:true});
      listInfos.lists = listInfos.lists.map((list) =>
        ({
          ...list,
          userNames: listListOwners.all<string>(list.id)
        })
      );
    }

    return NextResponse.json(listInfos, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
