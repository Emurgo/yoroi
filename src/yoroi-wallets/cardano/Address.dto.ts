import {Address, BaseAddress, ByronAddress, RewardAddress} from '.'
import type {YoroiAddressInfoInterface} from './AddressInterface'

// NOTE: ** IMPORTANT ** The order matters
const ADDRESS_TYPES = Object.freeze([
  ByronAddress,
  BaseAddress,
  // PointerAddress,
  // EnterpriseAddress,
  RewardAddress,
])

export type KeyHashesCardano = {
  spending: string
  staking: string
}

/**
 * @description The resolver for the Cardano key hashes
 * @param {any} wasmAddress A Cardano wallet Address
 * @returns {Promise<KeyHashesCardano|null>} You don't need to test for Byron it will return null
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getKeyHashesCardano = async (wasmAddress: any): Promise<KeyHashesCardano | null> => {
  let addr, pay, stake, paymentKeyHash, stakingKeyHash
  for (const [i, addressType] of ADDRESS_TYPES.entries()) {
    // First = Byron
    if (!i) {
      addr = await addressType.fromAddress(wasmAddress)
      if (addr) return null
    } else {
      addr = await addressType.fromAddress(wasmAddress)
      if (addr) {
        pay = await addr.payment_cred()
        stake = await addr.stake_cred()
        if (!pay || !stake) break
        paymentKeyHash = await pay.to_keyhash()
        stakingKeyHash = await stake.to_keyhash()
        if (!paymentKeyHash || !stakingKeyHash) break
        return {
          spending: Buffer.from(await paymentKeyHash.to_bytes())?.toString('hex'),
          staking: Buffer.from(await stakingKeyHash.to_bytes())?.toString('hex'),
        }
      }
    }
  }
  // Something went wrong
  throw new Error('getSpendingKeyHash unknown address type')
}

export class AddressDTOCardano implements YoroiAddressInfoInterface<KeyHashesCardano> {
  _address: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _wasmAddress: any
  _keyHashes: KeyHashesCardano | null = null

  constructor(addrBech32: string) {
    this._address = addrBech32
  }

  get address() {
    return this._address
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getWasmAddress(): Promise<any> {
    if (!this._wasmAddress) {
      this._wasmAddress = await Address.fromBech32(this._address)
    }
    return this._wasmAddress
  }

  async getKeyHashes() {
    if (!this._keyHashes) {
      this._keyHashes = await getKeyHashesCardano(await this.getWasmAddress())
    }
    return this._keyHashes
  }
}
