import * as bcrypt from 'bcrypt'

export async function toHash (password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyHash (password: string, dbPass: string): Promise<boolean> {
  return await bcrypt.compare(password, dbPass)
}
