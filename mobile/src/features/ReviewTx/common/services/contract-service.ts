/**
 * Smart Contract Service
 *
 * Queries a service to get information about smart contract addresses
 */

import {CredKind} from '@emurgo/cross-csl-core'

import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'

export type SmartContractInfo = {
  address: string
  name?: string
  purpose?: string
  description?: string
  parameters?: Record<string, unknown>
  contractType?: 'plutus-v1' | 'plutus-v2' | 'plutus-v3'
}

export type ContractServiceConfig = {
  apiUrl: string
  timeout?: number
}

export class ContractService {
  private config: ContractServiceConfig

  constructor(config: ContractServiceConfig) {
    this.config = config
  }

  /**
   * Query contract information for a given address
   */
  async getContractInfo(address: string): Promise<SmartContractInfo | null> {
    try {
      // Only query API if this is a contract address
      if (!ContractService.isContractAddress(address)) {
        return null
      }

      const response = await fetch(
        `${this.config.apiUrl}/contracts/${address}`,
        {
          method: 'GET',
          signal: AbortSignal.timeout(this.config.timeout ?? 5000),
        },
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return {
        address,
        name: data.name,
        purpose: data.purpose,
        description: data.description,
        parameters: data.parameters,
        contractType: data.contractType,
      }
    } catch (error) {
      console.error('Failed to fetch contract info:', error)
      return null
    }
  }

  /**
   * Batch query contract information for multiple addresses
   */
  async getManyContractInfo(
    addresses: string[],
  ): Promise<Record<string, SmartContractInfo | null>> {
    const results = await Promise.all(
      addresses.map(async (address) => ({
        address,
        info: await this.getContractInfo(address),
      })),
    )

    return results.reduce(
      (acc, {address, info}) => {
        acc[address] = info
        return acc
      },
      {} as Record<string, SmartContractInfo | null>,
    )
  }

  /**
   * Check if an address is a smart contract address
   * This can be done locally by checking the address type
   */
  static isContractAddress(address: string): boolean {
    return CardanoMobileWrapped.cslScope((csl) => {
      try {
        const cslAddress = csl.Address.fromBech32(address)
        const paymentCred = cslAddress.paymentCred()
        if (!paymentCred) {
          return false
        }
        const credKind = paymentCred.kind()
        // Script addresses have CredKind.Script (value 1)
        // Key addresses have CredKind.Key (value 0)
        return credKind === CredKind.Script
      } catch {
        // If address parsing fails, it's not a valid address, so not a contract
        return false
      }
    })
  }
}
