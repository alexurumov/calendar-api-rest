import hmac_sha256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';

const SECRET_KEY: string = process.env.SECRET_KEY as string || 'calendar-api-secret-key-1';

export const hashPass = (password: string): string => Base64.stringify(hmac_sha256(password, SECRET_KEY));
