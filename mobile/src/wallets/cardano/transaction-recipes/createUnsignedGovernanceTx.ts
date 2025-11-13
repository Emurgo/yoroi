import {cardanoConfig} from '@yoroi/blockchains'
import {
  CardanoHaskellConfig,
  ModernUtxo,
  NoOutputsError,
  NotEnoughMoneyToSendError,
  addCertificate,
  addInputs,
  buildTransaction,
  createTransactionBuilder,
  setChangeAddress,
  setTTL,
} from '@yoroi/tx'
import {App, Portfolio, Wallet} from '@yoroi/types'

import {CardanoTypes} from '~/wallets/cardano/types'

export type CreateUnsignedGovernanceTxParams = {
  utxos: ModernUtxo[]
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
  votingCertificates: CardanoTypes.Certificate[]
  addressMode: Wallet.AddressMode
}

export async function createUnsignedGovernanceTx({
  utxos,
  primaryTokenId,
  protocolParams,
  networkId,
  getAbsoluteSlotNumber,
  getChangeAddress,
  votingCertificates,
  addressMode,
}: CreateUnsignedGovernanceTxParams): Promise<{cbor: string}> {
  const absSlotNumber = await getAbsoluteSlotNumber()
  const changeAddress = getChangeAddress(addressMode)

  const protocolParamsConfig: CardanoHaskellConfig = {
    keyDeposit: protocolParams.keyDeposit,
    linearFee: protocolParams.linearFee,
    minimumUtxoVal: cardanoConfig.params.minUtxoValue.toString(),
    coinsPerUtxoByte: protocolParams.coinsPerUtxoByte,
    poolDeposit: protocolParams.poolDeposit,
    networkId,
  }

  try {
    // Build transaction using functional TransactionBuilder
    let builderState = createTransactionBuilder()

    // Add all UTXOs as inputs
    builderState = addInputs(builderState, utxos)

    // Add voting certificates
    for (const cert of votingCertificates) {
      builderState = addCertificate(builderState, cert)
    }

    // Set change address
    builderState = setChangeAddress(builderState, changeAddress)

    // Set TTL
    builderState = setTTL(builderState, absSlotNumber.toNumber())

    // Build the transaction
    const unsignedTx = await buildTransaction(
      builderState,
      protocolParamsConfig,
      primaryTokenId,
    )

    if (!unsignedTx.cbor) {
      throw new Error('Transaction CBOR not available')
    }

    return {cbor: unsignedTx.cbor}
  } catch (e) {
    if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError)
      throw e
    throw new App.Errors.LibraryError((e as Error).message)
  }
}
