import {useFocusEffect} from '@react-navigation/native'
import {useBech32DRepID, useUpdateLatestGovernanceAction} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Button, Icon, Spacer, useModal} from '../../../../../components'
import {Text} from '../../../../../components'
import {ConfirmTxWithHwModal} from '../../../../../components/ConfirmTxWithHwModal'
import {ConfirmTxWithOsModal} from '../../../../../components/ConfirmTxWithOsModal'
import {ConfirmTxWithSpendingPasswordModal} from '../../../../../components/ConfirmTxWithSpendingPasswordModal'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useUnsafeParams} from '../../../../../kernel/navigation'
import {Amounts} from '../../../../../yoroi-wallets/utils'
import {formatTokenWithText} from '../../../../../yoroi-wallets/utils/format'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo, useStrings} from '../../common'
import {Routes} from '../../common/navigation'
import {GovernanceKindMap} from '../../types'

export const ConfirmTxScreen = () => {
  const strings = useStrings()
  const {wallet, meta} = useSelectedWallet()
  const params = useUnsafeParams<Routes['staking-gov-confirm-tx']>()
  const navigateTo = useNavigateTo()
  const {updateLatestGovernanceAction} = useUpdateLatestGovernanceAction(wallet.id)
  const {openModal, closeModal} = useModal()
  const [operationsOpen, setOperationsOpen] = React.useState(true)
  const {track} = useMetrics()
  const {styles} = useStyles()

  useFocusEffect(
    React.useCallback(() => {
      track.governanceConfirmTransactionPageViewed({
        governance_selection: GovernanceKindMap[params.vote.kind],
      })
    }, [params.vote.kind, track]),
  )

  const {data: bech32DrepId} = useBech32DRepID(params.vote.kind === 'delegate' ? params.vote.drepID : '', {
    enabled: params.vote.kind === 'delegate',
  })

  const titles = {
    abstain: strings.actionAbstainTitle,
    'no-confidence': strings.actionNoConfidenceTitle,
    delegate: strings.actionDelegateToADRepTitle,
  }

  const descriptions = {
    abstain: strings.actionAbstainDescription,
    'no-confidence': strings.actionNoConfidenceDescription,
    delegate: strings.actionDelegateToADRepDescription,
  }

  const operations = {
    abstain: strings.selectAbstain,
    'no-confidence': strings.selectNoConfidence,
    delegate: strings.delegateVotingToDRep(params.vote.kind === 'delegate' ? bech32DrepId ?? params.vote.drepID : ''),
  }

  const title = titles[params.vote.kind]
  const description = descriptions[params.vote.kind]
  const operation = operations[params.vote.kind]

  const fee = params.unsignedTx.fee
  const feeAmount = Amounts.getAmount(fee, wallet.primaryToken.identifier)
  const feeText = formatTokenWithText(feeAmount.quantity, wallet.primaryToken)

  const onSuccess = (txID: string) => {
    if (params.vote.kind === 'delegate') {
      updateLatestGovernanceAction({kind: 'delegate-to-drep', drepID: params.vote.drepID, txID})
    }

    if (params.vote.kind === 'abstain') {
      updateLatestGovernanceAction({kind: 'vote', vote: 'abstain', txID})
    }

    if (params.vote.kind === 'no-confidence') {
      updateLatestGovernanceAction({kind: 'vote', vote: 'no-confidence', txID})
    }

    navigateTo.txSuccess({navigateToStaking: params.navigateToStakingOnSuccess ?? false, kind: params.vote.kind})
  }

  const onSubmit = () => {
    if (meta.isHW) {
      openModal(
        strings.signTransaction,
        <ConfirmTxWithHwModal
          onCancel={closeModal}
          unsignedTx={params.unsignedTx}
          onSuccess={(signedTx) => onSuccess(signedTx.signedTx.id)}
          onNotSupportedCIP1694={() => {
            closeModal()
            navigateTo.notSupportedVersion()
          }}
        />,
        400,
      )
      return
    }

    if (!meta.isHW && !meta.isEasyConfirmationEnabled) {
      openModal(
        strings.signTransaction,
        <ConfirmTxWithSpendingPasswordModal
          unsignedTx={params.unsignedTx}
          onSuccess={(signedTx) => onSuccess(signedTx.signedTx.id)}
          onError={() => navigateTo.txFailed()}
        />,
      )
      return
    }

    if (!meta.isHW && meta.isEasyConfirmationEnabled) {
      openModal(
        strings.signTransaction,
        <ConfirmTxWithOsModal
          unsignedTx={params.unsignedTx}
          onSuccess={(signedTx) => onSuccess(signedTx.signedTx.id)}
          onError={() => navigateTo.txFailed()}
        />,
      )
      return
    }
  }

  return (
    <View style={styles.root}>
      <Text style={styles.secondaryText}>{title}</Text>

      <Spacer height={4} />

      <Text style={styles.normalText}>{description}</Text>

      <Spacer height={24} />

      <View style={styles.totalsArea}>
        <View style={styles.row}>
          <Text style={styles.total}>{strings.total}</Text>

          <Text style={styles.totalValue}>{feeText}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.total} />

          <PairedBalance
            amount={{
              info: wallet.portfolioPrimaryTokenInfo,
              quantity: BigInt(feeAmount.quantity),
            }}
            textStyle={styles.fiatValue}
            ignorePrivacy
          />
        </View>
      </View>

      <Spacer height={24} />

      <Text style={styles.secondaryText}>{strings.transactionDetails}</Text>

      <Spacer height={24} />

      <TouchableOpacity style={styles.operationsToggle} onPress={() => setOperationsOpen(!operationsOpen)}>
        <Text style={styles.primaryText}>{strings.operations}</Text>

        <Icon.Chevron direction={operationsOpen ? 'up' : 'down'} color="#6B7384" size={24} />
      </TouchableOpacity>

      {operationsOpen && (
        <>
          {params.registerStakingKey && (
            <>
              <Spacer height={32} />

              <Text style={styles.normalText}>{strings.registerStakingKey}</Text>
            </>
          )}

          <Spacer height={params.registerStakingKey ? 16 : 32} />

          <Text style={styles.normalText}>{operation}</Text>
        </>
      )}

      <Spacer height={32} />

      <View style={styles.feesRow}>
        <View style={styles.feeLabel}>
          <Text style={styles.primaryText}>{strings.txFees}</Text>
        </View>

        <Text style={styles.feeValue}>{feeText}</Text>
      </View>

      <Spacer fill />

      <Button title={strings.confirm} shelleyTheme onPress={onSubmit} />

      <Spacer height={26} />
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    operationsToggle: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    feeLabel: {
      ...atoms.gap_sm,
      ...atoms.flex_1,
      ...atoms.justify_start,
      ...atoms.align_center,
      ...atoms.flex_row,
    },
    feesRow: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    root: {
      ...atoms.px_lg,
      ...atoms.flex_1,
      ...atoms.justify_between,
      backgroundColor: color.bg_color_high,
    },
    primaryText: {
      color: color.text_gray_normal,
      ...atoms.font_semibold,
      ...atoms.body_1_lg_medium,
    },
    secondaryText: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
    row: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    totalsArea: {
      backgroundColor: '#3154cb',
      ...atoms.py_lg,
      ...atoms.px_lg,
      ...atoms.rounded_sm,
    },
    total: {
      fontFamily: 'Rubik-Regular',
      fontSize: 18,
      lineHeight: 26,
      color: color.white_static,
    },
    totalValue: {
      color: color.white_static,
      ...atoms.font_semibold,
      fontFamily: 'Rubik-Medium',
      fontSize: 18,
      lineHeight: 26,
    },
    fiatValue: {
      fontFamily: 'Rubik-Regular',
      fontSize: 14,
      lineHeight: 22,
      color: color.white_static,
      opacity: 0.5,
    },
    normalText: {
      color: color.text_gray_normal,
      ...atoms.font_normal,
      ...atoms.body_1_lg_regular,
    },
    feeValue: {
      color: color.gray_c500,
      ...atoms.font_normal,
      ...atoms.body_1_lg_regular,
    },
  })
  return {styles}
}
