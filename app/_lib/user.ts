export class User {
  userName:    string|undefined = undefined;
  displayName: string|undefined = undefined;
  firstLogin:  boolean          = true;
  isAdmin:     boolean          = false;

  // without clone: Not logged-in user
  // with clone: copy constructor
  constructor(clone?: User) {
    if (clone) Object.assign(this, clone);
  }

  // Build from object
  public static fromObject(object: any): User {
    if (object == null || object.userName == null) return new User();
    let user = new User();
    user.userName    = object.userName;
    user.displayName = object.displayName || object.userName;
    user.firstLogin  = (object.firstLogin == null || object.firstLogin)? true : false;
    user.isAdmin     = object.isAdmin || false;
    return user;
  }

  public isValid(): boolean { return this.userName != null; }
}
