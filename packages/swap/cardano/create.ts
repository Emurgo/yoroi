import {
  Address, TransactionBody, TransactionBuilder, TransactionOutput,
} from "@emurgo/cross-csl-core";
import { buildValue } from "./utils";

export async function buildCreateOrderTx(txBuilder: TransactionBuilder, order: any): Promise<TransactionBody> {
  const address = await Address.fromBech32(order.contractAddress);
  const value = await buildValue(order.depositAmount);
  const txOutput = await TransactionOutput.new(address, value);

  await txOutput.setDataHash(order.datumHash);
  await txBuilder.addOutput(txOutput);

  return txBuilder.build();
};
