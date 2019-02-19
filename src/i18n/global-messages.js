import { defineMessages } from 'react-intl';

/*
 * Some messages need to be used in multiple components
 * In order to avoid componenets depending on each other just to resuse translation messages
 * We instead store the shared messages in this file
*/

export default defineMessages({
  walletNameErrorTooLong: {
    id: 'global.error.walletNameTooLong',
    defaultMessage: 'Wallet name cannot exceed 40 letters',
    description: "some desc",
  },
  walletNameErrorNameAlreadyTaken: {
    id: 'global.error.walletNameAlreadyTaken',
    defaultMessage: 'You already have a wallet with this name',
    description: "some desc",
  },
});

export const environmentSpecificMessages = {
  ada: defineMessages({
  }),
};
