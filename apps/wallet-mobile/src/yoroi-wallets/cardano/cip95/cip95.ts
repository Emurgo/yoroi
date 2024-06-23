import {Wallet} from '@yoroi/types'
import {Buffer} from 'buffer'

import {cip30ExtensionMaker} from '../cip30/cip30'
import {cardanoConfig} from '../constants/cardano-config'
import {YoroiWallet} from '../types'
import {wrappedCsl} from '../wrappedCsl'

export const cip95ExtensionMaker = (wallet: YoroiWallet, meta: Wallet.Meta) => {
  return new CIP95Extension(wallet, meta)
}

class CIP95Extension {
  constructor(private wallet: YoroiWallet, private meta: Wallet.Meta) {}

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
    try {
      const accountPubKey = await csl.Bip32PublicKey.fromBytes(Buffer.from(this.wallet.publicKeyHex, 'hex'))
      const implementationConfig = cardanoConfig.implementations[this.meta.implementation]
      const baseDerivations = implementationConfig.derivations.base

      return await Promise.resolve(accountPubKey)
        .then((key) => key.derive(baseDerivations.roles.drep))
        .then((key) => key.derive(0))
        .then((key) => key.toRawKey())
        .then((key) => key.toHex())
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
