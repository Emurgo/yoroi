import {getWalletConnectorJS} from './index'

describe('DappConnector', () => {
  it('should be tested', () => {
    expect(
      getWalletConnectorJS({
        iconUrl: 'iconUrl',
        apiVersion: 'apiVersion',
        walletName: 'walletName',
        supportedExtensions: [{cip: 1}],
        sessionId: 'sessionId',
      }),
    ).toBeTruthy()
  })
})
