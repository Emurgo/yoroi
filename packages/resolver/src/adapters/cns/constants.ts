const preprodCnsPolicyID =
  'baefdc6c5b191be372a794cd8d40d839ec0dbdd3c28957267dc81700'
const preprodRecordPolicyID =
  'a048db3b45c2aa5f1ad472338e6e6dea41a45f4350c8753a231403aa'
const preprodRecordAddress =
  'addr_test1wzzfgjazt5ts34cstrhzaac4xav8x7z2m3vg76s8qmaztzglsw8k5'

// TODO: Change after mainnet launch
const mainnetCnsPolicyID =
  'e0c4c2d7c4a0ed2cf786753fd845dee82c45512cee03e92adfd3fb8d'
const mainnetRecordPolicyID =
  'a1db6026bc00963c1a70af10cdd98f2304be5da44ae4af8f770dcfd3'
const mainnetRecordAddress =
  'addr1z8dyldfnnpg4w85d32lv64f5ldra02juhnzxdvlyyrpfs0leh7ahm4pdpqxx0mc0wvmu6n025jml40g7pfd0j0vf6aqsl2tlcx'

export class CNSConstants {
  network: 'mainnet' | 'preprod'

  networkId: number

  cnsPolicyID: string

  recordPolicyID: string

  recordAddress: string

  baseUrl: string

  constructor(network: 'mainnet' | 'preprod') {
    this.network = network
    this.networkId = network === 'mainnet' ? 1 : 0
    this.cnsPolicyID =
      network === 'mainnet' ? mainnetCnsPolicyID : preprodCnsPolicyID
    this.recordPolicyID =
      network === 'mainnet' ? mainnetRecordPolicyID : preprodRecordPolicyID
    this.recordAddress =
      network === 'mainnet' ? mainnetRecordAddress : preprodRecordAddress
    this.baseUrl =
      network === 'mainnet'
        ? 'https://api.yoroiwallet.com/'
        : 'https://preprod-backend.yoroiwallet.com/'
  }
}
