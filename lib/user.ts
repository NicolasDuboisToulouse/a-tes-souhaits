export type User = {
  userName: string|null,
  isAdmin: boolean
};

export function User(userName?: string, isAdmin?: boolean) {
  return <User>{ userName: userName, isAdmin: isAdmin ? isAdmin : false };
}
