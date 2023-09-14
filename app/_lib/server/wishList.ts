import { getDbStatement } from '_lib/server/database';

//
// Return true if userName own listId
//
export function isListOwner(listId: number, userName: string) {
  return getDbStatement('isListOwner', 'SELECT listId FROM listsOwners WHERE listId=? AND userName=?')
    .get(listId, userName) != undefined;
}
