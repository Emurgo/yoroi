import * as Crypto from "expo-crypto";
import { Buffer } from "buffer";

export const randomHexString = (length: number) => {
  if (length % 2 !== 0) {
    throw new Error("Length must be even since each byte is 2 hex chars");
  }

  const bytes = Crypto.getRandomBytes(length / 2);
  return Buffer.from(bytes).toString("hex");
};

export const randomSalt = () => randomHexString(64);

export const randomNonce = () => randomHexString(24);
