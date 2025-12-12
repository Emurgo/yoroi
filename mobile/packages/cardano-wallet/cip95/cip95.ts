import {cardanoConfig} from '@yoroi/blockchains'
import {Wallet} from '@yoroi/types'

import {Buffer} from 'buffer'

import {cip30ExtensionMaker} from '../cip30/cip30'
import {YoroiWallet} from '../types'
import {CardanoMobileWrapped} from '../wrappedCsl'

export type CIP95Extension = {
  signData(
    rootKey: string,
    address: string,
    payload: string,
  ): Promise<{signature: string; key: string}>
  getRegisteredPubStakeKeys(): Promise<string[]>
  getUnregisteredPubStakeKeys(): Promise<string[]>
  getPubDRepKey(): Promise<string>
}

export const supportsCIP95 = (
  implementation: Wallet.Implementation,
): implementation is 'cardano-cip1852' => {
  return implementation === 'cardano-cip1852'
}

export const cip95ExtensionMaker = (
  wallet: YoroiWallet,
  meta: Wallet.Meta,
): CIP95Extension => {
  if (!supportsCIP95(meta.implementation))
    throw new Error('CIP95Extension: Unsupported wallet implementation')

  const getStakeKeyStatus = async () => {
    const stakingKey = wallet.getStakingKey()
    const stakingInfo = await wallet.getStakingInfo()
    const isRegistered = stakingInfo.status !== 'not-registered'
    const hex = stakingKey.toHex()
    return {hex, isRegistered}
  }

  return {
    async signData(rootKey: string, address: string, payload: string) {
      const cip30 = cip30ExtensionMaker(wallet, meta, {
        createCollateralEntry: wallet._dependencies.createCollateralEntry,
      })
      return cip30.signData(rootKey, address, payload)
    },

    async getRegisteredPubStakeKeys() {
      const status = await getStakeKeyStatus()
      return status.isRegistered ? [status.hex] : []
    },

    async getUnregisteredPubStakeKeys() {
      const status = await getStakeKeyStatus()
      return status.isRegistered ? [] : [status.hex]
    },

    async getPubDRepKey() {
      return CardanoMobileWrapped.cslScope((csl) => {
        const walletImplementation = meta.implementation
        if (!supportsCIP95(walletImplementation))
          throw new Error('CIP95Extension: Unsupported wallet implementation')

        const accountPubKey = csl.Bip32PublicKey.fromBytes(
          Buffer.from(wallet.publicKeyHex, 'hex'),
        )

        const implementationConfig =
          cardanoConfig.implementations[walletImplementation]
        const baseDerivations = implementationConfig.derivations.base

        const rawKey = accountPubKey
          .derive(baseDerivations.roles.drep)
          .derive(0)
          .toRawKey()

        return rawKey.toHex()
      })
    },
  }
}
