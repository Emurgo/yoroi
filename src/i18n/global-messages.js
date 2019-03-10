// @flow

import {defineMessages} from 'react-intl'

/*
 * Some messages need to be used in multiple components
 * In order to avoid componenets depending on each other just to resuse translation messages
 * We instead store the shared messages in this file
*/

export const confirmationMessages = {
  logout: defineMessages({
    title: {
      id: 'global.actions.dialogs.logout.title',
      defaultMessage: '!!!Logout',
    },
    message: {
      id: 'global.actions.dialogs.logout.message',
      defaultMessage: '!!!Do you really want to logout?',
    },
    yesButton: {
      id: 'global.actions.dialogs.logout.yesButton',
      defaultMessage: '!!!Yes',
    },
    noButton: {
      id: 'global.actions.dialogs.logout.noButton',
      defaultMessage: '!!!No',
    },
  })
}

export default defineMessages({
  walletNameErrorTooLong: {
    id: 'global.error.walletNameTooLong',
    defaultMessage: 'Wallet name cannot exceed 40 letters',
  },
  walletNameErrorNameAlreadyTaken: {
    id: 'global.error.walletNameAlreadyTaken',
    defaultMessage: 'You already have a wallet with this name',
  },
  pleaseWait: {
    id: 'global.pleaseWait',
    defaultMessage: '!!!please wait ...',
    description: 'Common messages for time consuming actions',
  },
  tos: {
    id: 'global.termsOfUse',
    defaultMessage: '!!!Terms of use',
  },
  availableFunds: {
    id: 'global.availableFunds',
    defaultMessage: '!!!Available funds',
  },
});

export const environmentSpecificMessages = {
  ada: defineMessages({
  }),
};
