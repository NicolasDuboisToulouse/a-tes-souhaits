//
// Error from user inputs (like invalid password)
//
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}
