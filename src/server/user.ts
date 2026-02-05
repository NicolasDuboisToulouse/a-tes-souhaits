import * as bcrypt from "bcrypt";

//
// Generate a password hash
//
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}
