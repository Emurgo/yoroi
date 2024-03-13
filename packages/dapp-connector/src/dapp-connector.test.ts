import {getWalletConnectorJS} from './index'

describe('DappConnector', () => {
  it('should be tested', () => {
    expect(
      getWalletConnectorJS({
        iconUrl: 'iconUrl',
        apiVersion: 'apiVersion',
        walletName: 'walletName',
        sessionId: 'sessionId',
      }),
    ).toBeTruthy()
  })
})
