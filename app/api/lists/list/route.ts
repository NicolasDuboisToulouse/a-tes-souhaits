import { NextRequest, NextResponse } from 'next/server';
import * as loginService from '_lib/server/loginService';
import { getDatabase } from '_lib/server/database';
import { errorResponse } from '_lib/server/applicationError';

export async function POST(request: NextRequest) {
  try {
    const user = loginService.tokenLogOn();
    const lists = getDatabase().listLists();

    const { withOwners } = await request.json();
    if (withOwners) {
      if (user.isAdmin == false) {
        console.log('Warn: non-admin user try to access lists/list');
        throw new loginService.LoginError();
      }
      const listsWithOwners = lists.map((list) =>
        ({
          ...list,
          userNames: getDatabase().listListOwners(list.id)
        })
      );
      return NextResponse.json(listsWithOwners, { status: 200 });
    }

    return NextResponse.json(lists, { status: 200 });

  } catch(error) {
    return errorResponse(error);
  }
}
