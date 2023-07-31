import { AssetName, Assets, BigNum, MultiAsset, ScriptHash, Value } from "@emurgo/cross-csl-core";
import { TokenAmount } from "../dex";

export const toScripthash = (hex: string) => {
  return ScriptHash.fromBytes(toUint8Array(hex));
};

export const fromScripthash = async (instance: ScriptHash) => {
  return fromUint8Array(await instance.toBytes());
};

export const toUint8Array = (hex: string) => {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex string");

  const bytes = new Uint8Array(hex.length / 2);

  for (let i = 0; i < hex.length; i += 2) {
    let value = parseInt(hex.substring(i, i + 2), 16);
    if (isNaN(value)) throw new Error("Invalid hex string");
    bytes[i / 2] = value;
  }

  return bytes;
};

export const fromUint8Array = (bytes: Uint8Array) => {
  const hex = new Array<string>(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    hex.push(bytes[i].toString(16).padStart(2, '0'));
  }

  return hex.join('');
};

export const buildValue = async (token: TokenAmount) => {
  if (token.address.policyId === '' && token.address.assetName === '') {
    return await Value.new(await BigNum.fromStr(token.amount));
  }

  const multiasset = await MultiAsset.new();
  const assets = await Assets.new();
  await assets.insert(
    await AssetName.new(toUint8Array(token.address.assetName)),
    await BigNum.fromStr(token.amount),
  );
  const value = await Value.new(await BigNum.fromStr('0'));
  await multiasset.insert(await toScripthash(token.address.policyId), assets);
  await value.setMultiasset(multiasset);
  return value;
};
