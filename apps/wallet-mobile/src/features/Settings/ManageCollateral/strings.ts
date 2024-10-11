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
    collateralInfoModalLabel: intl.formatMessage(messages.collateralInfoModalLabel),
    collateralInfoModalTitle: intl.formatMessage(messages.collateralInfoModalTitle),
    collateralInfoModalText: intl.formatMessage(messages.collateralInfoModalText),
    initialCollateralInfoModalTitle: intl.formatMessage(messages.initialCollateralInfoModalTitle),
    initialCollateralInfoModalText: intl.formatMessage(messages.initialCollateralInfoModalText),
    initialCollateralInfoModalButton: intl.formatMessage(messages.initialCollateralInfoModalButton),
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
  collateralInfoModalLabel: {
    id: 'components.settings.collateral.collateralInfoModalLabel',
    defaultMessage: '!!!Collateral creation',
  },
  collateralInfoModalTitle: {
    id: 'components.settings.collateral.collateralInfoModalTitle',
    defaultMessage: '!!!What is collateral?',
  },
  collateralInfoModalText: {
    id: 'components.settings.collateral.collateralInfoModalText',
    defaultMessage:
      '!!!The collateral mechanism is an important feature that has been designed to ensure successful smart contract execution. It is used to guarantee that Cardano nodes are compensated for their work in case phase-2 validation fails.',
  },
  initialCollateralInfoModalTitle: {
    id: 'components.settings.collateral.initialCollateralInfoModalTitle',
    defaultMessage: '!!!Collateral creation',
  },
  initialCollateralInfoModalText: {
    id: 'components.settings.collateral.initialCollateralInfoModalText',
    defaultMessage:
      '!!!The collateral mechanism is designed to ensure smart contracts on Cardano execute successfully. It guarantees that nodes are compensated for their work if a contract fails during validation.',
  },
  initialCollateralInfoModalButton: {
    id: 'components.settings.collateral.initialCollateralInfoModalButton',
    defaultMessage: '!!!Add collateral',
  },
})
