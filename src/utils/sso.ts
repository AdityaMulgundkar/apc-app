/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDecipheriv, createHash } from 'node:crypto';
import { config } from '../config';

export const decryptSSOData = (key: string): Record<string, unknown> => {
  const blockSize = 16;
  const keySize = 32;
  const ivSize = 16;
  const saltSize = 8;

  const rawEncryptedData = Buffer.from(key, 'base64');
  const salt = rawEncryptedData.subarray(saltSize, blockSize);
  const cipherText = rawEncryptedData.subarray(blockSize);

  let result = Buffer.alloc(0, 0);
  while (result.length < (keySize + ivSize)) {
    const hasher = createHash('md5');
    result = Buffer.concat([
      result,
      hasher.update(Buffer.concat([
        result.subarray(-ivSize),
        Buffer.from(config.ghl.ssoKey, 'utf-8'),
        salt
      ] as any) as any).digest()
    ] as any);
  }

  const decipher = createDecipheriv(
    'aes-256-cbc',
    result.subarray(0, keySize) as any,
    result.subarray(keySize, keySize + ivSize) as any,
  );

  const decrypted = decipher.update(cipherText as any);
  const finalDecrypted = Buffer.concat([decrypted, decipher.final()] as any);
  return JSON.parse(finalDecrypted.toString());
};
