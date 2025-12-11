import {cardanoConfig} from '@yoroi/blockchains'
import {isHex} from '@yoroi/common'
import {
  CIP30TransactionError,
  createSignedLedgerTxFromCbor,
  validateTransactionCbor,
} from '@yoroi/tx'
import {HW, Wallet} from '@yoroi/types'

import {
  MessageAddressFieldType,
  MessageData,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {Address, Transaction} from '@emurgo/cross-csl-core'

import {buildCoseSign1FromSignature, makeCip8Key} from '../cip8/cip8'
import {assertHasAllSigners} from '../common/signatureUtils'
import {CardanoWalletDependencies} from '../dependencies'
import {signMessageWithLedger, signTxWithLedger} from '../hw/hw'
import {YoroiWallet} from '../types'
import {
  copyFromCSL,
  getAddressedUtxos,
  getHexAddressingMap,
  getStakeAddressMap,
} from '../utils'
import {CardanoMobile, CardanoMobileWrapped} from '../wrappedCsl'

export type CIP30LedgerExtension = {
  signData(
    address: string,
    payload: string,
    hwDeviceInfo: HW.DeviceInfo,
    useUSB: boolean,
  ): Promise<{signature: string; key: string}>
  signTx(
    cbor: string,
    partial: boolean,
    hwDeviceInfo: HW.DeviceInfo,
    useUSB: boolean,
  ): Promise<Transaction>
}

export const cip30LedgerExtensionMaker = (
  wallet: YoroiWallet,
  meta: Wallet.Meta,
  dependencies: Pick<CardanoWalletDependencies, 'toLedgerSignRequest'>,
): CIP30LedgerExtension => {
  const {toLedgerSignRequest} = dependencies
  return {
    async signData(
      address: string,
      payload: string,
      hwDeviceInfo: HW.DeviceInfo,
      useUSB: boolean,
    ) {
      return CardanoMobileWrapped.cslScope(async (csl) => {
        // Create address within this cslScope to avoid pointer issues
        let normalizedAddress: Address | null = null
        if (csl.ByronAddress.isValid(address)) {
          const byronAddr = csl.ByronAddress.fromBase58(address)
          normalizedAddress = byronAddr.toAddress()
        } else {
          const isHexAddr = isHex(address)
          normalizedAddress = isHexAddr
            ? csl.Address.fromHex(address)
            : csl.Address.fromBech32(address)
        }

        if (!normalizedAddress || normalizedAddress.isMalformed()) {
          throw new Error('Invalid address')
        }

        const rewardAddress = csl.RewardAddress.fromAddress(normalizedAddress)
        const rewardAddressHex = rewardAddress?.toAddress().toHex()

        const stakingSigningPath =
          meta.implementation === 'cardano-cip1852'
            ? cardanoConfig.implementations[meta.implementation].features
                .staking.addressing
            : null

        const bech32Address = normalizedAddress.toBech32(undefined)
        if (!bech32Address) throw new Error('Invalid address')
        const signingPath =
          rewardAddressHex === wallet.rewardAddressHex &&
          Array.isArray(stakingSigningPath)
            ? stakingSigningPath
            : wallet.getAddressing(bech32Address).path

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
    },

    async signTx(
      cbor: string,
      partial: boolean,
      hwDeviceInfo: HW.DeviceInfo,
      useUSB: boolean,
    ) {
      return CardanoMobileWrapped.cslScope(async (csl) => {
        // Validate transaction CBOR before signing
        const validation = validateTransactionCbor(csl, cbor)
        if (!validation.valid) {
          throw new CIP30TransactionError(
            `Transaction validation failed: ${validation.errors.join(', ')}`,
            validation,
          )
        }

        if (!partial) await assertHasAllSigners(cbor, wallet, meta)

        const stakingSigningPath =
          meta.implementation === 'cardano-cip1852'
            ? Array.from(
                cardanoConfig.implementations[meta.implementation].features
                  .staking.addressing,
              )
            : undefined

        const addressingMap = await getHexAddressingMap(wallet)
        const stakeAddressMap = getStakeAddressMap(
          wallet.rewardAddressHex,
          stakingSigningPath as number[] | undefined,
        )
        const payload = await toLedgerSignRequest(
          csl,
          cbor,
          wallet.networkManager.chainId,
          wallet.networkManager.protocolMagic,
          addressingMap,
          stakeAddressMap,
          getAddressedUtxos(wallet),
          [],
          stakingSigningPath as number[] | undefined,
        )

        const signedLedgerTx = await signTxWithLedger(
          payload,
          hwDeviceInfo,
          useUSB,
        )
        const implementationConfig =
          cardanoConfig.implementations[meta.implementation]
        const bytes = await createSignedLedgerTxFromCbor(
          cbor,
          signedLedgerTx,
          implementationConfig.derivations.base.harden.purpose,
          wallet.publicKeyHex,
        )
        const tx = csl.Transaction.fromBytes(bytes)
        return copyFromCSL(CardanoMobile.Transaction, tx)
      })
    },
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
    Buffer.from(options.signingPublicKeyHex, 'hex'),
  )

  const key = await makeCip8Key(Buffer.from(options.signingPublicKeyHex, 'hex'))

  return {
    signature: Buffer.from(coseSign1.toBytes()).toString('hex'),
    key: Buffer.from(key.toBytes()).toString('hex'),
  }
}
