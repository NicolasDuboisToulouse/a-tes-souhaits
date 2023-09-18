import { getDbStatement } from '_lib/server/database';

//
// Return true if userName own wishId
//
export function isWishOwner(wishId: number, userName: string) {
  return getDbStatement('isWishOwner', 'SELECT 1 FROM listsOwners, wishes \
                                        WHERE listsOwners.listId=wishes.listId AND wishes.id=? AND userName=?')
      .get(wishId, userName) !== undefined;
}
