import {
  CatalystAction,
  CatalystActionType,
  catalystDefaultState,
  catalystReducer,
} from './state'

describe('State Actions', () => {
  it('unknown', () => {
    const action = {type: 'UNKNOWN'} as any

    try {
      catalystReducer(catalystDefaultState, action)

      fail('it should crash before')
    } catch (e: any) {
      expect(e.message).toEqual('CatalystReducer invalid action')
    }
  })

  it('PinChanged', () => {
    const action: CatalystAction = {
      type: CatalystActionType.PinChanged,
      pin: '1234',
    }

    const state = catalystReducer(catalystDefaultState, action)
    expect(state.pin).toBe('1234')
  })

  it('VotingKeyEncryptedChanged', () => {
    const votingKeyEncrypted = 'super-complex-voting-key'
    const action: CatalystAction = {
      type: CatalystActionType.VotingKeyEncryptedChanged,
      votingKeyEncrypted,
    }

    const state = catalystReducer(catalystDefaultState, action)
    expect(state.votingKeyEncrypted).toBe(votingKeyEncrypted)
  })

  it('CatalystKeyHexChanged', () => {
    const catalystKeyHex = 'super-complex-hex'
    const action: CatalystAction = {
      type: CatalystActionType.CatalystKeyHexChanged,
      catalystKeyHex,
    }

    const state = catalystReducer(catalystDefaultState, action)
    expect(state.catalystKeyHex).toBe(catalystKeyHex)
  })

  it('Reset', () => {
    const votingKeyEncrypted = 'super-complex-voting-key'
    const catalystKeyHex = 'super-complex-catalyst-key'
    const action: CatalystAction = {
      type: CatalystActionType.Reset,
    }

    const state = catalystReducer(
      {
        ...catalystDefaultState,
        pin: '1234',
        votingKeyEncrypted,
        catalystKeyHex,
      },
      action,
    )
    expect(state.pin).toBe(null)
    expect(state.votingKeyEncrypted).toBe(null)
    expect(state.catalystKeyHex).toBe(null)
  })
})
