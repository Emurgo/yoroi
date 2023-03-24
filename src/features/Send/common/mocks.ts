import {initialState} from './SendContext'

export const mocks = {
  startTx: {
    error: {
      invalidAddress: {
        ...initialState,
        targets: [
          {
            ...initialState.targets[0],
            receiver: 'invalid_address',
            entry: {
              ...initialState.targets[0].entry,
              address: 'invalid_address',
            },
          },
        ],
      },
      memoTooLong: {
        ...initialState,
        memo: new Array(500).fill('a').join(''),
      },
    },
    loading: {
      resolveReceiver: {
        ...initialState,
        targets: [
          {
            ...initialState.targets[0],
            receiver: 'x.com',
            entry: {
              ...initialState.targets[0].entry,
            },
          },
        ],
      },
    },
  },
}
