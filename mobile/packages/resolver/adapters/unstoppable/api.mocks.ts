export const getCrypoAddress = {
  meta: {
    domain: 'stackchain.blockchain',
    tokenId:
      '5628062919663387899230227759020083743619439687633903328854109212936643864855',
    namehash:
      '0x0c715ee7fb0ff8a168b56d262d106d7a551f7b6f4ca2d690ef2bbd304920e917',
    blockchain: 'MATIC',
    networkId: 137,
    owner: '0x10a242e7900920d8e1a8747abadad38ea2255662',
    resolver: '0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f',
    registry: '0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f',
    reverse: false,
    type: 'Uns',
  },
  records: {
    'crypto.ADA.address':
      'addr1qxvaxrqpvquxzg2pqc093u7zp4mp0n3qdsqlg9a8ecv46e6qgkmm877p949fe53xpjv4lpfn48ew5qawrd0nzc3qd7cqcdlzjp',
  },
} as const

export const handleApiMockResponses = {
  getCrypoAddress,
} as const
