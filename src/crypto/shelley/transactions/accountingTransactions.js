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
  Fragment,
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
  TransactionBuilder,
  Value,
  Witness,
  Witnesses,
} from 'react-native-chain-libs'
import {generateAuthData} from './utils'

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
  const wasmReceiver = await Address.from_bytes(Buffer.from(receiver, 'hex'))
  if (typeSpecific.amount != null && typeSpecific.amount.gt(accountBalance)) {
    throw new InsufficientFunds()
  }

  const payload =
    typeSpecific.certificate != null
      ? await Payload.certificate(typeSpecific.certificate)
      : await Payload.no_payload()

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
        wasmReceiver,
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
      wasmReceiver,
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

export const signTransaction = async (
  IOs: InputOutput,
  accountCounter: number,
  certificate: ?Certificate,
  accountPrivateKey: PrivateKey,
): Fragment => {
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

  const witnesses = await Witnesses.new()
  await witnesses.add(witness)

  // Type(builderSignCertificate): TransactionBuilderSetAuthData
  const builderSignCertificate = await builderSetWitness.set_witnesses(
    witnesses,
  )
  witnesses.free()
  // prettier-ignore
  const payloadAuthData =
    certificate == null ?
      await PayloadAuthData.for_no_payload()
      : await generateAuthData(
        await AccountBindingSignature.new_single(
          accountPrivateKey,
          await builderSignCertificate.get_auth_data(),
        ),
        certificate,
      )
  const signedTx = await builderSignCertificate.set_payload_auth(
    payloadAuthData,
  )
  const fragment = await Fragment.from_transaction(signedTx)
  return fragment
}
