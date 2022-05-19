import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import Markdown from 'react-native-easy-markdown'

import {Boundary, DangerousAction, ErrorView, Modal, PleaseWaitView, Spacer} from '../../components'
import globalMessages, {errorMessages, ledgerMessages} from '../../i18n/global-messages'
import LocalizableError from '../../i18n/LocalizableError'
import {WrongPassword} from '../../legacy/errors'
import {theme} from '../../theme'
import {Staked} from '../StakePoolInfos'
import {ConfirmTx} from './ConfirmTx'

type Props = {
  onCancel: () => void
  onSuccess: () => void
  stakingInfo: Staked
}

export const WithdrawStakingRewards = ({onSuccess, onCancel, stakingInfo}: Props) => {
  const strings = useStrings()

  const [step, setStep] = React.useState<'warning' | 'confirm'>('warning')
  const [shouldDeregister, setShouldDeregister] = React.useState(false)

  const onKeepOrDeregisterKey = async (shouldDeregister: boolean) => {
    setShouldDeregister(shouldDeregister)
    setStep('confirm')
  }

  return (
    <Modal visible onRequestClose={() => onCancel()} showCloseIcon>
      <Route active={step === 'warning'}>
        <DangerousAction
          title={strings.warningModalTitle}
          alertBox={{content: [strings.warning1, strings.warning2, strings.warning3]}}
          primaryButton={{
            disabled: stakingInfo.rewards === '0',
            label: strings.keepButton,
            onPress: () => onKeepOrDeregisterKey(false),
          }}
          secondaryButton={{
            label: strings.deregisterButton,
            onPress: () => onKeepOrDeregisterKey(true),
          }}
        >
          <Markdown style={styles.paragraph}>{strings.explanation1}</Markdown>
          <Spacer height={8} />
          <Markdown style={styles.paragraph}>{strings.explanation2}</Markdown>
          <Spacer height={8} />
          <Markdown style={styles.paragraph}>{strings.explanation3}</Markdown>
        </DangerousAction>
      </Route>

      <Route active={step === 'confirm'}>
        <Boundary
          loadingFallback={<PleaseWaitView title="" spinnerText={strings.pleaseWait} />}
          errorFallbackRender={({error}) => <ErrorFallback error={error} onCancel={onCancel} />}
        >
          <ConfirmTx
            shouldDeregister={shouldDeregister}
            onSuccess={() => onSuccess()}
            onCancel={() => onCancel()}
            stakingInfo={stakingInfo}
          />
        </Boundary>
      </Route>
    </Modal>
  )
}

const ErrorFallback: React.FC<{error: Error; onCancel: () => void}> = ({error, onCancel}) => {
  const intl = useIntl()

  if (error instanceof LocalizableError) {
    return (
      <ErrorView
        errorMessage={intl.formatMessage({id: error.id, defaultMessage: error.defaultMessage})}
        errorLogs={error?.values?.response as string}
        onDismiss={onCancel}
      />
    )
  }

  if (error instanceof WrongPassword) {
    return <ErrorView errorMessage={intl.formatMessage(errorMessages.incorrectPassword.message)} onDismiss={onCancel} />
  }

  return <ErrorView errorMessage={error.message} onDismiss={onCancel} />
}

const Route: React.FC<{active: boolean}> = ({active, children}) => <>{active ? children : null}</>

const styles = StyleSheet.create({
  paragraph: {
    ...theme.text,
  },
})

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
