import {CardanoMobile} from '../../wallets'
import {getSpendingKey, getStakingKey, toWasmAddress} from './addressInfo'

// base
const shelley_mainnet_type0_address =
  'addr1q9ndnrwz52yeex4j04kggp0ul5632qmxqx22ugtukkytjysw86pdygc6zarl2kks6fvg8um447uvv679sfdtzkwf2kuq673wke'
const shelley_mainnet_type0_addressKeyHashes = {
  spending: '66d98dc2a2899c9ab27d6c8405fcfd351503660194ae217cb588b912',
  staking: '0e3e82d2231a1747f55ad0d25883f375afb8c66bc5825ab159c955b8',
}
const shelley_testnet_type0_address =
  'addr_test1qpfn8e903n5eqsplral59lhrvyud9g50mmceqeezhnfpr3aytuevw54ze6zh8cgk8vld0m7cumkttye5wc44ad04s29sm2lmry'
const shelley_testnet_type0_addressKeyHashes = {
  spending: '5333e4af8ce990403f1f7f42fee36138d2a28fdef1906722bcd211c7',
  staking: 'a45f32c752a2ce8573e1163b3ed7efd8e6ecb59334762b5eb5f5828b',
}

// enterprise
const shelley_mainnet_type6_address = 'addr1vyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6lgpnh5ft'
const shelley_mainnet_type6_addressKeyHashes = {
  spending: '',
  staking: '',
}

// reward
const reward_mainnet_address = 'stake1u948jr02falxxqphnv3g3rkd3mdzqmtqq3x0tjl39m7dqngqg0fxp'
const reward_mainnet_addressKeyHashes = {
  spending: '6a790dea4f7e6300379b22888ecd8eda206d60044cf5cbf12efcd04d',
  staking: '',
}
const reward_testnet_address = 'stake_test1uq3ejar8nmvc2xnxn4frrhw8myggfa2g5jlpsfj0c3mh84cwvmp2w'
const reward_testnet_addressKeyHashes = {
  spending: '239974679ed9851a669d5231ddc7d91084f548a4be18264fc47773d7',
  staking: '',
}

// byron
const byron_testnet_address = '2cWKMJemoBaiMAyuzsGqrau1e6Rpeu4zVPzFcXvu4NPHfZhhDeyxznT1jnujyJnJA4bK5'
const byron_mainnet_address = 'Ae2tdPwUPEZ9uHfzhw3vXUrTFLowct5hMMHeNjfsrkQv5XSi5PhSs2yRNUb'

// jor
const jorgamndur_testnet = 'ta1svy0mwwm7mdwcuj308aapjw6ra4c3e6cygd0f333nvtjzxg8ahdvxlswdf0'
const jorgamndur_mainnet = '1q5smgquwzdh4eyc77gf6ddxp2atz8ej3rt94nt6l0qes0vexf5g4cw68kdx'

const emptyKeyHashes = {
  spending: null,
  staking: null,
}

describe('toWasmAddress', () => {
  it.each`
    desc                             | address                          | expected
    ${'shelley mainnet BaseAddress'} | ${shelley_mainnet_type0_address} | ${CardanoMobile.Address}
    ${'shelley testnet BaseAddress'} | ${shelley_testnet_type0_address} | ${CardanoMobile.Address}
    ${'shelley mainnet Enterprise'}  | ${shelley_mainnet_type6_address} | ${CardanoMobile.Address}
  `('$desc', async ({address, expected}) => {
    const result = await toWasmAddress(address)
    expect(result).toBeInstanceOf(expected)
  })

  it.each`
    desc                    | address                  | expected
    ${'byron mainnet'}      | ${byron_mainnet_address} | ${null}
    ${'byron testnet'}      | ${byron_testnet_address} | ${null}
    ${'jorgmandur testnet'} | ${jorgamndur_testnet}    | ${null}
    ${'jorgmandur mainnet'} | ${jorgamndur_mainnet}    | ${null}
  `('$desc', async ({address, expected}) => {
    const result = await toWasmAddress(address)
    expect(result).toBe(expected)
  })
})

describe('getKeyHashes', () => {
  it.each`
    desc                               | address                          | expected
    ${'shelley mainnet BaseAddress'}   | ${shelley_mainnet_type0_address} | ${shelley_mainnet_type0_addressKeyHashes}
    ${'shelley testnet BaseAddress'}   | ${shelley_testnet_type0_address} | ${shelley_testnet_type0_addressKeyHashes}
    ${'shelley mainnet Enterprise'}    | ${shelley_mainnet_type6_address} | ${shelley_mainnet_type6_addressKeyHashes}
    ${'byron mainnet'}                 | ${byron_mainnet_address}         | ${emptyKeyHashes}
    ${'byron testnet'}                 | ${byron_testnet_address}         | ${emptyKeyHashes}
    ${'jorgmandur testnet'}            | ${jorgamndur_testnet}            | ${emptyKeyHashes}
    ${'jorgmandur mainnet'}            | ${jorgamndur_mainnet}            | ${emptyKeyHashes}
    ${'shelley mainnet RewardAddress'} | ${reward_mainnet_address}        | ${reward_mainnet_addressKeyHashes}
    ${'shelley testnet RewardAddress'} | ${reward_testnet_address}        | ${reward_testnet_addressKeyHashes}
  `('$desc', async ({address, expected}) => {
    const result = {
      spending: await getSpendingKey(address),
      staking: await getStakingKey(address),
    }
    expect(result).toEqual(expected)
  })
})
