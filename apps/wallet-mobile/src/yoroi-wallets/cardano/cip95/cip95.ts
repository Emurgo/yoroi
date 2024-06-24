import {Wallet} from '@yoroi/types'
import {WalletImplementation} from '@yoroi/types/lib/typescript/wallet/wallet'
import {Buffer} from 'buffer'

import {cip30ExtensionMaker} from '../cip30/cip30'
import {cardanoConfig} from '../constants/cardano-config'
import {YoroiWallet} from '../types'
import {wrappedCsl} from '../wrappedCsl'

export const cip95ExtensionMaker = (wallet: YoroiWallet, meta: Wallet.Meta) => {
  return new CIP95Extension(wallet, meta)
}

export const supportsCIP95 = (implementation: WalletImplementation): implementation is 'cardano-cip1852' => {
  return implementation === 'cardano-cip1852'
}

class CIP95Extension {
  constructor(private wallet: YoroiWallet, private meta: Wallet.Meta) {
    if (!supportsCIP95(meta.implementation)) throw new Error('CIP95Extension: Unsupported wallet implementation')
  }

  async signData(rootKey: string, address: string, payload: string) {
    const cip30 = cip30ExtensionMaker(this.wallet, this.meta)
    return cip30.signData(rootKey, address, payload)
  }

  async getRegisteredPubStakeKeys(): Promise<string[]> {
    const status = await this.getStakeKeyStatus()
    return status.isRegistered ? [status.hex] : []
  }

  async getUnregisteredPubStakeKeys(): Promise<string[]> {
    const status = await this.getStakeKeyStatus()
    return status.isRegistered ? [] : [status.hex]
  }

  async getPubDRepKey(): Promise<string> {
    const {csl, release} = wrappedCsl()
    const walletImplementation = this.meta.implementation
    if (!supportsCIP95(walletImplementation)) throw new Error('CIP95Extension: Unsupported wallet implementation')

    try {
      const accountPubKey = await csl.Bip32PublicKey.fromBytes(Buffer.from(this.wallet.publicKeyHex, 'hex'))

      const implementationConfig = cardanoConfig.implementations[walletImplementation]
      const baseDerivations = implementationConfig.derivations.base

      const rawKey = await accountPubKey
        .derive(baseDerivations.roles.drep)
        .then((key) => key.derive(0))
        .then((key) => key.toRawKey())

      return rawKey.toHex()
    } finally {
      release()
    }
  }

  private async getStakeKeyStatus() {
    const stakingKey = await this.wallet.getStakingKey()
    const stakingInfo = await this.wallet.getStakingInfo()
    const isRegistered = stakingInfo.status !== 'not-registered'
    const hex = await stakingKey.toHex()
    return {hex, isRegistered}
  }
}
