import {Transaction} from '@emurgo/cross-csl-core'
import {createSignedLedgerTxFromCbor} from '@emurgo/yoroi-lib'
import {HW, Wallet} from '@yoroi/types'

import {toLedgerSignRequest} from '../../../features/Discover/common/ledger'
import {cardanoConfig} from '../../../features/WalletManager/common/adapters/cardano/cardano-config'
import {assertHasAllSigners} from '../common/signatureUtils'
import {signTxWithLedger} from '../hw/hw'
import {YoroiWallet} from '../types'
import {getAddressedUtxos, getHexAddressingMap} from '../utils'
import {wrappedCsl} from '../wrappedCsl'

export const cip30LedgerExtensionMaker = (wallet: YoroiWallet, meta: Wallet.Meta) => {
  return new CIP30LedgerExtension(wallet, meta)
}

class CIP30LedgerExtension {
  constructor(private wallet: YoroiWallet, private meta: Wallet.Meta) {}

  async signTx(cbor: string, partial: boolean, hwDeviceInfo: HW.DeviceInfo, useUSB: boolean): Promise<Transaction> {
    const {csl, release} = wrappedCsl()
    try {
      if (!partial) await assertHasAllSigners(cbor, this.wallet, this.meta)

      const payload = await toLedgerSignRequest(
        csl,
        cbor,
        this.wallet.networkManager.chainId,
        this.wallet.networkManager.protocolMagic,
        await getHexAddressingMap(csl, this.wallet),
        await getHexAddressingMap(csl, this.wallet),
        getAddressedUtxos(this.wallet),
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
