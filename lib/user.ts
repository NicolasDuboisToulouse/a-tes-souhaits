export const currentUser : {
  name: string|null
} = {
  name: null
};

export function setCurrentUser({userName} : { userName: string} ) {
  currentUser.name = userName;
}
