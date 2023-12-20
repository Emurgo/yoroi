import {isNonNullable, isString} from '@yoroi/common'
import {
  GovernanceProvider,
  useBech32DRepID,
  useDelegationCertificate,
  useGovernance,
  useLatestGovernanceAction,
  useStakingKeyState,
  useVotingCertificate,
} from '@yoroi/staking'
import React, {type ReactNode} from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../../../components'
import {useStakingInfo} from '../../../../../Dashboard/StakePoolInfos'
import {useUnsafeParams, useWalletNavigation} from '../../../../../navigation'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {useStakingKey, useTransactionInfos, useWalletEvent} from '../../../../../yoroi-wallets/hooks'
import {TransactionInfo} from '../../../../../yoroi-wallets/types'
import {Action, LearnMoreLink, useNavigateTo, useStrings} from '../../common'
import {mapStakingKeyStateToGovernanceAction} from '../../common/helpers'
import {Routes} from '../../common/navigation'
import {GovernanceImage} from '../../illustrations'
import {GovernanceVote} from '../../types'
import {EnterDrepIdModal} from '../EnterDrepIdModal'

export const HomeScreen = () => {
  const wallet = useSelectedWallet()
  const txInfos = useTransactionInfos(wallet)
  const stakingKeyHash = useStakingKey(wallet)
  const [isPendingRefetchAfterTxConfirmation, setIsPendingRefetchAfterTxConfirmation] = React.useState(false)

  const {data: stakingStatus, refetch: refetchStakingKeyState} = useStakingKeyState(stakingKeyHash, {
    refetchOnMount: true,
    suspense: true,
  })

  useWalletEvent(wallet, 'utxos', refetchStakingKeyState)

  const {data: lastSubmittedTx} = useLatestGovernanceAction(wallet.id)

  const submittedTxId = lastSubmittedTx?.txID

  const isTxPending = isString(submittedTxId) && !isTxConfirmed(submittedTxId, txInfos)

  React.useEffect(() => {
    if (!isTxPending && submittedTxId !== undefined) {
      setIsPendingRefetchAfterTxConfirmation(true)
      refetchStakingKeyState().finally(() => setIsPendingRefetchAfterTxConfirmation(false))
    }
  }, [isTxPending, submittedTxId, refetchStakingKeyState, setIsPendingRefetchAfterTxConfirmation])

  const txPendingDisplayed = isTxPending || isPendingRefetchAfterTxConfirmation

  if (wallet.isHW) {
    return <HardwareWalletSupportComingSoon />
  }

  if (txPendingDisplayed && isNonNullable(lastSubmittedTx)) {
    if (lastSubmittedTx.kind === 'delegate-to-drep') {
      const action: GovernanceVote = {kind: 'delegate', drepID: lastSubmittedTx.drepID}
      return <ParticipatingInGovernanceVariant action={action} isTxPending />
    }
    if (lastSubmittedTx.kind === 'vote' && lastSubmittedTx.vote === 'abstain') {
      const action: GovernanceVote = {kind: 'abstain'}
      return <ParticipatingInGovernanceVariant action={action} isTxPending />
    }

    if (lastSubmittedTx.kind === 'vote' && lastSubmittedTx.vote === 'no-confidence') {
      const action: GovernanceVote = {kind: 'no-confidence'}
      return <ParticipatingInGovernanceVariant action={action} isTxPending />
    }
  }

  const action = stakingStatus ? mapStakingKeyStateToGovernanceAction(stakingStatus) : null
  if (action !== null) {
    return <ParticipatingInGovernanceVariant action={action} />
  }
  return <NeverParticipatedInGovernanceVariant />
}

const ParticipatingInGovernanceVariant = ({
  action,
  isTxPending = false,
}: {
  action: GovernanceVote
  isTxPending?: boolean
}) => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {data: bech32DrepId} = useBech32DRepID(action.kind === 'delegate' ? action.drepID : '', {
    enabled: action.kind === 'delegate',
  })

  const actionTitles = {
    abstain: strings.actionAbstainTitle,
    delegate: strings.actionDelegateToADRepTitle,
    'no-confidence': strings.actionNoConfidenceTitle,
  }
  const selectedActionTitle = actionTitles[action.kind]

  const introduction = isTxPending
    ? strings.actionYouHaveSelectedTxPending(selectedActionTitle, formattingOptions)
    : strings.actionYouHaveSelected(selectedActionTitle, formattingOptions)

  const navigateToChangeVote = () => {
    navigateTo.changeVote()
  }

  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.description}>{introduction}</Text>
      </View>

      <Spacer height={24} />

      <View style={styles.actions}>
        {action.kind === 'delegate' && (
          <Action
            title={strings.delegatingToADRep}
            description={strings.actionDelegateToADRepDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          >
            <Text style={styles.drepInfoTitle}>{strings.drepID}</Text>

            <Text style={styles.drepInfoDescription}>{bech32DrepId ?? action.drepID}</Text>
          </Action>
        )}

        {action.kind === 'abstain' && (
          <Action
            title={strings.abstaining}
            description={strings.actionAbstainDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          />
        )}

        {action.kind === 'no-confidence' && (
          <Action
            title={strings.actionNoConfidenceTitle}
            description={strings.actionNoConfidenceDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          />
        )}
      </View>

      <Spacer fill />

      <LearnMoreLink />

      <Spacer height={24} />
    </View>
  )
}

const formattingOptions = {
  b: (text: ReactNode) => <Text style={[styles.description, styles.bold]}>{text}</Text>,
  textComponent: (text: ReactNode) => <Text style={styles.description}>{text}</Text>,
}

const NeverParticipatedInGovernanceVariant = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const wallet = useSelectedWallet()
  const {manager} = useGovernance()
  const {openModal} = useModal()
  const stakingInfo = useStakingInfo(wallet, {suspense: true})
  const params = useUnsafeParams<Routes['staking-gov-home']>()

  const navigateToStakingOnSuccess = params?.navigateToStakingOnSuccess ?? false

  const hasStakingKeyRegistered = stakingInfo?.data?.status !== 'not-registered'
  useWalletEvent(wallet, 'utxos', stakingInfo.refetch)
  const needsToRegisterStakingKey = !hasStakingKeyRegistered

  const {createCertificate: createDelegationCertificate} = useDelegationCertificate({
    useErrorBoundary: true,
  })

  const {createCertificate: createVotingCertificate} = useVotingCertificate({
    useErrorBoundary: true,
  })

  const openDRepIdModal = (onSubmit: (drepId: string) => void) => {
    openModal(
      strings.enterDRepID,
      <GovernanceProvider manager={manager}>
        <EnterDrepIdModal onSubmit={onSubmit} />
      </GovernanceProvider>,
      360,
    )
  }

  const handleDelegate = () => {
    openDRepIdModal(async (drepID) => {
      const stakingKey = await wallet.getStakingKey()
      createDelegationCertificate(
        {drepID, stakingKey},
        {
          onSuccess: async (certificate) => {
            const stakeCert = needsToRegisterStakingKey
              ? await manager.createStakeRegistrationCertificate(stakingKey)
              : null
            const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]
            const unsignedTx = await wallet.createUnsignedGovernanceTx(certs)
            navigateTo.confirmTx({
              unsignedTx,
              vote: {kind: 'delegate', drepID},
              registerStakingKey: stakeCert !== null,
              navigateToStakingOnSuccess,
            })
          },
        },
      )
    })
  }

  const handleAbstain = async () => {
    const stakingKey = await wallet.getStakingKey()
    createVotingCertificate(
      {vote: 'abstain', stakingKey},
      {
        onSuccess: async (certificate) => {
          const stakeCert = needsToRegisterStakingKey
            ? await manager.createStakeRegistrationCertificate(stakingKey)
            : null
          const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]
          const unsignedTx = await wallet.createUnsignedGovernanceTx(certs)
          navigateTo.confirmTx({
            unsignedTx,
            vote: {kind: 'abstain'},
            registerStakingKey: stakeCert !== null,
            navigateToStakingOnSuccess,
          })
        },
      },
    )
  }

  const handleNoConfidence = async () => {
    const stakingKey = await wallet.getStakingKey()
    createVotingCertificate(
      {vote: 'no-confidence', stakingKey},
      {
        onSuccess: async (certificate) => {
          const stakeCert = needsToRegisterStakingKey
            ? await manager.createStakeRegistrationCertificate(stakingKey)
            : null
          const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]
          const unsignedTx = await wallet.createUnsignedGovernanceTx(certs)
          navigateTo.confirmTx({
            unsignedTx,
            vote: {kind: 'no-confidence'},
            registerStakingKey: stakeCert !== null,
            navigateToStakingOnSuccess,
          })
        },
      },
    )
  }

  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.description}>{strings.reviewActions}</Text>
      </View>

      <Spacer height={24} />

      <View style={styles.actions}>
        <Action
          title={strings.actionDelegateToADRepTitle}
          description={strings.actionDelegateToADRepDescription}
          onPress={handleDelegate}
        />

        <Action
          title={strings.actionAbstainTitle}
          description={strings.actionAbstainDescription}
          onPress={handleAbstain}
        />

        <Action
          title={strings.actionNoConfidenceTitle}
          description={strings.actionNoConfidenceDescription}
          onPress={handleNoConfidence}
        />
      </View>

      <Spacer fill />

      <LearnMoreLink />

      <Spacer height={24} />
    </View>
  )
}

const HardwareWalletSupportComingSoon = () => {
  const strings = useStrings()
  const walletNavigateTo = useWalletNavigation()
  const handleOnPress = () => walletNavigateTo.navigateToTxHistory()
  return (
    <View style={styles.supportRoot}>
      <GovernanceImage />

      <View>
        <Text style={styles.supportTitle}>{strings.hardwareWalletSupportComingSoon}</Text>
      </View>

      <Spacer height={4} />

      <View>
        <Text style={styles.supportDescription}>{strings.workingOnHardwareWalletSupport}</Text>
      </View>

      <Spacer height={16} />

      <View>
        <Button title={strings.goToWallet} textStyles={styles.button} onPress={handleOnPress} shelleyTheme />
      </View>
    </View>
  )
}

const isTxConfirmed = (txId: string, txInfos: Record<string, TransactionInfo>) => {
  return Object.values(txInfos).some((tx) => tx.id === txId)
}

const styles = StyleSheet.create({
  supportRoot: {
    paddingHorizontal: 18,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  supportTitle: {
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 30,
    color: '#000000',
    textAlign: 'center',
  },
  supportDescription: {
    fontFamily: 'Rubik-Regular',
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7384',
    textAlign: 'center',
  },
  root: {
    paddingHorizontal: 18,
    flex: 1,
    justifyContent: 'space-between',
  },
  description: {
    fontFamily: 'Rubik-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#242838',
  },
  bold: {
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
  },
  actions: {
    flex: 1,
    gap: 16,
  },
  drepInfoTitle: {
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#242838',
  },
  drepInfoDescription: {
    fontFamily: 'Rubik-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7384',
  },
})
