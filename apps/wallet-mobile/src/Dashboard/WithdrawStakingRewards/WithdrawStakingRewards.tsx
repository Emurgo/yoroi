import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import Markdown from 'react-native-markdown-display'

import {Boundary, DangerousAction, PleaseWaitView, Spacer} from '../../components'
import globalMessages, {ledgerMessages} from '../../kernel/i18n/global-messages'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {useWithdrawalTx} from '../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {Quantities} from '../../yoroi-wallets/utils'
import {useStakingInfo} from '../StakePoolInfos'
import {ConfirmTx} from './ConfirmTx/ConfirmTx'

type Props = {
  wallet: YoroiWallet
  onCancel: () => void
  onSuccess: () => void
}

export const WithdrawStakingRewards = ({wallet, onSuccess, onCancel}: Props) => {
  const strings = useStrings()
  const [state, setState] = React.useState<
    {step: 'form'; withdrawalTx: undefined} | {step: 'confirm'; withdrawalTx: YoroiUnsignedTx}
  >({step: 'form', withdrawalTx: undefined})

  return (
    <Boundary loading={{fallback: <PleaseWaitView title="" spinnerText={strings.pleaseWait} />}}>
      <Route active={state.step === 'form'}>
        <Boundary>
          <WithdrawalTxForm wallet={wallet} onDone={(withdrawalTx) => setState({step: 'confirm', withdrawalTx})} />
        </Boundary>
      </Route>

      {state.step === 'confirm' && (
        <Route active={true}>
          <ConfirmTx wallet={wallet} unsignedTx={state.withdrawalTx} onSuccess={onSuccess} onCancel={onCancel} />
        </Route>
      )}
    </Boundary>
  )
}

export const WithdrawalTxForm = ({
  wallet,
  onDone,
}: {
  wallet: YoroiWallet
  onDone: (withdrawalTx: YoroiUnsignedTx) => void
}) => {
  const styles = useStyles()
  const {stakingInfo} = useStakingInfo(wallet, {suspense: true})
  const strings = useStrings()
  const [deregister, setDeregister] = React.useState<boolean>()
  const {isLoading} = useWithdrawalTx(
    {wallet, deregister},
    {enabled: deregister != null, onSuccess: (withdrawalTx) => onDone(withdrawalTx)},
  )

  const hasRewards =
    stakingInfo?.status === 'staked' //
      ? Quantities.isGreaterThan(stakingInfo.rewards, '0')
      : false

  return (
    <DangerousAction
      title={strings.warningModalTitle}
      alertBox={{content: [strings.warning1, strings.warning2, strings.warning3]}}
      primaryButton={{
        disabled: !hasRewards || isLoading,
        label: strings.keepButton,
        onPress: () => setDeregister(false),
        testID: 'keepRegisteredButton',
      }}
      secondaryButton={{
        disabled: isLoading,
        label: strings.deregisterButton,
        onPress: () => setDeregister(true),
        testID: 'deregisterButton',
      }}
    >
      {/* @ts-expect-error old react */}
      <Markdown markdownStyle={styles.paragraph}>{strings.explanation1}</Markdown>

      <Spacer height={8} />

      {/* @ts-expect-error old react */}
      <Markdown markdownStyle={styles.paragraph}>{strings.explanation2}</Markdown>

      <Spacer height={8} />

      {/* @ts-expect-error old react */}
      <Markdown markdownStyle={styles.paragraph}>{strings.explanation3}</Markdown>
    </DangerousAction>
  )
}

const Route = ({active, children}: {active: boolean; children: React.ReactNode}) => <>{active ? children : null}</>

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    paragraph: {
      ...atoms.body_1_lg_regular,
    },
  })
  return styles
}

const useStrings = () => {
  const intl = useIntl()

  return {
    warningModalTitle: intl.formatMessage(messages.warningModalTitle),
    warning1: intl.formatMessage(messages.warning1),
    warning2: intl.formatMessage(messages.warning2),
    warning3: intl.formatMessage(messages.warning3),
    keepButton: intl.formatMessage(messages.keepButton),
    deregisterButton: intl.formatMessage(messages.deregisterButton),
    explanation1: intl.formatMessage(messages.explanation1),
    explanation2: intl.formatMessage(messages.explanation2),
    explanation3: intl.formatMessage(messages.explanation3),
    followSteps: intl.formatMessage(ledgerMessages.followSteps),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
  }
}

const messages = defineMessages({
  warningModalTitle: {
    id: 'components.delegation.withdrawaldialog.warningModalTitle',
    defaultMessage: '!!!Also deregister staking key?',
  },
  explanation1: {
    id: 'components.delegation.withdrawaldialog.explanation1',
    defaultMessage: '!!!When **withdrawing rewards**, you also have the option to deregister the staking key.',
  },
  explanation2: {
    id: 'components.delegation.withdrawaldialog.explanation2',
    defaultMessage:
      '!!!**Keeping the staking key** will allow you to withdraw the rewards, ' +
      'but continue delegating to the same pool.',
  },
  explanation3: {
    id: 'components.delegation.withdrawaldialog.explanation3',
    defaultMessage:
      '!!!**Deregistering the staking key** will give you back your deposit and undelegate the key from any pool.',
  },
  warning1: {
    id: 'components.delegation.withdrawaldialog.warning1',
    defaultMessage:
      '!!!You do NOT need to deregister to delegate to a different stake ' +
      'pool. You can change your delegation preference at any time.',
  },
  warning2: {
    id: 'components.delegation.withdrawaldialog.warning2',
    defaultMessage:
      '!!!You should NOT deregister if this staking key is used as a stake ' +
      "pool's reward account, as this will cause all pool operator rewards " +
      'to be sent back to the reserve.',
  },
  warning3: {
    id: 'components.delegation.withdrawaldialog.warning3',
    defaultMessage:
      '!!!Deregistering means this key will no longer receive rewards until ' +
      'you re-register the staking key (usually by delegating to a pool again)',
  },
  keepButton: {
    id: 'components.delegation.withdrawaldialog.keepButton',
    defaultMessage: '!!!Keep registered',
  },
  deregisterButton: {
    id: 'components.delegation.withdrawaldialog.deregisterButton',
    defaultMessage: '!!!Deregister',
  },
})
