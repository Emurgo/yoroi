import {Transaction, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {createSignedLedgerTxFromCbor} from '@emurgo/yoroi-lib'
import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import {HW, Wallet} from '@yoroi/types'

import {toLedgerSignRequest} from '../../../features/Discover/common/ledger'
import type {RawUtxo} from '../../types'
import {assertHasAllSigners} from '../common/signatureUtils'
import {cardanoConfig} from '../constants/cardano-config'
import {signTxWithLedger} from '../hw'
import {CardanoTypes, YoroiWallet} from '../types'
import {wrappedCsl} from '../wrappedCsl'

export const cip30LedgerExtensionMaker = (wallet: YoroiWallet, meta: Wallet.Meta) => {
  return new CIP30LedgerExtension(wallet, meta)
}

class CIP30LedgerExtension {
  constructor(private wallet: YoroiWallet, private meta: Wallet.Meta) {}

  async signTx(cbor: string, partial: boolean, hwDeviceInfo: HW.DeviceInfo, useUSB: boolean): Promise<Transaction> {
    const {csl, release} = wrappedCsl()
    try {
      const tx = await csl.Transaction.fromHex(cbor)
      if (!partial) await assertHasAllSigners(cbor, this.wallet, this.meta)
      const txBody = await tx.body()

      const payload = await toLedgerSignRequest(
        csl,
        txBody,
        this.wallet.networkManager.chainId,
        this.wallet.networkManager.protocolMagic,
        await getHexAddressingMap(csl, this.wallet),
        await getHexAddressingMap(csl, this.wallet),
        getAddressedUtxos(this.wallet),
        await txBody.toBytes(),
        [],
      )

      const signedLedgerTx = await signTxWithLedger(payload, hwDeviceInfo, useUSB)
      const implementationConfig = cardanoConfig.implementations[this.meta.implementation]
      const bytes = await createSignedLedgerTxFromCbor(
        csl,
        cbor,
        signedLedgerTx.witnesses,
        implementationConfig.derivations.base.harden.purpose,
        this.wallet.publicKeyHex,
      )
      return csl.Transaction.fromBytes(bytes)
    } finally {
      release()
    }
  }
}

const getHexAddressingMap = async (csl: WasmModuleProxy, wallet: YoroiWallet) => {
  const addressedUtxos = wallet.utxos.map(async (utxo: RawUtxo) => {
    const addressing = wallet.getAddressing(utxo.receiver)
    const hexAddress = await normalizeToAddress(csl, utxo.receiver).then((a) => a?.toHex())

    return {addressing, hexAddress}
  })

  const addressing = await Promise.all(addressedUtxos)
  return addressing.reduce<{[addressHex: string]: Array<number>}>((acc, curr) => {
    if (!curr.hexAddress) return acc
    acc[curr.hexAddress] = curr.addressing.path
    return acc
  }, {})
}

const getAddressedUtxos = (wallet: YoroiWallet) => {
  return wallet.utxos.map((utxo: RawUtxo): CardanoTypes.CardanoAddressedUtxo => {
    const addressing = wallet.getAddressing(utxo.receiver)

    return {
      addressing,
      txIndex: utxo.tx_index,
      txHash: utxo.tx_hash,
      amount: utxo.amount,
      receiver: utxo.receiver,
      utxoId: utxo.utxo_id,
      assets: utxo.assets,
    }
  })
}
