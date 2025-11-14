import {
  ModernUtxo,
  addCertificate,
  addInputs,
  addWithdrawal,
  buildRecipeTransaction,
  createCardanoHaskellConfig,
  createStakeDeregistrationCertificate,
  createTransactionBuilder,
  setChangeAddress,
  setTTLWithBuffer,
} from '@yoroi/tx'
import {Portfolio, Wallet} from '@yoroi/types'

import type {PublicKey} from '@emurgo/cross-csl-core'

import type {AccountStateResponse} from '~/wallets/types/other'
import {CardanoMobile} from '~/wallets/wallets'

export type CreateWithdrawalTxParams = {
  utxos: ModernUtxo[]
  rewardAddressHex: string
  primaryTokenId: Portfolio.Token.Id
  protocolParams: {
    coinsPerUtxoByte: string
    keyDeposit: string
    linearFee: {constant: string; coefficient: string}
    poolDeposit: string
  }
  networkId: number
  getAbsoluteSlotNumber: () => Promise<BigNumber>
  getChangeAddress: (addressMode: Wallet.AddressMode) => string
  getStakingKey: () => PublicKey
  getAccountState: (addresses: string[]) => Promise<AccountStateResponse>
  shouldDeregister: boolean
  addressMode: Wallet.AddressMode
}

export async function createWithdrawalTx({
  utxos,
  rewardAddressHex,
  primaryTokenId,
  protocolParams,
  networkId,
  getAbsoluteSlotNumber,
  getChangeAddress,
  getStakingKey,
  getAccountState,
  shouldDeregister,
  addressMode,
}: CreateWithdrawalTxParams): Promise<{cbor: string}> {
  const absSlotNumber = await getAbsoluteSlotNumber()
  const changeAddress = getChangeAddress(addressMode)
  const accountState = await getAccountState([rewardAddressHex])

  const protocolParamsConfig = createCardanoHaskellConfig(
    protocolParams,
    networkId,
  )

  // Get withdrawal amount from account state
  const rewards = accountState[rewardAddressHex]?.rewards || '0'

  // Build transaction using functional TransactionBuilder
  let builderState = createTransactionBuilder()

  // Add all UTXOs as inputs
  builderState = addInputs(builderState, utxos)

  // Add withdrawal
  if (BigInt(rewards) > 0n) {
    builderState = addWithdrawal(builderState, rewardAddressHex, rewards)
  }

  // Add deregistration certificate if needed
  if (shouldDeregister) {
    const stakingKey = getStakingKey()
    const deregCert = createStakeDeregistrationCertificate(
      CardanoMobile,
      stakingKey,
    )
    builderState = addCertificate(builderState, deregCert)
  }

  // Set change address
  builderState = setChangeAddress(builderState, changeAddress)

  // Set TTL with buffer
  builderState = setTTLWithBuffer(builderState, absSlotNumber.toNumber())

  // Build the transaction
  return await buildRecipeTransaction(
    builderState,
    protocolParamsConfig,
    primaryTokenId,
  )
}
