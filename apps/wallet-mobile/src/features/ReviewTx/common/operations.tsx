import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {useQuery} from 'react-query'

import {Space} from '../../../components/Space/Space'
import {wrappedCsl} from '../../../yoroi-wallets/cardano/wrappedCsl'
import {usePoolInfo} from '../../../yoroi-wallets/hooks'
import {formatTokenWithText} from '../../../yoroi-wallets/utils/format'
import {asQuantity} from '../../../yoroi-wallets/utils/utils'
import {useSelectedNetwork} from '../../WalletManager/common/hooks/useSelectedNetwork'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from './hooks/useStrings'
import {Certificate, CertificateTypes, FormattedCertificates} from './types'

export const StakeRegistrationOperation = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.registerStakingKey}</Text>

      <Space width="lg" />

      <Text style={styles.operationValue}>
        {formatTokenWithText(asQuantity(wallet.protocolParams.keyDeposit), wallet.portfolioPrimaryTokenInfo)}
      </Text>
    </View>
  )
}

export const StakeDeregistrationOperation = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.deregisterStakingKey}</Text>
    </View>
  )
}

export const StakeRewardsWithdrawalOperation = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.rewardsWithdrawalLabel}</Text>

      <Text style={styles.operationValue}>{strings.rewardsWithdrawalText}</Text>
    </View>
  )
}

export const StakeDelegateOperation = ({poolId}: {poolId: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const poolInfo = usePoolInfo({poolId})
  const {networkManager} = useSelectedNetwork()

  const poolInfoText = poolInfo != null ? `[${poolInfo.ticker}] ${poolInfo.name}` : poolId

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.delegateStake}</Text>

      <Space width="lg" />

      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => Linking.openURL(networkManager.explorers.cardanoscan.pool(poolId))}
      >
        <Text style={styles.operationLink}>{poolInfoText}</Text>
      </TouchableOpacity>
    </View>
  )
}

export const AbstainOperation = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.selectAbstain}</Text>
    </View>
  )
}

export const NoConfidenceOperation = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.selectNoConfidence}</Text>
    </View>
  )
}

export const VoteDelegationOperation = ({drepID}: {drepID: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  const bech32DrepId = useDrepBech32Id(drepID)

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.delegateVotingToDRep}</Text>

      <Space width="lg" />

      <Text style={styles.operationValue}>{bech32DrepId ?? drepID}</Text>
    </View>
  )
}

export const useOperations = (certificates: FormattedCertificates | null) => {
  if (certificates === null) return []

  return certificates.reduce<React.ReactNode[]>((acc, [certificateKind, CertificateData], index) => {
    switch (certificateKind) {
      case CertificateTypes.StakeRegistration:
        return [...acc, <StakeRegistrationOperation key={index} />]

      case CertificateTypes.StakeDeregistration:
        return [...acc, <StakeDeregistrationOperation key={index} />]

      case CertificateTypes.StakeDelegation: {
        const poolKeyHash = (CertificateData as Certificate[CertificateTypes.StakeDelegation]).pool_keyhash ?? null
        if (poolKeyHash == null) return acc
        return [...acc, <StakeDelegateOperation key={index} poolId={poolKeyHash} />]
      }

      case CertificateTypes.VoteDelegation: {
        const drep = (CertificateData as Certificate[CertificateTypes.VoteDelegation]).drep

        if (drep === 'AlwaysAbstain') return [...acc, <AbstainOperation key={index} />]
        if (drep === 'AlwaysNoConfidence') return [...acc, <NoConfidenceOperation key={index} />]

        const drepId = ('KeyHash' in drep ? drep.KeyHash : drep.ScriptHash) ?? ''
        return [...acc, <VoteDelegationOperation key={index} drepID={drepId} />]
      }

      default:
        return acc
    }
  }, [])
}

export const getDrepBech32Id = async (poolId: string) => {
  const {csl, release} = wrappedCsl()
  try {
    const keyHash = await csl.Ed25519KeyHash.fromHex(poolId)
    return keyHash.toBech32('drep')
  } finally {
    release()
  }
}

export const useDrepBech32Id = (poolId: string) => {
  const query = useQuery({
    queryKey: ['drepBech32', poolId],
    queryFn: () => getDrepBech32Id(poolId),
  })

  return query?.data ?? null
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    operation: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_start,
    },
    operationLabel: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_low,
    },
    operationValue: {
      ...atoms.flex_1,
      ...atoms.text_right,
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
    operationLink: {
      ...atoms.body_2_md_regular,
      color: color.text_primary_medium,
    },
  })

  return {styles} as const
}
