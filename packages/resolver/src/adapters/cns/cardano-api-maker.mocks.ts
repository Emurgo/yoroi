import {AssetInlineDatumResponse, CnsCardanoApi} from './cardano-api-maker'

export const success: CnsCardanoApi = {
  getMetadata: jest.fn(() => Promise.resolve(metadataMock)),
  getAssetAddress: jest.fn(() =>
    Promise.resolve(
      'addr1qxjkgj7t3nvzkhsyOpjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jg|32t|lqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
    ),
  ),
  getAssetInlineDatum: jest.fn(() =>
    Promise.resolve(inlineDatumMock[0]?.inline_datum.plutus_data),
  ),
}

export const disabled: CnsCardanoApi = {
  getMetadata: jest.fn(() => Promise.resolve(disabledMetadataMock)),
  getAssetAddress: jest.fn(() =>
    Promise.resolve(
      'addr1qxjkgj7t3nvzkhsyOpjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jg|32t|lqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
    ),
  ),
  getAssetInlineDatum: jest.fn(() =>
    Promise.resolve(inlineDatumMock[0]?.inline_datum.plutus_data),
  ),
}

export const noMetadata: CnsCardanoApi = {
  getMetadata: jest.fn(() => Promise.resolve(undefined)),
  getAssetAddress: jest.fn(() =>
    Promise.resolve(
      'addr1qxjkgj7t3nvzkhsyOpjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jg|32t|lqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
    ),
  ),
  getAssetInlineDatum: jest.fn(() =>
    Promise.resolve(inlineDatumMock[0]?.inline_datum.plutus_data),
  ),
}

export const noAddress: CnsCardanoApi = {
  getMetadata: jest.fn(() => Promise.resolve(metadataMock)),
  getAssetAddress: jest.fn(() => Promise.resolve(undefined)),
  getAssetInlineDatum: jest.fn(() =>
    Promise.resolve(inlineDatumMock[0]?.inline_datum.plutus_data),
  ),
}

export const noInlineDatum: CnsCardanoApi = {
  getMetadata: jest.fn(() => Promise.resolve(metadataMock)),
  getAssetAddress: jest.fn(() =>
    Promise.resolve(
      'addr1qxjkgj7t3nvzkhsyOpjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jg|32t|lqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
    ),
  ),
  getAssetInlineDatum: jest.fn(() => Promise.resolve(undefined)),
}

export const expiredDomain: CnsCardanoApi = {
  getMetadata: jest.fn(() => Promise.resolve(expiredMetadataMock)),
  getAssetAddress: jest.fn(() =>
    Promise.resolve(
      'addr1qxjkgj7t3nvzkhsyOpjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jg|32t|lqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
    ),
  ),
  getAssetInlineDatum: jest.fn(() => Promise.resolve(undefined)),
}

export const badInlineDatum: CnsCardanoApi = {
  getMetadata: jest.fn(() => Promise.resolve(metadataMock)),
  getAssetAddress: jest.fn(() =>
    Promise.resolve(
      'addr1qxjkgj7t3nvzkhsyOpjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jg|32t|lqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
    ),
  ),
  // @ts-ignore
  getAssetInlineDatum: jest.fn(() =>
    Promise.resolve(badConstructorInlineDatumMock[0]?.inline_datum.plutus_data),
  ),
}

export const metadataMock = {
  cnsType: 'Rare',
  description: 'CNS, the digital social identity on Cardano.',
  expiry: 4854124800000,
  image: 'ipfs://QmTLqWhxjFUh3RtVq3GXoBtaCQxsNoLEGHGHhmnfn4mz5Z',
  mediaType: 'image/jpeg',
  name: '26.ada',
  origin: 'Cardano Name Service',
  virtualSubdomainEnabled: 'Enabled',
  virtualSubdomainLimits: 5,
}

export const expiredMetadataMock = {
  cnsType: 'Rare',
  description: 'CNS, the digital social identity on Cardano.',
  expiry: 1672757481000,
  image: 'ipfs://QmTLqWhxjFUh3RtVq3GXoBtaCQxsNoLEGHGHhmnfn4mz5Z',
  mediaType: 'image/jpeg',
  name: '26.ada',
  origin: 'Cardano Name Service',
  virtualSubdomainEnabled: 'Enabled',
  virtualSubdomainLimits: 5,
}

export const disabledMetadataMock = {
  cnsType: 'Rare',
  description: 'CNS, the digital social identity on Cardano.',
  expiry: 4854124800000,
  image: 'ipfs://QmTLqWhxjFUh3RtVq3GXoBtaCQxsNoLEGHGHhmnfn4mz5Z',
  mediaType: 'image/jpeg',
  name: '26.ada',
  origin: 'Cardano Name Service',
  virtualSubdomainEnabled: 'Disabled',
  virtualSubdomainLimits: 5,
}

export const inlineDatumMock: AssetInlineDatumResponse = [
  {
    inline_datum: {
      plutus_data: {
        constructor: 0,
        fields: [
          {
            map: [
              {
                k: {bytes: '72696365'},
                v: {
                  constructor: 0,
                  fields: [
                    {
                      constructor: 0,
                      fields: [
                        {
                          bytes:
                            'a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84',
                        },
                      ],
                    },
                    {
                      constructor: 0,
                      fields: [
                        {
                          constructor: 0,
                          fields: [
                            {
                              constructor: 0,
                              fields: [
                                {
                                  bytes:
                                    'e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                k: {bytes: '616161'},
                v: {
                  constructor: 0,
                  fields: [
                    {
                      constructor: 0,
                      fields: [
                        {
                          bytes:
                            'a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84',
                        },
                      ],
                    },
                    {
                      constructor: 0,
                      fields: [
                        {
                          constructor: 0,
                          fields: [
                            {
                              constructor: 0,
                              fields: [
                                {
                                  bytes:
                                    'e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          {
            map: [
              {
                k: {bytes: '54454c454752414d'},
                v: {bytes: '6f6e636f77636f776f6e39'},
              },
            ],
          },
          {map: []},
        ],
      },
    },
  },
]

export const badConstructorInlineDatumMock: AssetInlineDatumResponse = [
  {
    inline_datum: {
      plutus_data: {
        // @ts-ignore
        constructor: 1,
        fields: [
          {
            map: [
              {
                k: {bytes: '72696365'},
                v: {
                  constructor: 0,
                  fields: [
                    {
                      constructor: 0,
                      fields: [
                        {
                          bytes:
                            'a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84',
                        },
                      ],
                    },
                    {
                      constructor: 0,
                      fields: [
                        {
                          constructor: 0,
                          fields: [
                            {
                              constructor: 0,
                              fields: [
                                {
                                  bytes:
                                    'e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                k: {bytes: '616161'},
                v: {
                  constructor: 0,
                  fields: [
                    {
                      constructor: 0,
                      fields: [
                        {
                          bytes:
                            'a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84',
                        },
                      ],
                    },
                    {
                      constructor: 0,
                      fields: [
                        {
                          constructor: 0,
                          fields: [
                            {
                              constructor: 0,
                              fields: [
                                {
                                  bytes:
                                    'e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          {
            map: [
              {
                k: {bytes: '54454c454752414d'},
                v: {bytes: '6f6e636f77636f776f6e39'},
              },
            ],
          },
          {map: []},
        ],
      },
    },
  },
]

export const badFieldsInlineDatumMock: AssetInlineDatumResponse = [
  {
    inline_datum: {
      plutus_data: {
        constructor: 0,
        fields: [
          {
            map: [
              {
                k: {bytes: '72696365'},
                v: {
                  constructor: 0,
                  fields: [
                    {
                      constructor: 0,
                      fields: [
                        {
                          bytes:
                            'a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84',
                        },
                      ],
                    },
                    {
                      constructor: 0,
                      fields: [
                        {
                          constructor: 0,
                          fields: [
                            {
                              constructor: 0,
                              fields: [
                                {
                                  bytes:
                                    'e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                k: {bytes: '616161'},
                v: {
                  constructor: 0,
                  fields: [
                    {
                      constructor: 0,
                      fields: [
                        {
                          bytes:
                            'a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84',
                        },
                      ],
                    },
                    {
                      constructor: 0,
                      fields: [
                        {
                          constructor: 0,
                          fields: [
                            {
                              constructor: 0,
                              fields: [
                                {
                                  bytes:
                                    'e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          {
            map: [
              {
                k: {bytes: '72696365'},
                v: {
                  // @ts-ignore
                  constructor: 0,
                  fields: [
                    {
                      constructor: 0,
                      fields: [
                        {
                          bytes:
                            'a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84',
                        },
                      ],
                    },
                    {
                      constructor: 0,
                      fields: [
                        {
                          constructor: 0,
                          fields: [
                            {
                              constructor: 0,
                              fields: [
                                {
                                  bytes:
                                    'e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                k: {bytes: '616161'},
                v: {
                  // @ts-ignore
                  constructor: 0,
                  fields: [
                    {
                      constructor: 0,
                      fields: [
                        {
                          bytes:
                            'a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84',
                        },
                      ],
                    },
                    {
                      constructor: 0,
                      fields: [
                        {
                          constructor: 0,
                          fields: [
                            {
                              constructor: 0,
                              fields: [
                                {
                                  bytes:
                                    'e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          {
            map: [
              {
                k: {bytes: '54454c454752414d'},
                v: {bytes: '6f6e636f77636f776f6e39'},
              },
            ],
          },
          {map: []},
        ],
      },
    },
  },
]

const parsedInlineDatum = {
  virtualSubdomains: [
    [
      'rice',
      'addr1qxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
    ],
    [
      'aaa',
      'addr1qxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
    ],
  ],
}

export const cnsCardanoApiMock = {
  success,
  disabled,
  noMetadata,
  noAddress,
  noInlineDatum,
  parsedInlineDatum,
  expiredDomain,
  badInlineDatum,
  inlineDatumMock,
  badConstructorInlineDatumMock,
  badFieldsInlineDatumMock,
  metadataMock,
  expiredMetadataMock,
  disabledMetadataMock,
}
