import {SignedTransactionData} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {Transaction, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {HW, Wallet} from '@yoroi/types'

import {toLedgerSignRequest} from '../../../features/Discover/common/ledger'
import {cardanoConfig} from '../../../features/WalletManager/common/adapters/cardano/cardano-config'
import {assertHasAllSigners} from '../common/signatureUtils'
import {signTxWithLedger} from '../hw/hw'
import {YoroiWallet} from '../types'
import {derivePublicByAddressing, getAddressedUtxos, getHexAddressingMap} from '../utils'
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

      const transactionSetTag = await csl.hasTransactionSetTag(await tx.toBytes())

      if (transactionSetTag === csl.TransactionSetsState.MixedSets) {
        throw new Error('CIP30LedgerExtension.signTx: Mixed transaction sets are not supported when using a HW wallet')
      }

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
        signedLedgerTx,
        implementationConfig.derivations.base.harden.purpose,
        this.wallet.publicKeyHex,
      )
      return csl.Transaction.fromBytes(bytes)
    } finally {
      release()
    }
  }
}

export const createSignedLedgerTxFromCbor = async (
  wasm: WasmModuleProxy,
  cbor: string,
  signedData: SignedTransactionData,
  purpose: number,
  publicKeyHex: string,
): Promise<Uint8Array> => {
  const fixedTx = await wasm.FixedTransaction.fromHex(cbor)
  if (!fixedTx) throw new Error('invalid tx hex')

  const witSet = await fixedTx.witnessSet()
  const vkeys = (await witSet.vkeys()) || (await wasm.Vkeywitnesses.new())

  const addressing = {
    path: [
      purpose,
      2147485463, // CARDANO
      2147483648,
    ],
    startLevel: 1,
  }

  const key = await wasm.Bip32PublicKey.fromBytes(Buffer.from(publicKeyHex, 'hex'))
  const keyLevel = addressing.startLevel + addressing.path.length - 1

  for (let i = 0; i < signedData.witnesses.length; i++) {
    const addressKey = await derivePublicByAddressing(
      {startLevel: 1, path: signedData.witnesses[i].path},
      {level: keyLevel, key},
    )
    const witness = await wasm.Vkeywitness.new(
      await wasm.Vkey.new(await addressKey.toRawKey()),
      await wasm.Ed25519Signature.fromBytes(Buffer.from(signedData.witnesses[i].witnessSignatureHex, 'hex')),
    )
    if (!witness) throw new Error('invalid tx hex, could not generate vkey witness')
    await vkeys.add(witness)
  }

  await witSet.setVkeys(vkeys)
  await fixedTx.setWitnessSet(await witSet.toBytes())

  return fixedTx.toBytes()
}
