export class User {
  userName:    string|undefined = undefined;
  displayName: string|undefined = undefined;
  firstLogin:  boolean          = true;
  isAdmin:     boolean          = false;

  // Not logged-in user
  constructor() { }

  // Build from object
  public static fromObject(object: any): User {
    if (object == null || object.userName == null) return new User();
    let user = new User();
    user.userName    = object.userName;
    user.displayName = object.displayName || object.userName;
    user.firstLogin  = object.firstLogin || true;
    user.isAdmin     = object.isAdmin || false;
    return user;
  }

  public isValid(): boolean { return this.userName != null; }
}
