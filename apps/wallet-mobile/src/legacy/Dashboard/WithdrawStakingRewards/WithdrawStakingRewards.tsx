import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {Boundary} from '../../../components/Boundary/Boundary'
import {Button} from '../../../components/Button/Button'
import {Checkbox} from '../../../components/Checkbox/Checkbox'
import {useModal} from '../../../components/Modal/ModalContext'
import {PleaseWaitView} from '../../../components/PleaseWaitModal'
import {ScrollView, useScrollView} from '../../../components/ScrollView/ScrollView'
import {Space} from '../../../components/Space/Space'
import {Warning} from '../../../components/Warning/Warning'
import {useSelectedWallet} from '../../../features/WalletManager/common/hooks/useSelectedWallet'
import globalMessages, {confirmationMessages, ledgerMessages} from '../../../kernel/i18n/global-messages'
import {useWalletNavigation} from '../../../kernel/navigation'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useWithdrawalTx} from '../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types/yoroi'
import {delay} from '../../../yoroi-wallets/utils/timeUtils'
import {Quantities} from '../../../yoroi-wallets/utils/utils'
import {useStakingInfo} from '../StakePoolInfos'
import {ConfirmTx} from './ConfirmTx/ConfirmTx'
type Props = {
  wallet: YoroiWallet
}

export const WithdrawStakingRewards = ({wallet}: Props) => {
  const strings = useWithdrawStakingRewardsStrings()
  const {closeModal, openModal} = useModal()
  const {resetToTxHistory} = useWalletNavigation()

  const handleOnConfirm = async (withdrawalTx: YoroiUnsignedTx) => {
    closeModal()

    await delay(1000)

    openModal(
      '',
      <Boundary>
        <ConfirmTx
          wallet={wallet}
          unsignedTx={withdrawalTx}
          onSuccess={() => resetToTxHistory()}
          onCancel={() => closeModal()}
        />
      </Boundary>,
      400,
    )
  }

  return (
    <Boundary loading={{fallback: <PleaseWaitView title="" spinnerText={strings.pleaseWait} />}}>
      <WithdrawalTxForm wallet={wallet} onDone={handleOnConfirm} />
    </Boundary>
  )
}

const WithdrawalTxForm = ({wallet, onDone}: {wallet: YoroiWallet; onDone: (withdrawalTx: YoroiUnsignedTx) => void}) => {
  const {styles, colors} = useStyles()
  const bold = useBold()
  const {meta} = useSelectedWallet()
  const {stakingInfo} = useStakingInfo(wallet, {suspense: true})
  const strings = useWithdrawStakingRewardsStrings()
  const [isChecked, setIsChecked] = React.useState(false)
  const [deregister, setDeregister] = React.useState<boolean>()
  const {isScrollBarShown, setIsScrollBarShown, scrollViewRef} = useScrollView()

  const {isLoading} = useWithdrawalTx(
    {wallet, deregister, addressMode: meta.addressMode},
    {enabled: deregister != null, onSuccess: (withdrawalTx) => onDone(withdrawalTx)},
  )

  const hasRewards =
    stakingInfo?.status === 'staked' //
      ? Quantities.isGreaterThan(stakingInfo.rewards, '0')
      : false

  console.log('isScrollBarShown', isScrollBarShown)

  return (
    <View style={styles.root} testID="dangerousActionView">
      <Header title={strings.warningModalTitle}></Header>

      <ScrollView ref={scrollViewRef} style={styles.scroll} bounces={false} onScrollBarChange={setIsScrollBarShown}>
        <Warning content={[strings.warning1, strings.warning2, strings.warning3].join('\r\n')} />

        <Space height="lg" />

        <Text style={styles.paragraph}>{strings.explanation1(bold)}</Text>

        <Space height="sm" />

        <Text style={styles.paragraph}>{strings.explanation2(bold)}</Text>

        <Space height="sm" />

        <Text style={styles.paragraph}>{strings.explanation3(bold)}</Text>

        <Space height="lg" />

        <Checkbox
          onChange={() => setIsChecked(!isChecked)}
          checked={isChecked}
          text={strings.iUnderstand}
          style={styles.checkbox}
          testID="dangerousActionCheckbox"
        />

        <Space height="lg" />

        <View>
          <Button
            disabled={!isChecked}
            onPress={() => setDeregister(true)}
            title={strings.deregisterButton}
            style={styles.secondaryButton}
            testID="deregisterButton"
          />
        </View>

        <Space height="lg" />
      </ScrollView>

      <View style={[styles.actions, isScrollBarShown && {borderTopWidth: 1, borderTopColor: colors.lightGray}]}>
        <Button
          shelleyTheme
          onPress={() => setDeregister(false)}
          title={strings.keepButton}
          disabled={!hasRewards || isLoading}
          testID="keepRegisteredButton"
        />
      </View>

      <Space height="lg" />
    </View>
  )
}

const Header = ({title}: {title: string}) => {
  const {styles} = useStyles()
  return <View style={styles.header}>{title !== '' && <Text style={styles.title}>{title}</Text>}</View>
}

const useWithdrawStakingRewardsStrings = () => {
  const intl = useIntl()

  return {
    warningModalTitle: intl.formatMessage(messages.warningModalTitle),
    warning1: intl.formatMessage(messages.warning1),
    warning2: intl.formatMessage(messages.warning2),
    warning3: intl.formatMessage(messages.warning3),
    keepButton: intl.formatMessage(messages.keepButton),
    deregisterButton: intl.formatMessage(messages.deregisterButton),
    explanation1: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.explanation1, options),
    explanation2: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.explanation2, options),
    explanation3: (options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.explanation3, options),
    followSteps: intl.formatMessage(ledgerMessages.followSteps),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
    iUnderstand: intl.formatMessage(confirmationMessages.commonButtons.iUnderstandButton),
  }
}

const messages = defineMessages({
  warningModalTitle: {
    id: 'components.delegation.withdrawaldialog.warningModalTitle',
    defaultMessage: '!!!Also deregister staking key?',
  },
  explanation1: {
    id: 'components.delegation.withdrawaldialog.explanation1',
    defaultMessage: '!!!When <b>withdrawing rewards</b>, you also have the option to deregister the staking key.',
  },
  explanation2: {
    id: 'components.delegation.withdrawaldialog.explanation2',
    defaultMessage:
      '!!!<b>Keeping the staking key</b> will allow you to withdraw the rewards, ' +
      'but continue delegating to the same pool.',
  },
  explanation3: {
    id: 'components.delegation.withdrawaldialog.explanation3',
    defaultMessage:
      '!!!<b>Deregistering the staking key</b> will give you back your deposit and undelegate the key from any pool.',
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

const useBold = () => {
  const {styles} = useStyles()

  return {
    b: (text: React.ReactNode) => <Text style={styles.bolder}>{text}</Text>,
  }
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
    },
    scroll: {
      flex: 1,
      ...atoms.px_lg,
    },
    paragraph: {
      ...atoms.body_2_md_regular,
      color: color.gray_max,
    },
    checkbox: {
      paddingLeft: 4,
      alignItems: 'center',
    },
    secondaryButton: {
      backgroundColor: color.sys_magenta_500,
    },
    actions: {
      ...atoms.px_lg,
      paddingTop: 16,
    },
    bolder: {
      color: color.gray_max,
      ...atoms.body_2_md_medium,
    },
    title: {
      ...atoms.heading_3_medium,
      ...atoms.p_lg,
      color: color.text_gray_max,
    },
    header: {
      ...atoms.align_center,
      ...atoms.self_stretch,
    },
  })

  const colors = {
    lightGray: color.gray_200,
  }
  return {styles, colors} as const
}
