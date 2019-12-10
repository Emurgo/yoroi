// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {connect} from 'react-redux'
import {injectIntl, defineMessages} from 'react-intl'
import {BigNumber} from 'bignumber.js'
import {withNavigation} from 'react-navigation'

// import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import WalletVerifyModal from './WalletVerifyModal'
import UpgradeCheckModal from './UpgradeCheckModal'
import UpgradeConfirmModal from './UpgradeConfirmModal'
import {ROOT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'
import {createWallet} from '../../../actions'

import type {Navigation} from '../../../types/navigation'

const RESTORATION_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  WALLET_VERIFY: 'WALLET_VERIFY',
  CHECK_UPGRADE: 'CHECK_UPGRADE',
  CONFIRM_UPGRADE: 'CONFIRM_UPGRADE',
}
type restorationDialogSteps = $Values<typeof RESTORATION_DIALOG_STEPS>

// TODO: just placeholders, delete
const byronAddresses = [
  '2cWKMJemoBakWtKxxsZpnEhs3ZWRf9tG3R9ReJX6UsAGiZP7PBpmutxYPRAakqEgMsK1g',
  '2cWKMJemoBahkhQS5QofBQxmsQMQDTxv1xzzqU9eHXBx6aDxaswBEksqurrfwhMNTYVFK',
]
const shelleyAddress =
  'addr1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqd6r42j'
const balance = new BigNumber('1234235.234')
const finalBalance = new BigNumber('1234235.0')
const fees = new BigNumber('234123')

const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.walletcredentialsscreen.title',
    defaultMessage: '!!!Wallet credentials',
    description: 'some desc',
  },
})

type Props = {
  intl: any,
  navigation: Navigation,
  name: string,
  password: string,
  navigateToWallet: () => mixed,
  currentDialogStep: restorationDialogSteps,
  toggleRestoreDialog: () => void,
  onConfirmVerify: () => void,
  onBack: () => void,
  onCheck: () => mixed,
  onSkip: () => mixed,
  onConfirmUpgrade: () => mixed,
  onCancelUpgrade: () => mixed,
  onGoToWallet: () => mixed,
}

const WalletCredentialsScreen = ({
  intl,
  navigation,
  name,
  password,
  navigateToWallet,
  currentDialogStep,
  toggleRestoreDialog,
  onConfirmVerify,
  onBack,
  onCheck,
  onSkip,
  onConfirmUpgrade,
  onCancelUpgrade,
  onGoToWallet,
}: Props) => (
  <>
    <WalletForm onSubmit={toggleRestoreDialog} />
    <WalletVerifyModal
      visible={currentDialogStep === RESTORATION_DIALOG_STEPS.WALLET_VERIFY}
      onConfirm={onConfirmVerify}
      onBack={onBack}
      byronAddress={byronAddresses[0]}
      shelleyAddress={shelleyAddress}
      onRequestClose={onBack}
    />
    <UpgradeCheckModal
      visible={currentDialogStep === RESTORATION_DIALOG_STEPS.CHECK_UPGRADE}
      onCheck={onCheck}
      onSkip={navigateToWallet}
      onRequestClose={onBack}
    />
    <UpgradeConfirmModal
      visible={currentDialogStep === RESTORATION_DIALOG_STEPS.CONFIRM_UPGRADE}
      byronAddresses={byronAddresses}
      shelleyAddress={shelleyAddress}
      balance={balance}
      finalBalance={finalBalance}
      fees={fees}
      onCancel={onCancelUpgrade}
      onConfirm={onConfirmUpgrade}
      onContinue={navigateToWallet}
      onRequestClose={onBack}
    />
  </>
)

export default injectIntl(
  compose(
    connect(
      () => ({}),
      {createWallet},
    ),
    withNavigation,
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      onGoToWallet: ({navigation}) => () => {
        navigation.navigate(ROOT_ROUTES.WALLET)
      },
    }),
    withStateHandlers(
      {
        currentDialogStep: RESTORATION_DIALOG_STEPS.CLOSED,
        name: '',
        password: '',
      },
      {
        toggleRestoreDialog: (state) => ({name, password}) => ({
          currentDialogStep: RESTORATION_DIALOG_STEPS.WALLET_VERIFY,
          name,
          password,
        }),
        onConfirmVerify: (state) => () => ({
          currentDialogStep: RESTORATION_DIALOG_STEPS.CHECK_UPGRADE,
        }),
        onBack: (state) => () => ({
          currentDialogStep: RESTORATION_DIALOG_STEPS.CLOSED,
        }),
        onCheck: (state) => () => ({
          currentDialogStep: RESTORATION_DIALOG_STEPS.CONFIRM_UPGRADE,
        }),
        navigateToWallet: (state, props) => async () => {
          const {name, password} = state
          const {navigation} = props
          const phrase = navigation.getParam('phrase')
          await createWallet(name, phrase, password)
          navigation.navigate(ROOT_ROUTES.WALLET)
        },
      },
    ),
  )(WalletCredentialsScreen),
)
