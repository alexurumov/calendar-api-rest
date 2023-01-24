import * as bcrypt from 'bcrypt'

export async function toHash(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function verifyHash(password: string, dbPass: string){
    return await bcrypt.compare(password, dbPass);
}
