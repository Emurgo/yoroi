import {Chain, Links, Resolver} from '@yoroi/types'
import {
  TargetAction,
  TransferAction,
  TransferActionType,
  TransferState,
  combinedReducers,
  defaultTransferState,
} from './state'
import {tokenBalanceMocks} from '@yoroi/portfolio'

describe('State Actions', () => {
  it('unknown', () => {
    const action = {type: 'UNKNOWN'} as any
    const state = combinedReducers(defaultTransferState, action)
    expect(state).toEqual(defaultTransferState)
  })

  describe('Transfer Actions', () => {
    describe('UnsignedTxChanged', () => {
      it('set', () => {
        const action: TransferAction = {
          type: TransferActionType.UnsignedTxChanged,
          unsignedTx,
        }
        const state = combinedReducers(defaultTransferState, action)
        expect(state).toEqual({...defaultTransferState, unsignedTx})
      })

      it('reset', () => {
        const action: TransferAction = {
          type: TransferActionType.UnsignedTxChanged,
          unsignedTx: undefined,
        }
        const state = combinedReducers(
          {...defaultTransferState, unsignedTx},
          action,
        )
        expect(state).toEqual(defaultTransferState)
      })
    })

    describe('MemoChanged', () => {
      it('set', () => {
        const action: TransferAction = {
          type: TransferActionType.MemoChanged,
          memo: 'akakakak',
        }
        const state = combinedReducers(defaultTransferState, action)
        expect(state).toEqual({...defaultTransferState, memo: 'akakakak'})
      })
    })

    describe('LinkActionChanged', () => {
      it('set', () => {
        const linkAction: Links.YoroiAction = {
          info: {
            version: 1,
            feature: 'transfer',
            useCase: 'request/ada-with-link',
            params: {
              link: 'web+cardano:addr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh?amount=10',
              authorization: 'uuid-v4',
            },
          },
          isTrusted: false,
        }
        const action: TransferAction = {
          type: TransferActionType.LinkActionChanged,
          linkAction,
        }
        const state = combinedReducers(defaultTransferState, action)
        expect(state).toEqual({
          ...defaultTransferState,
          linkAction,
        })
      })
    })

    describe('TokenSelectedChanged', () => {
      it('set', () => {
        const action: TransferAction = {
          type: TransferActionType.TokenSelectedChanged,
          tokenId: 'policyId.tokenName',
        }
        const state = combinedReducers(defaultTransferState, action)
        expect(state).toEqual({
          ...defaultTransferState,
          selectedTokenId: 'policyId.tokenName',
        })
      })
    })

    describe('Reset', () => {
      const mockedState: TransferState = {
        ...defaultTransferState,
        selectedTokenId: 'policyId.tokenName',
        unsignedTx,
        memo: 'asdfgh',
      }

      it('set', () => {
        const action: TransferAction = {
          type: TransferActionType.Reset,
        }
        const state = combinedReducers(mockedState, action)
        expect(state).toEqual(defaultTransferState)
      })
    })
  })

  describe('Target Actions', () => {
    describe('ReceiverResolveChanged', () => {
      const prevState: TransferState = {
        selectedTargetIndex: 0,
        selectedTokenId: '.',
        unsignedTx: undefined,
        memo: '',
        linkAction: undefined,
        targets: [
          {
            receiver: {
              resolve: '',
              as: 'address',
              selectedNameServer: undefined,
              addressRecords: undefined,
            },
            entry: {
              address: '',
              amounts: {},
            },
          },
          {
            receiver: {
              resolve: 'address2',
              as: 'address',
              addressRecords: undefined,
              selectedNameServer: undefined,
            },
            entry: {
              address: 'address2',
              amounts: {},
            },
          },
        ],
      }

      it('set address', () => {
        const action: TargetAction = {
          type: TransferActionType.ReceiverResolveChanged,
          resolve: 'address',
        }

        const state = combinedReducers(prevState, action)
        expect(state).toEqual({
          selectedTargetIndex: 0,
          selectedTokenId: '.',
          memo: '',
          unsignedTx: undefined,
          linkAction: undefined,
          targets: [
            {
              receiver: {
                resolve: 'address',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address',
                amounts: {},
              },
            },
            {
              receiver: {
                resolve: 'address2',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address2',
                amounts: {},
              },
            },
          ],
        })
      })

      it('set domain', () => {
        const action: TargetAction = {
          type: TransferActionType.ReceiverResolveChanged,
          resolve: 'test.ada',
        }

        const state = combinedReducers(prevState, action)
        expect(state).toEqual({
          selectedTargetIndex: 0,
          selectedTokenId: '.',
          memo: '',
          unsignedTx: undefined,
          targets: [
            {
              receiver: {
                resolve: 'test.ada',
                as: 'domain',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: '',
                amounts: {},
              },
            },
            {
              receiver: {
                resolve: 'address2',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address2',
                amounts: {},
              },
            },
          ],
        })
      })
    })

    describe('AddressRecordsFetched', () => {
      const prevState: TransferState = {
        selectedTargetIndex: 0,
        selectedTokenId: '.',
        unsignedTx: undefined,
        linkAction: undefined,
        memo: '',
        targets: [
          {
            receiver: {
              resolve: '',
              as: 'address',
              selectedNameServer: undefined,
              addressRecords: undefined,
            },
            entry: {
              address: '',
              amounts: {},
            },
          },
          {
            receiver: {
              resolve: 'address2',
              as: 'address',
              addressRecords: undefined,
              selectedNameServer: undefined,
            },
            entry: {
              address: 'address2',
              amounts: {},
            },
          },
        ],
      }

      it('set: one record', () => {
        const action: TargetAction = {
          type: TransferActionType.AddressRecordsFetched,
          addressRecords: {
            [Resolver.NameServer.Cns]:
              'addr1qxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
          },
        }

        const state = combinedReducers(prevState, action)

        expect(state).toEqual({
          selectedTargetIndex: 0,
          selectedTokenId: '.',
          memo: '',
          unsignedTx: undefined,
          linkAction: undefined,
          targets: [
            {
              receiver: {
                resolve: '',
                as: 'address',
                selectedNameServer: 'cns',
                addressRecords: {
                  cns: 'addr1qxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
                },
              },
              entry: {
                address:
                  'addr1qxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
                amounts: {},
              },
            },
            {
              receiver: {
                resolve: 'address2',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address2',
                amounts: {},
              },
            },
          ],
        })
      })

      it('set: multi record', () => {
        const action: TargetAction = {
          type: TransferActionType.AddressRecordsFetched,
          addressRecords: {
            [Resolver.NameServer.Cns]:
              'addr1qxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
            [Resolver.NameServer.Unstoppable]:
              'addr1qxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
          },
        }

        const state = combinedReducers(prevState, action)

        expect(state).toEqual({
          selectedTargetIndex: 0,
          selectedTokenId: '.',
          memo: '',
          unsignedTx: undefined,
          linkAction: undefined,
          targets: [
            {
              receiver: {
                resolve: '',
                as: 'address',
                selectedNameServer: undefined,
                addressRecords: {
                  cns: 'addr1qxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
                  unstoppable:
                    'addr1qxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
                },
              },
              entry: {
                address: '',
                amounts: {},
              },
            },
            {
              receiver: {
                resolve: 'address2',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address2',
                amounts: {},
              },
            },
          ],
        })
      })

      it('set: undefined', () => {
        const action: TargetAction = {
          type: TransferActionType.AddressRecordsFetched,
          addressRecords: undefined,
        }

        const state = combinedReducers(prevState, action)

        expect(state).toEqual({
          selectedTargetIndex: 0,
          selectedTokenId: '.',
          memo: '',
          unsignedTx: undefined,
          linkAction: undefined,
          targets: [
            {
              receiver: {
                resolve: '',
                as: 'address',
                selectedNameServer: undefined,
                addressRecords: undefined,
              },
              entry: {
                address: '',
                amounts: {},
              },
            },
            {
              receiver: {
                resolve: 'address2',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address2',
                amounts: {},
              },
            },
          ],
        })
      })

      it('set: bad record', () => {
        const action: TargetAction = {
          type: TransferActionType.AddressRecordsFetched,
          addressRecords: {
            [Resolver.NameServer.Cns]: undefined,
          },
        }

        const state = combinedReducers(prevState, action)

        expect(state).toEqual({
          selectedTargetIndex: 0,
          selectedTokenId: '.',
          memo: '',
          unsignedTx: undefined,
          linkAction: undefined,
          targets: [
            {
              receiver: {
                resolve: '',
                as: 'address',
                selectedNameServer: 'cns',
                addressRecords: {
                  cns: undefined,
                },
              },
              entry: {
                address: '',
                amounts: {},
              },
            },
            {
              receiver: {
                resolve: 'address2',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address2',
                amounts: {},
              },
            },
          ],
        })
      })
    })

    describe('NameServerSelectedChanged', () => {
      const prevState: TransferState = {
        selectedTargetIndex: 0,
        selectedTokenId: '.',
        unsignedTx: undefined,
        linkAction: undefined,
        memo: '',
        targets: [
          {
            receiver: {
              resolve: '',
              as: 'address',
              selectedNameServer: undefined,
              addressRecords: undefined,
            },
            entry: {
              address: '',
              amounts: {},
            },
          },
          {
            receiver: {
              resolve: 'address2',
              as: 'address',
              addressRecords: undefined,
              selectedNameServer: undefined,
            },
            entry: {
              address: 'address2',
              amounts: {},
            },
          },
        ],
      }
      it('set', () => {
        const action: TargetAction = {
          type: TransferActionType.NameServerSelectedChanged,
          nameServer: Resolver.NameServer.Cns,
        }

        const state = combinedReducers(prevState, action)

        expect(state).toEqual({
          selectedTargetIndex: 0,
          selectedTokenId: '.',
          memo: '',
          targets: [
            {
              receiver: {
                resolve: '',
                as: 'address',
                selectedNameServer: 'cns',
              },
              entry: {
                address: '',
                amounts: {},
              },
            },
            {
              receiver: {
                resolve: 'address2',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address2',
                amounts: {},
              },
            },
          ],
        })
      })

      it('set: undefined', () => {
        const action: TargetAction = {
          type: TransferActionType.NameServerSelectedChanged,
          nameServer: undefined,
        }

        const state = combinedReducers(prevState, action)

        expect(state).toEqual({
          selectedTargetIndex: 0,
          selectedTokenId: '.',
          memo: '',
          unsignedTx: undefined,
          targets: [
            {
              receiver: {
                resolve: '',
                as: 'address',
                selectedNameServer: undefined,
              },
              entry: {
                address: '',
                amounts: {},
              },
            },
            {
              receiver: {
                resolve: 'address2',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address2',
                amounts: {},
              },
            },
          ],
        })
      })

      it('set: domain', () => {
        const action: TargetAction = {
          type: TransferActionType.NameServerSelectedChanged,
          nameServer: undefined,
        }

        const prevState_: TransferState = {
          selectedTargetIndex: 0,
          selectedTokenId: '.',
          unsignedTx: undefined,
          linkAction: undefined,
          memo: '',
          targets: [
            {
              receiver: {
                resolve: '',
                as: 'domain',
                selectedNameServer: undefined,
                addressRecords: undefined,
              },
              entry: {
                address: '',
                amounts: {},
              },
            },
          ],
        }

        const state = combinedReducers(prevState_, action)

        expect(state).toEqual({
          selectedTargetIndex: 0,
          selectedTokenId: '.',
          memo: '',
          unsignedTx: undefined,
          linkAction: undefined,
          targets: [
            {
              receiver: {
                resolve: '',
                as: 'domain',
                selectedNameServer: undefined,
              },
              entry: {
                address: '',
                amounts: {},
              },
            },
          ],
        })
      })
    })

    describe('AmountChanged', () => {
      it('set', () => {
        const action: TargetAction = {
          type: TransferActionType.AmountChanged,
          amount: {
            info: tokenBalanceMocks.primaryETH.info,
            quantity: 12344n,
          },
        }

        const prevState: TransferState = {
          selectedTargetIndex: 0,
          selectedTokenId: tokenBalanceMocks.primaryETH.info.id,
          memo: '',
          unsignedTx: undefined,
          linkAction: undefined,
          targets: [
            {
              receiver: {
                resolve: '',
                as: 'address',
                selectedNameServer: undefined,
                addressRecords: undefined,
              },
              entry: {
                address: '',
                amounts: {
                  [tokenBalanceMocks.primaryETH.info.id]:
                    tokenBalanceMocks.primaryETH,
                },
              },
            },
            {
              receiver: {
                resolve: 'address2',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address2',
                amounts: {},
              },
            },
          ],
        }

        const state = combinedReducers(prevState, action)

        expect(state).toEqual<TransferState>({
          selectedTargetIndex: 0,
          selectedTokenId: tokenBalanceMocks.primaryETH.info.id,
          unsignedTx: undefined,
          linkAction: undefined,
          memo: '',
          targets: [
            {
              receiver: {
                resolve: '',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: '',
                amounts: {
                  [tokenBalanceMocks.primaryETH.info.id]: {
                    info: tokenBalanceMocks.primaryETH.info,
                    quantity: 12344n,
                  },
                },
              },
            },
            {
              receiver: {
                resolve: 'address2',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address2',
                amounts: {},
              },
            },
          ],
        })
      })
    })

    describe('AmountRemoved', () => {
      it('set', () => {
        const action: TargetAction = {
          type: TransferActionType.AmountRemoved,
          tokenId: tokenBalanceMocks.primaryETH.info.id,
        }

        const prevState: TransferState = {
          selectedTargetIndex: 0,
          selectedTokenId: tokenBalanceMocks.primaryETH.info.id,
          memo: '',
          unsignedTx: undefined,
          linkAction: undefined,
          targets: [
            {
              receiver: {
                resolve: '',
                as: 'address',
                selectedNameServer: undefined,
                addressRecords: undefined,
              },
              entry: {
                address: '',
                amounts: {
                  [tokenBalanceMocks.primaryETH.info.id]:
                    tokenBalanceMocks.primaryETH,
                },
              },
            },
            {
              receiver: {
                resolve: 'address2',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address2',
                amounts: {},
              },
            },
          ],
        }

        const state = combinedReducers(prevState, action)

        expect(state).toEqual({
          selectedTargetIndex: 0,
          selectedTokenId: tokenBalanceMocks.primaryETH.info.id,
          memo: '',
          unsignedTx: undefined,
          redirectTo: undefined,
          targets: [
            {
              receiver: {
                resolve: '',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: '',
                amounts: {},
              },
            },
            {
              receiver: {
                resolve: 'address2',
                as: 'address',
                addressRecords: undefined,
                selectedNameServer: undefined,
              },
              entry: {
                address: 'address2',
                amounts: {},
              },
            },
          ],
        })
      })
    })
  })
})

const unsignedTx: Chain.Cardano.UnsignedTx & {mock: true} = {
  entries: [
    {
      address: 'address1',
      amounts: {
        [tokenBalanceMocks.primaryETH.info.id]: tokenBalanceMocks.primaryETH,
      },
    },
  ],
  fee: {'.': '12345'},
  metadata: {},
  change: [
    {
      address: 'change_address',
      amounts: {
        [tokenBalanceMocks.primaryETH.info.id]: tokenBalanceMocks.primaryETH,
      },
    },
  ],
  staking: {
    registrations: [],
    deregistrations: [],
    delegations: [],
    withdrawals: [],
  },
  voting: {},
  unsignedTx: {} as any,
  mock: true,
  governance: false,
}
