import {CardanoTypes} from '../cardanoMobile'
import {isRegisteredDrep} from './api'
import {axiosClient} from './config'

type Config = {
  networkId: number
  cardano: CardanoTypes.Wasm
}

type GovernanceManager = {
  validateDRepID: (drepID: string) => Promise<void>
  createDelegationCertificate: (drepID: string, stakingKey: CardanoTypes.PublicKey) => Promise<CardanoTypes.Certificate>
}

export const createGovernanceManager = (config: Config): GovernanceManager => {
  return new Manager(config)
}

class Manager implements GovernanceManager {
  constructor(private config: Config) {}

  async createDelegationCertificate(
    drepID: string,
    stakingKey: CardanoTypes.PublicKey,
  ): Promise<CardanoTypes.Certificate> {
    const {Certificate, Ed25519KeyHash, StakeDelegation, StakeCredential} = this.config.cardano

    const credential = await StakeCredential.fromKeyhash(await stakingKey.hash())
    return await Certificate.newStakeDelegation(
      await StakeDelegation.new(credential, await Ed25519KeyHash.fromBytes(Buffer.from(drepID, 'hex'))),
    )
  }

  async validateDRepID(drepId: string): Promise<void> {
    if (drepId.length !== 56) {
      throw new Error('invalid DRep ID length, must be 56 characters')
    }

    if (!/^[0-9a-fA-F]+$/.test(drepId)) {
      throw new Error('invalid DRep ID format, must be hexadecimal')
    }

    if (!(await isRegisteredDrep({networkId: this.config.networkId, client: axiosClient}, drepId))) {
      throw new Error('DRep ID not registered')
    }
  }
}
