import {defineMessages, useIntl} from 'react-intl'

import globalMessages from '../../../../../kernel/i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return {
    networkNoticeTitle: intl.formatMessage(messages.networkNoticeTitle),
    networkNoticeMessage: intl.formatMessage(messages.networkNoticeMessage),
    networkNoticeListTitle: intl.formatMessage(messages.networkNoticeListTitle),
    networkNoticeList: intl.formatMessage(messages.networkNoticeList),
    networkNoticeButton: intl.formatMessage(messages.networkNoticeButton),
    preparingNetwork: intl.formatMessage(messages.preparingNetwork),
    networkTagModalTitle: intl.formatMessage(messages.networkTagModalTitle),
    networkTagModalText: intl.formatMessage(messages.networkTagModalText),
    cancel: intl.formatMessage(globalMessages.cancel),
    switch: intl.formatMessage(globalMessages.switch),
  }
}

const messages = defineMessages({
  networkNoticeTitle: {
    id: 'components.settings.applicationsettingsscreen.network.notice.title',
    defaultMessage: '!!!What are the test networks?',
  },
  networkNoticeMessage: {
    id: 'components.settings.applicationsettingsscreen.network.notice.message',
    defaultMessage:
      '!!!The test networks serve as a platform for the community and developers to test products and experiments without risking real funds on the mainnet.',
  },
  networkNoticeListTitle: {
    id: 'components.settings.applicationsettingsscreen.network.notice.listTitle',
    defaultMessage: '!!!Key features of testnet coins:',
  },
  networkNoticeList: {
    id: 'components.settings.applicationsettingsscreen.network.notice.list',
    defaultMessage:
      '!!!  •  Have no real value.\n  •  Are separate from the mainnet.\n  •  Cannot be sent to mainnet wallets.\n  •  Are easily obtainable from Cardano faucets.',
  },
  preparingNetwork: {
    id: 'components.settings.applicationsettingsscreen.network.preparingNetworks',
    defaultMessage: '!!!Preparing network...',
  },
  networkNoticeButton: {
    id: 'components.settings.applicationsettingsscreen.network.notice.button',
    defaultMessage: '!!!I understand',
  },
  networkTagModalTitle: {
    id: 'components.settings.applicationsettingsscreen.network.tag.modal.title',
    defaultMessage: '!!!Switch to Mainnet',
  },
  networkTagModalText: {
    id: 'components.settings.applicationsettingsscreen.network.tag.modal.text',
    defaultMessage: '!!!Are you sure you want to switch back to the main Cardano Network?',
  },
})
