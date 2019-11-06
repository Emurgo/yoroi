// @flow

import {InsufficientFunds} from '../errors'
import {BigNumber} from 'bignumber.js'
import {
  OutputPolicy,
  TransactionBuilder,
  Address,
  Input,
  Value,
  Fee,
  Transaction,
  TransactionFinalizer,
  PrivateKey,
  PublicKey,
  Witness,
  SpendingCounter,
  Hash,
  Account,
  AuthenticatedTransaction,
} from 'react-native-chain-libs'

import {CARDANO_CONFIG} from '../../config'

const CONFIG = CARDANO_CONFIG.SHELLEY

export const buildTransaction = async (
  sender: PublicKey,
  receiver: string,
  amount: BigNumber,
  accountBalance: BigNumber,
): Transaction => {
  if (amount.gt(accountBalance)) {
    throw new InsufficientFunds()
  }

  const sourceAddress = await Address.account_from_public_key(
    sender,
    parseInt(CONFIG.ADDRESS_DISCRIMINATION.PRODUCTION, 10),
  )
  const sourceAccount = await Account.from_address(sourceAddress)

  const feeAlgorithm = await Fee.linear_fee(
    await Value.from_str(CONFIG.LINEAR_FEE.CONSTANT),
    await Value.from_str(CONFIG.LINEAR_FEE.COEFFICIENT),
    await Value.from_str(CONFIG.LINEAR_FEE.CERTIFICATE),
  )

  let fee
  {
    const fakeTxBuilder = await TransactionBuilder.new_no_payload()
    await fakeTxBuilder.add_input(
      await Input.from_account(
        sourceAccount,
        // the value we put in here is irrelevant. Just need some value to be able to calculate fee
        await Value.from_str('1000000'),
      ),
    )
    await fakeTxBuilder.add_output(
      await Address.from_string(receiver),
      // the value we put in here is irrelevant. Just need some value to be able to calculate fee
      await Value.from_str('1'),
    )

    const tx = await fakeTxBuilder.seal_with_output_policy(
      feeAlgorithm,
      await OutputPolicy.forget(),
    )

    const calculatedFee = await feeAlgorithm.calculate(tx)
    if (calculatedFee == null) {
      throw new InsufficientFunds()
    }
    fee = new BigNumber(await calculatedFee.to_str())
  }

  const newAmount = amount.plus(fee)
  if (newAmount.gt(accountBalance)) {
    throw new InsufficientFunds()
  }

  const txBuilder = await TransactionBuilder.new_no_payload()
  await txBuilder.add_input(
    await Input.from_account(
      sourceAccount,
      await Value.from_str(newAmount.toString()),
    ),
  )
  await txBuilder.add_output(
    await Address.from_string(receiver),
    await Value.from_str(amount.toString()),
  )

  const tx = await txBuilder.seal_with_output_policy(
    feeAlgorithm,
    await OutputPolicy.forget(),
  )

  sourceAccount.free()
  return tx
}

export const signTransaction = async (
  unsignedTx: Transaction,
  accountCounter: number,
  accountPrivateKey: PrivateKey,
): AuthenticatedTransaction => {
  const txFinalizer = await new TransactionFinalizer(unsignedTx)
  const witness = await Witness.for_account(
    await Hash.from_hex(CONFIG.GENESISHASH),
    await txFinalizer.get_tx_sign_data_hash(),
    accountPrivateKey,
    SpendingCounter.from_u32(accountCounter), // TODO: missing implementation
  )
  await txFinalizer.set_witness(0, witness)
  return txFinalizer.build() // TODO: this might be changed to .finalize()
}
