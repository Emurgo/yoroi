import {WalletChecksum} from '@emurgo/cip4-js'
import {Blockies} from '@yoroi/identicon'
import {App, Wallet} from '@yoroi/types'

import {NetworkId, WalletImplementationId} from '../../../yoroi-wallets/types'

const migrateWalletMeta = async (rootStorage: App.Storage) => {
  const walletsRootStorage = rootStorage.join('wallet/')
  const migrate = updateMeta(walletsRootStorage)

  const walletIds = await walletsRootStorage.getAllKeys()
  const walletMetas = await walletsRootStorage
    .multiGet(walletIds)
    .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))

  const metas = walletMetas.filter(isWalletMetaV2)
  for (const meta of metas) {
    await migrate(meta)
  }
}

const updateMeta = (walletsRootStorage: App.Storage) => async (meta: WalletMetaV2) => {
  // added
  const version = 3

  // migragted
  const implementation: Wallet.Implementation = meta.walletImplementationId.includes('shelley')
    ? 'cardano-shelley'
    : 'cardano-byron'
  const plate = meta.checksum.TextPart
  const avatar = new Blockies().asBase64({seed: meta.checksum.ImagePart})

  const walletStorage = walletsRootStorage.join(`${meta.id}/`)
  const data = (await walletStorage.getItem('data')) as {isReadOnly?: boolean}
  const isReadOnly = data?.isReadOnly ?? false

  // copied over
  const {isHW, addressMode, name, id, isEasyConfirmationEnabled} = meta

  const upgradedMeta: WalletMeta = {
    // added
    version,
    isReadOnly,

    // migrated
    implementation,
    plate,
    avatar,

    // copied over
    id,
    name,
    addressMode,
    isHW,
    isEasyConfirmationEnabled,
  }

  return walletsRootStorage.setItem(id, upgradedMeta)
}

export const to4_28_0 = migrateWalletMeta

type WalletMetaV2 = {
  id: string
  name: string
  isHW: boolean
  isEasyConfirmationEnabled: boolean
  addressMode: AddressMode
  walletImplementationId: WalletImplementationId
  checksum: WalletChecksum

  networkId: NetworkId
}
export function isWalletMetaV2(walletMeta: unknown): walletMeta is WalletMetaV2 {
  if (walletMeta == null) return false
  if (typeof walletMeta !== 'object') return false
  return (
    // prettier-ignore
    !!walletMeta &&
    'id' in walletMeta
      && typeof walletMeta.id === 'string' &&
    'name' in walletMeta
      && typeof walletMeta.name === 'string' &&
    'isHW' in walletMeta
      && typeof walletMeta.isHW === 'boolean' &&
    'isEasyConfirmationEnabled' in walletMeta
      && typeof walletMeta.isEasyConfirmationEnabled === 'boolean' &&
    'walletImplementationId' in walletMeta
      && typeof walletMeta.walletImplementationId === 'string' &&
    'addressMode' in walletMeta 
      && typeof walletMeta.addressMode === 'string' &&
    !('version' in walletMeta) &&
    'checksum' in walletMeta
      && typeof walletMeta.checksum === 'object'
  )
}
