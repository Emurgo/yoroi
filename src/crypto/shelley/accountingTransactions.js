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
  TransactionFinalizer,
  PrivateKey,
  PublicKey,
  Witness,
  SpendingCounter,
  Hash,
  Account,
  AuthenticatedTransaction,
} from 'react-native-chain-libs'

// TODO: move to external config file
const CONFIG = {
  linearFee: {
    constant: '155381',
    coefficient: '1',
    certificate: '4',
  },
  addressDiscrimination: {
    production: '0',
    test: '1',
  },
  genesisHash:
    'adbdd5ede31637f6c9bad5c271eec0bc3d0cb9efb86a5b913bb55cba549d0770',
}

// TODO: define a transaction type
export const buildTransaction = async (
  sender: PublicKey,
  receiver: string,
  amount: BigNumber,
  accountBalance: BigNumber,
) => {
  if (amount.gt(accountBalance)) {
    throw new InsufficientFunds()
  }

  // Account.from_public_key API is not yet available, so we create an
  // account address first
  const sourceAddress = await Address.account_from_public_key(
    sender,
    parseInt(CONFIG.addressDiscrimination.production, 10),
  )
  const sourceAccount = await Account.from_address(sourceAddress)

  const feeAlgorithm = await Fee.linear_fee(
    await Value.from_str(CONFIG.linearFee.constant),
    await Value.from_str(CONFIG.linearFee.coefficient),
    await Value.from_str(CONFIG.linearFee.certificate),
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

    // Fee.calculate() is not implemented yet, we compute from txBuilder
    const calculatedFee = await fakeTxBuilder.estimate_fee(feeAlgorithm)

    const tx = await fakeTxBuilder.seal_with_output_policy(
      feeAlgorithm,
      await OutputPolicy.forget(),
    )

    // const calculatedFee = await feeAlgorithm.calculate(tx)
    if (calculatedFee == null) {
      throw new InsufficientFunds()
    }
    fee = new BigNumber(calculatedFee.to_str())

    tx.free()
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
  // unsignedTx: Transaction, // TODO
  unsignedTx: any,
  accountCounter: number,
  accountPrivateKey: PrivateKey,
): AuthenticatedTransaction => {
  const txFinalizer = await new TransactionFinalizer(unsignedTx)
  const witness = await Witness.for_account(
    await Hash.from_hex(CONFIG.genesisHash),
    await txFinalizer.get_tx_sign_data_hash(),
    accountPrivateKey,
    SpendingCounter.from_u32(accountCounter), // TODO: missing implementation
  )
  await txFinalizer.set_witness(0, witness)
  return txFinalizer.build() // TODO: this might be changed to .finalize()
}
