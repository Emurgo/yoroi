import {TransactionBody} from './types'

export const adaTransactionSingleReceiver: TransactionBody = {
  inputs: [
    {
      transaction_id: '46fe71d85a733d970fe7bb8e6586624823803936d18c7e14601713d05b5b287a',
      index: 0,
    },
    {
      transaction_id: '9638640d421875f068d10a0125023601bbd7e83e7f17b721c9c06c97cc29ff66',
      index: 1,
    },
  ],
  outputs: [
    {
      address:
        'addr1qyf4x8lvcyrwcxzkyz3lykyzfu7s7x307dlafgsu89qzge8lfl229ahk888cgakug24y86qtduvn065c3gw7dg5002cqdskm74',
      amount: {
        coin: '12000000',
        multiasset: null,
      },
      plutus_data: null,
      script_ref: null,
    },
    {
      address:
        'addr1q9xy5p0cz2zsjrzpg4tl59mltjmfh07yc28alchxjlanygk0ppwv8x4ylafdu84xqmh9sx4vrk4czekksv884xmvanwqde82xg',
      amount: {
        coin: '23464562',
        multiasset: null,
      },
      plutus_data: null,
      script_ref: null,
    },
  ],
  fee: '174345',
  ttl: '220373661',
  certs: null,
  withdrawals: null,
  update: null,
  auxiliary_data_hash: null,
  validity_start_interval: null,
  mint: null,
  script_data_hash: null,
  collateral: null,
  required_signers: null,
  network_id: null,
  collateral_return: null,
  total_collateral: null,
  reference_inputs: null,
  voting_procedures: null,
  voting_proposals: null,
  donation: null,
  current_treasury_value: null,
}

export const multiAssetsOneReceiver: TransactionBody = {
  inputs: [
    {
      transaction_id: '46fe71d85a733d970fe7bb8e6586624823803936d18c7e14601713d05b5b287a',
      index: 0,
    },
    {
      transaction_id: 'bddd3e0b43b9b93f6d49190a9d4d55c3cd28e3d270b0f1bbc0f83b8ecc3e373a',
      index: 1,
    },
  ],
  outputs: [
    {
      address:
        'addr1qyf4x8lvcyrwcxzkyz3lykyzfu7s7x307dlafgsu89qzge8lfl229ahk888cgakug24y86qtduvn065c3gw7dg5002cqdskm74',
      amount: {
        coin: '10000000',
        multiasset: {
          cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a: {
            '43415354': '10',
          },
          f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a: {
            '000de1406a6176696275656e6f': '1',
          },
        },
      },
      plutus_data: null,
      script_ref: null,
    },
    {
      address:
        'addr1q9xy5p0cz2zsjrzpg4tl59mltjmfh07yc28alchxjlanygk0ppwv8x4ylafdu84xqmh9sx4vrk4czekksv884xmvanwqde82xg',
      amount: {
        coin: '2228270',
        multiasset: {
          '2441ab3351c3b80213a98f4e09ddcf7dabe4879c3c94cc4e7205cb63': {
            '46495245': '2531',
          },
          '279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f': {
            '534e454b': '204',
          },
          '4cb48d60d1f7823d1307c61b9ecf472ff78cf22d1ccc5786d59461f8': {
            '4144414d4f4f4e': '4983996',
          },
          a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235: {
            '484f534b59': '115930085',
          },
          cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a: {
            '43415354': '4498',
          },
          e0c4c2d7c4a0ed2cf786753fd845dee82c45512cee03e92adfd3fb8d: {
            '6a6176696275656e6f2e616461': '1',
          },
          fc411f546d01e88a822200243769bbc1e1fbdde8fa0f6c5179934edb: {
            '6a6176696275656e6f': '1',
          },
        },
      },
      plutus_data: null,
      script_ref: null,
    },
    {
      address:
        'addr1q9xy5p0cz2zsjrzpg4tl59mltjmfh07yc28alchxjlanygk0ppwv8x4ylafdu84xqmh9sx4vrk4czekksv884xmvanwqde82xg',
      amount: {
        coin: '2300311',
        multiasset: null,
      },
      plutus_data: null,
      script_ref: null,
    },
  ],
  fee: '189349',
  ttl: '220396208',
  certs: null,
  withdrawals: null,
  update: null,
  auxiliary_data_hash: null,
  validity_start_interval: null,
  mint: null,
  script_data_hash: null,
  collateral: null,
  required_signers: null,
  network_id: null,
  collateral_return: null,
  total_collateral: null,
  reference_inputs: null,
  voting_procedures: null,
  voting_proposals: null,
  donation: null,
  current_treasury_value: null,
}
