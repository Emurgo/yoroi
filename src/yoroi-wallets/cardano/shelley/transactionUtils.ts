/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'

import {CardanoHaskellShelleyNetwork} from '../../../legacy/networks'
import {AddressedUtxo, Addressing, SendTokenList} from '../../../types'
import {CardanoTypes, DefaultTokenEntry} from '../..'
import {HaskellShelleyTxSignRequest} from '../HaskellShelleyTxSignRequest'

export type CreateUnsignedTxResponse = HaskellShelleyTxSignRequest

export type CreateUnsignedTxRequest = {
  changeAddr: Addressing & {
    address: string
  }
  absSlotNumber: BigNumber
  receiver: string
  addressedUtxos: Array<AddressedUtxo>
  defaultToken: DefaultTokenEntry
  tokens: SendTokenList
  auxiliaryData?: CardanoTypes.AuxiliaryData
  networkConfig: CardanoHaskellShelleyNetwork
}
