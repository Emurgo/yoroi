import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()
  return {
    lockedAsCollateral: intl.formatMessage(messages.lockedAsCollateral),
    removeCollateral: intl.formatMessage(messages.removeCollateral),
    collateralSpent: intl.formatMessage(messages.collateralSpent),
    generateCollateral: intl.formatMessage(messages.generateCollateral),
    notEnoughFundsAlertTitle: intl.formatMessage(messages.notEnoughFundsAlertTitle),
    notEnoughFundsAlertMessage: intl.formatMessage(messages.notEnoughFundsAlertMessage),
    notEnoughFundsAlertOK: intl.formatMessage(messages.notEnoughFundsAlertOK),
  }
}

const messages = defineMessages({
  lockedAsCollateral: {
    id: 'components.settings.collateral.lockedAsCollateral',
    defaultMessage: '!!!Locked as collateral',
  },
  removeCollateral: {
    id: 'components.settings.collateral.removeCollateral',
    defaultMessage: '!!!If you want to return the amount locked as collateral to your balance press the remove icon',
  },
  collateralSpent: {
    id: 'components.settings.collateral.collateralSpent',
    defaultMessage: '!!!Your collateral is gone, please generate new collateral',
  },
  generateCollateral: {
    id: 'components.settings.collateral.generateCollateral',
    defaultMessage: '!!!Generate collateral',
  },
  notEnoughFundsAlertTitle: {
    id: 'components.settings.collateral.notEnoughFundsAlertTitle',
    defaultMessage: '!!!Not enough funds',
  },
  notEnoughFundsAlertMessage: {
    id: 'components.settings.collateral.notEnoughFundsAlertMessage',
    defaultMessage: '!!!We could not find enough funds in this wallet to create collateral.',
  },
  notEnoughFundsAlertOK: {
    id: 'components.settings.collateral.notEnoughFundsAlertOK',
    defaultMessage: '!!!OK',
  },
})
