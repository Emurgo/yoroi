// @flow

/**
 * Based on `accountingTransactions.js` from yoroi-frontend
 */

import {InsufficientFunds} from '../../errors'
import {BigNumber} from 'bignumber.js'
import {
  Account,
  AccountBindingSignature,
  Address,
  Certificate,
  Fee,
  Hash,
  Input,
  InputOutput,
  InputOutputBuilder,
  OutputPolicy,
  Payload,
  PayloadAuthData,
  PrivateKey,
  PublicKey,
  SpendingCounter,
  StakeDelegation,
  StakeDelegationAuthData,
  Transaction,
  TransactionBuilder,
  Value,
  Witness,
  Witnesses,
} from 'react-native-chain-libs'

import {CARDANO_CONFIG} from '../../../config'

const CONFIG = CARDANO_CONFIG.SHELLEY

/**
 * Transactions cannot both send money and post a certifiate
 */
type SendType = {|amount: BigNumber|} | {|certificate: Certificate|}

export const buildUnsignedAccountTx = async (
  sender: PublicKey,
  receiver: string,
  typeSpecific: SendType,
  accountBalance: BigNumber,
): Promise<InputOutput> => {
  if (typeSpecific.amount != null && typeSpecific.amount.gt(accountBalance)) {
    throw new InsufficientFunds()
  }

  const payload =
    typeSpecific.certificate != null
      ? await Payload.certificate(typeSpecific.certificate)
      : await Payload.no_payload()

  // TODO: single_from_public_key not implemented yet
  const sourceAccount = await Account.single_from_public_key(sender)

  const feeAlgorithm = await Fee.linear_fee(
    await Value.from_str(CONFIG.LINEAR_FEE.CONSTANT),
    await Value.from_str(CONFIG.LINEAR_FEE.COEFFICIENT),
    await Value.from_str(CONFIG.LINEAR_FEE.CERTIFICATE),
  )

  let fee
  {
    const fakeTxBuilder = await InputOutputBuilder.empty()
    await fakeTxBuilder.add_input(
      await Input.from_account(
        sourceAccount,
        // the value we put in here is irrelevant. Just need some value to be able to calculate fee
        await Value.from_str('1000000'),
      ),
    )
    if (typeSpecific.amount != null) {
      await fakeTxBuilder.add_output(
        await Address.from_string(receiver),
        // the value we put in here is irrelevant. Just need some value to be able to calculate fee
        await Value.from_str('1'),
      )
    }
    fee = new BigNumber(
      await (await fakeTxBuilder.estimate_fee(feeAlgorithm, payload)).to_str(),
    )
  }

  const newAmount =
    typeSpecific.amount != null ? typeSpecific.amount.plus(fee) : fee
  if (newAmount.gt(accountBalance)) {
    throw new InsufficientFunds()
  }

  const ioBuilder = await InputOutputBuilder.empty()
  await ioBuilder.add_input(
    await Input.from_account(
      sourceAccount,
      await Value.from_str(newAmount.toString()),
    ),
  )
  sourceAccount.free()
  if (typeSpecific.amount != null) {
    // need to use this aux variable because flow don't like
    // typeSpecific.amount.toString()
    const outputAmount = typeSpecific.amount
    await ioBuilder.add_output(
      await Address.from_string(receiver),
      await Value.from_str(outputAmount.toString()),
    )
  }

  const IOs = await ioBuilder.seal_with_output_policy(
    payload,
    feeAlgorithm,
    // no change for account transactions
    await OutputPolicy.forget(),
  )

  feeAlgorithm.free()

  return IOs
}

async function generateAuthData(
  bindingSignature: AccountBindingSignature,
  certificate: Certificate,
): Promise<PayloadAuthData> {
  if (certificate == null) {
    return await PayloadAuthData.for_no_payload()
  }

  switch (await certificate.get_type()) {
    case StakeDelegation: {
      return await PayloadAuthData.for_stake_delegation(
        await StakeDelegationAuthData.new(bindingSignature),
      )
    }
    default:
      throw new Error(
        `generateAuthData unexptected cert type ${await certificate.get_type()}`,
      )
  }
}

export const signTransaction = async (
  IOs: InputOutput,
  accountCounter: number,
  certificate: ?Certificate,
  accountPrivateKey: PrivateKey,
): Promise<Transaction> => {
  const txbuilder = await new TransactionBuilder()

  // builderSetIOs: TransactionBuilderSetIOs
  const builderSetIOs =
    certificate != null
      ? await txbuilder.payload(certificate)
      : await txbuilder.no_payload()

  // builderSetWitness: TransactionBuilderSetWitness
  const builderSetWitness = await builderSetIOs.set_ios(
    await IOs.inputs(),
    await IOs.outputs(),
  )
  IOs.free()

  const witness = await Witness.for_account(
    await Hash.from_hex(CONFIG.GENESISHASH),
    await builderSetWitness.get_auth_data_for_witness(),
    accountPrivateKey,
    await SpendingCounter.from_u32(accountCounter),
  )
  // await txFinalizer.set_witness(0, witness)
  // return txFinalizer.build() // TODO: this might be changed to .finalize()

  const witnesses = await Witnesses.new()
  await witnesses.add(witness)

  // builderSignCertificate: TransactionBuilderSetAuthData
  const builderSignCertificate = await builderSetWitness.set_witnesses(
    witnesses,
  )
  witnesses.free()
  const payloadAuthData = await generateAuthData(
    await AccountBindingSignature.new_single(
      accountPrivateKey,
      await builderSignCertificate.get_auth_data(),
    ),
    certificate,
  )
  const signedTx = await builderSignCertificate.set_payload_auth(
    payloadAuthData,
  )
  return signedTx
}
