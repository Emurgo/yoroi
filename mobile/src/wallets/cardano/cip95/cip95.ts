import {cardanoConfig} from '@yoroi/blockchains'
import {Wallet} from '@yoroi/types'

import {Buffer} from 'buffer'

import {cip30ExtensionMaker} from '../cip30/cip30'
import {YoroiWallet} from '../types'
import {wrappedCsl} from '../wrappedCsl'

export const cip95ExtensionMaker = (wallet: YoroiWallet, meta: Wallet.Meta) => {
  return new CIP95Extension(wallet, meta)
}

export const supportsCIP95 = (
  implementation: Wallet.Implementation,
): implementation is 'cardano-cip1852' => {
  return implementation === 'cardano-cip1852'
}

class CIP95Extension {
  constructor(
    private wallet: YoroiWallet,
    private meta: Wallet.Meta,
  ) {
    if (!supportsCIP95(meta.implementation))
      throw new Error('CIP95Extension: Unsupported wallet implementation')
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
    if (!supportsCIP95(walletImplementation))
      throw new Error('CIP95Extension: Unsupported wallet implementation')

    try {
      const accountPubKey = csl.Bip32PublicKey.fromBytes(
        Buffer.from(this.wallet.publicKeyHex, 'hex'),
      )

      const implementationConfig =
        cardanoConfig.implementations[walletImplementation]
      const baseDerivations = implementationConfig.derivations.base

      const rawKey = accountPubKey
        .derive(baseDerivations.roles.drep)
        .derive(0)
        .toRawKey()

      return rawKey.toHex()
    } finally {
      release()
    }
  }

  private async getStakeKeyStatus() {
    const stakingKey = this.wallet.getStakingKey()
    const stakingInfo = await this.wallet.getStakingInfo()
    const isRegistered = stakingInfo.status !== 'not-registered'
    const hex = stakingKey.toHex()
    return {hex, isRegistered}
  }
}
