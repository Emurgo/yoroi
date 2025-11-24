import {cardanoConfig} from '@yoroi/blockchains'
import {HW, Wallet} from '@yoroi/types'

import {
  MessageAddressFieldType,
  MessageData,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {Transaction} from '@emurgo/cross-csl-core'
import {createSignedLedgerTxFromCbor} from '@emurgo/yoroi-lib'
import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'

import {toLedgerSignRequest} from '~/features/Discover/common/ledger'
import {CardanoMobile} from '~/wallets/wallets'

import {buildCoseSign1FromSignature, makeCip8Key} from '../cip8/cip8'
import {assertHasAllSigners} from '../common/signatureUtils'
import {signMessageWithLedger, signTxWithLedger} from '../hw/hw'
import {YoroiWallet} from '../types'
import {copyFromCSL, getAddressedUtxos, getHexAddressingMap} from '../utils'
import {CardanoMobileWrapped} from '../wrappedCsl'

export const cip30LedgerExtensionMaker = (
  wallet: YoroiWallet,
  meta: Wallet.Meta,
) => {
  return new CIP30LedgerExtension(wallet, meta)
}

class CIP30LedgerExtension {
  constructor(
    private wallet: YoroiWallet,
    private meta: Wallet.Meta,
  ) {}

  async signData(
    address: string,
    payload: string,
    hwDeviceInfo: HW.DeviceInfo,
    useUSB: boolean,
  ): Promise<{signature: string; key: string}> {
    return CardanoMobileWrapped.cslScope(async (csl) => {
      const normalizedAddress = normalizeToAddress(csl, address)
      if (!normalizedAddress) throw new Error('Invalid address')
      const rewardAddress = csl.RewardAddress.fromAddress(normalizedAddress)
      const rewardAddressHex = rewardAddress?.toAddress().toHex()

      const stakingSigningPath =
        this.meta.implementation === 'cardano-cip1852'
          ? cardanoConfig.implementations[this.meta.implementation].features
              .staking.addressing
          : null

      const signingPath =
        rewardAddressHex === this.wallet.rewardAddressHex &&
        Array.isArray(stakingSigningPath)
          ? stakingSigningPath
          : this.wallet.getAddressing(normalizedAddress.toBech32(undefined))
              .path

      const ledgerPayload: MessageData = {
        messageHex: payload,
        signingPath,
        hashPayload: false,
        preferHexDisplay: false,
        addressFieldType: MessageAddressFieldType.KEY_HASH,
      }
      const response = await signMessageWithLedger(
        ledgerPayload,
        hwDeviceInfo,
        useUSB,
      )
      return encodeHardwareWalletSignResult({
        addressHex: response.addressFieldHex,
        signatureHex: response.signatureHex,
        payloadHex: payload,
        signingPublicKeyHex: response.signingPublicKeyHex,
      })
    })
  }

  async signTx(
    cbor: string,
    partial: boolean,
    hwDeviceInfo: HW.DeviceInfo,
    useUSB: boolean,
  ): Promise<Transaction> {
    return CardanoMobileWrapped.cslScope(async (csl) => {
      if (!partial) assertHasAllSigners(cbor, this.wallet, this.meta)

      const stakingSigningPath =
        this.meta.implementation === 'cardano-cip1852'
          ? Array.from(
              cardanoConfig.implementations[this.meta.implementation].features
                .staking.addressing,
            )
          : undefined

      const payload = await toLedgerSignRequest(
        csl,
        cbor,
        this.wallet.networkManager.chainId,
        this.wallet.networkManager.protocolMagic,
        getHexAddressingMap(csl, this.wallet),
        getHexAddressingMap(csl, this.wallet),
        getAddressedUtxos(this.wallet),
        [],
        stakingSigningPath,
      )

      const signedLedgerTx = await signTxWithLedger(
        payload,
        hwDeviceInfo,
        useUSB,
      )
      const implementationConfig =
        cardanoConfig.implementations[this.meta.implementation]
      const bytes = await createSignedLedgerTxFromCbor(
        csl,
        cbor,
        signedLedgerTx,
        implementationConfig.derivations.base.harden.purpose,
        this.wallet.publicKeyHex,
      )
      const tx = csl.Transaction.fromBytes(bytes)
      return copyFromCSL(CardanoMobile.Transaction, tx)
    })
  }
}

export async function encodeHardwareWalletSignResult(options: {
  addressHex: string
  signatureHex: string
  payloadHex: string
  signingPublicKeyHex: string
}): Promise<{signature: string; key: string}> {
  const coseSign1 = await buildCoseSign1FromSignature(
    Buffer.from(options.addressHex, 'hex'),
    Buffer.from(options.signatureHex, 'hex'),
    Buffer.from(options.payloadHex, 'hex'),
  )

  const key = await makeCip8Key(Buffer.from(options.signingPublicKeyHex, 'hex'))

  return {
    signature: Buffer.from(coseSign1.toBytes()).toString('hex'),
    key: Buffer.from(key.toBytes()).toString('hex'),
  }
}
