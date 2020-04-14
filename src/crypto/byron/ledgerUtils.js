// @flow

import AppAda from '@cardano-foundation/ledgerjs-hw-app-cardano'

import {Logger} from '../../utils/logging'

import type {
  GetVersionResponse,
  GetExtendedPublicKeyResponse,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import type {Device} from '@ledgerhq/react-native-hw-transport-ble'
import type Transport from '@ledgerhq/hw-transport'

// these are defined in LedgerConnectStore.js in yoroi-frontend
type LedgerConnectionResponse = {
  versionResp: GetVersionResponse,
  extendedPublicKeyResp: GetExtendedPublicKeyResponse,
}

/* the following types are defined in HWConnectStoreTypes.js in yoroi-frontend as interfaces
 should probably be placed in a separate module as well */

// Hardware wallet device Features object
export type HWFeatures = {
  vendor: string,
  model: string,
  label: string,
  deviceId: string,
  language: string,
  majorVersion: number,
  minorVersion: number,
  patchVersion: number,
}

export type HWDeviceInfo = {
  bip44AccountPublic: string,
  hwFeatures: HWFeatures,
}

// const DEFAULT_WALLET_NAME = 'Yoroi-Ledger'
const VENDOR = 'ledger.com'
const MODEL = 'NanoX'

const HARDENED = 0x80000000
const PURPOSE = 44
const COIN_TYPE = 1815 // Cardano

// borrowed from yoroi-extension-ledger-bridge
const makeCardanoAccountBIP44Path = (account: number) => {
  return [HARDENED + PURPOSE, HARDENED + COIN_TYPE, HARDENED + account]
}

const validateHWResponse = (resp: LedgerConnectionResponse): boolean => {
  const {extendedPublicKeyResp, versionResp} = resp
  if (versionResp == null) {
    throw new Error('Ledger device version response is undefined')
  }
  if (extendedPublicKeyResp == null) {
    throw new Error('Ledger device extended public key response is undefined')
  }
  return true
}

const normalizeHWResponse = (resp: LedgerConnectionResponse): HWDeviceInfo => {
  validateHWResponse(resp)
  const {extendedPublicKeyResp, versionResp} = resp
  return {
    bip44AccountPublic:
      extendedPublicKeyResp.publicKeyHex + extendedPublicKeyResp.chainCodeHex,
    hwFeatures: {
      vendor: VENDOR,
      model: MODEL,
      label: '',
      deviceId: '',
      language: '',
      majorVersion: parseInt(versionResp.major, 10),
      minorVersion: parseInt(versionResp.minor, 10),
      patchVersion: parseInt(versionResp.patch, 10),
    },
  }
}

export const checkAndStoreHWDeviceInfo = async (
  transport: Transport<Device | string>,
): Promise<?HWDeviceInfo> => {
  try {
    const appAda = new AppAda(transport)
    const versionResp: GetVersionResponse = await appAda.getVersion()
    Logger.debug('AppAda version', versionResp)

    // TODO: assume single account in Yoroi
    const accountPath = makeCardanoAccountBIP44Path(0)
    Logger.debug('bip44 account path', accountPath)

    // get Cardano's first account
    // i.e hdPath = [2147483692, 2147485463, 2147483648]
    const extendedPublicKeyResp: GetExtendedPublicKeyResponse = await appAda.getExtendedPublicKey(
      accountPath,
    )
    Logger.debug('extended public key', extendedPublicKeyResp)

    const hwDeviceInfo = normalizeHWResponse({
      versionResp,
      extendedPublicKeyResp,
    })
    Logger.info('Ledger device OK')
    return hwDeviceInfo
  } catch (error) {
    Logger.error(error)
    throw error
  }
}
