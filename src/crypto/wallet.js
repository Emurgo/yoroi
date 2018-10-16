// @flow
import * as util from './util'
import api from '../api'
import {CONFIG} from '../config'

class WalletManager {
  masterKey: any;
  internalAddresses: Array<string>;
  externalAddresses: Array<string>;
  transactions: any;

  constructor() {
    this.masterKey = null
    this.internalAddresses = []
    this.externalAddresses = []
    this.transactions = {}
  }

  getAccount() {
    return util.getAccountFromMasterKey(
      this.masterKey,
      CONFIG.CARDANO.PROTOCOL_MAGIC,
    )
  }

  async restoreWallet(mnemonic: string) {
    this.masterKey = util.getMasterKeyFromMnemonic(mnemonic)
    this.internalAddresses = (await util.discoverAddresses(
      this.getAccount(), 'Internal', -1,
      api.filterUsedAddresses,
      CONFIG.WALLET.DISCOVERY_GAP_SIZE,
      CONFIG.WALLET.DISCOVERY_SEARCH_SIZE,
    )
    ).addresses
    this.externalAddresses = (await util.discoverAddresses(
      this.getAccount(), 'External', -1,
      api.filterUsedAddresses,
      CONFIG.WALLET.DISCOVERY_GAP_SIZE,
      CONFIG.WALLET.DISCOVERY_SEARCH_SIZE,
    )
    ).addresses
  }
}

export default new WalletManager()
