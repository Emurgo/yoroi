import {ReactNode} from 'react'
import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()
  return {
    governanceCentreTitle: intl.formatMessage(messages.governanceCentreTitle),
    confirmTxTitle: intl.formatMessage(messages.confirmTxTitle),
    learnMoreAboutGovernance: intl.formatMessage(messages.learnMoreAboutGovernance),
    actionDelegateToADRepTitle: intl.formatMessage(messages.actionDelegateToADRepTitle),
    actionDelegateToADRepDescription: intl.formatMessage(messages.actionDelegateToADRepDescription),
    actionAbstainTitle: intl.formatMessage(messages.actionAbstainTitle),
    actionAbstainDescription: intl.formatMessage(messages.actionAbstainDescription),
    actionNoConfidenceTitle: intl.formatMessage(messages.actionNoConfidenceTitle),
    actionNoConfidenceDescription: intl.formatMessage(messages.actionNoConfidenceDescription),
    drepKey: intl.formatMessage(messages.drepKey),
    delegatingToADRep: intl.formatMessage(messages.delegatingToADRep),
    abstaining: intl.formatMessage(messages.abstaining),
    delegateVotingToDRep: (drepID: string) => intl.formatMessage(messages.delegateVotingToDRep, {drepID}),
    selectAbstain: intl.formatMessage(messages.selectAbstain),
    selectNoConfidence: intl.formatMessage(messages.selectNoConfidence),
    operations: intl.formatMessage(messages.operations),
    enterADrepIDAndPassword: intl.formatMessage(messages.enterADrepIDAndPassword),
    drepID: intl.formatMessage(messages.drepID),
    thankYouForParticipating: intl.formatMessage(messages.thankYouForParticipating),
    thisTransactionCanTakeAWhile: intl.formatMessage(messages.thisTransactionCanTakeAWhile),
    participationBenefits: intl.formatMessage(messages.participationBenefits),
    goToGovernance: intl.formatMessage(messages.goToGovernance),
    findDRepHere: intl.formatMessage(messages.findDRepHere),
    reviewActions: intl.formatMessage(messages.reviewActions),
    actionYouHaveSelectedTxPending: (action: string, formattingOptions: FormattingOptions) =>
      intl.formatMessage(messages.actionYouHaveSelectedTxPending, {...formattingOptions, action}),
    actionYouHaveSelected: (action: string, formattingOptions: FormattingOptions) =>
      intl.formatMessage(messages.actionYouHaveSelected, {...formattingOptions, action}),
    changeDRep: intl.formatMessage(messages.changeDRep),
    confirm: intl.formatMessage(messages.confirm),
    transactionDetails: intl.formatMessage(messages.transactionDetails),
    total: intl.formatMessage(messages.total),
  }
}

type FormattingOptions = Record<'b' | 'textComponent', (text: ReactNode[]) => ReactNode>

const messages = defineMessages({
  governanceCentreTitle: {
    id: 'components.governance.governanceCentreTitle',
    defaultMessage: '!!!Governance centre',
  },
  confirmTxTitle: {
    id: 'components.governance.confirmTxTitle',
    defaultMessage: '!!!Confirm transaction',
  },
  learnMoreAboutGovernance: {
    id: 'components.governance.learnMoreAboutGovernance',
    defaultMessage: '!!!Learn more About Governance',
  },
  actionDelegateToADRepTitle: {
    id: 'components.governance.actionDelegateToADRepTitle',
    defaultMessage: '!!!Delegate to a DRep',
  },
  actionDelegateToADRepDescription: {
    id: 'components.governance.actionDelegateToADRepDescription',
    defaultMessage:
      '!!!You are designating someone else to cast vote on your behalf for all proposals now and in the future.',
  },
  actionAbstainTitle: {
    id: 'components.governance.actionAbstainTitle',
    defaultMessage: '!!!Abstain',
  },
  actionAbstainDescription: {
    id: 'components.governance.actionAbstainDescription',
    defaultMessage: '!!!You are choosing not to cast a vote on all proposals now and in the future.',
  },
  actionNoConfidenceTitle: {
    id: 'components.governance.actionNoConfidenceTitle',
    defaultMessage: '!!!No confidence',
  },
  actionNoConfidenceDescription: {
    id: 'components.governance.actionNoConfidenceDescription',
    defaultMessage: '!!!You are expressing a lack of trust for all proposals now and in the future.',
  },
  drepKey: {
    id: 'components.governance.drepKey',
    defaultMessage: '!!!DRep Key',
  },
  delegatingToADRep: {
    id: 'components.governance.delegatingToADRep',
    defaultMessage: '!!!Delegating to a DRep',
  },
  abstaining: {
    id: 'components.governance.abstaining',
    defaultMessage: '!!!Abstaining',
  },
  delegateVotingToDRep: {
    id: 'components.governance.delegateVotingToDRep',
    defaultMessage: '!!!Delegate voting to {drepID}',
  },
  selectAbstain: {
    id: 'components.governance.selectAbstain',
    defaultMessage: '!!!Select abstain',
  },
  selectNoConfidence: {
    id: 'components.governance.selectNoConfidence',
    defaultMessage: '!!!Select no confidence',
  },
  operations: {
    id: 'components.governance.operations',
    defaultMessage: '!!!Operations',
  },
  enterADrepIDAndPassword: {
    id: 'components.governance.enterADrepIDAndPassword',
    defaultMessage: '!!!Enter a Drep ID and password to sign this transaction',
  },
  drepID: {
    id: 'components.governance.drepID',
    defaultMessage: '!!!Drep ID',
  },
  thankYouForParticipating: {
    id: 'components.governance.thankYouForParticipating',
    defaultMessage: '!!!Thank you for participating in Governance',
  },
  thisTransactionCanTakeAWhile: {
    id: 'components.governance.thisTransactionCanTakeAWhile',
    defaultMessage: '!!!This transaction can take a while!',
  },
  participationBenefits: {
    id: 'components.governance.participationBenefits',
    defaultMessage:
      '!!!Participating in the Cardano Governance gives you the opportunity to participate in the voting as well as withdraw your staking rewards',
  },
  goToGovernance: {
    id: 'components.governance.goToGovernance',
    defaultMessage: '!!!Go to Governance',
  },
  findDRepHere: {
    id: 'components.governance.findDRepHere',
    defaultMessage: '!!!Find a DRep here',
  },
  reviewActions: {
    id: 'components.governance.reviewActions',
    defaultMessage: '!!!Review the selections carefully to assign yourself a Governance Status',
  },
  actionYouHaveSelectedTxPending: {
    id: 'components.governance.actionYouHaveSelectedTxPending',
    defaultMessage: '!!!You have selected <b>{action}</b> as your governance status.',
  },
  actionYouHaveSelected: {
    id: 'components.governance.actionYouHaveSelected',
    defaultMessage:
      '!!!You have selected <b>{action}</b> as your governance status. You can change it at any time by clicking in the card below.',
  },
  changeDRep: {
    id: 'components.governance.changeDRep',
    defaultMessage: '!!!Change DRep',
  },
  confirm: {
    id: 'components.governance.confirm',
    defaultMessage: '!!!Confirm',
  },
  transactionDetails: {
    id: 'components.governance.transactionDetails',
    defaultMessage: '!!!Transaction details',
  },
  total: {
    id: 'components.governance.total',
    defaultMessage: '!!!Total',
  },
})
