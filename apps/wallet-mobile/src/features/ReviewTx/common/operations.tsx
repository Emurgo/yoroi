import {FullPoolInfo} from '@emurgo/yoroi-lib'
import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, useWindowDimensions, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {useQuery} from 'react-query'

import {useModal} from '../../../components/Modal/ModalContext'
import {Space} from '../../../components/Space/Space'
import {wrappedCsl} from '../../../yoroi-wallets/cardano/wrappedCsl'
import {usePoolInfo} from '../../../yoroi-wallets/hooks'
import {formatTokenWithText} from '../../../yoroi-wallets/utils/format'
import {asQuantity, Quantities} from '../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from './hooks/useStrings'
import {PoolDetails} from './PoolDetails'
import {CertificateType, FormattedTx} from './types'

export const StakeRegistrationOperation = ({fee}: {fee: Balance.Quantity}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.registerStakingKey}</Text>

      <Space width="lg" />

      <Text style={styles.operationValue}>{formatTokenWithText(fee, wallet.portfolioPrimaryTokenInfo)}</Text>
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
  const {openModal} = useModal()
  const {height: windowHeight} = useWindowDimensions()

  const handleShowPoolDetails = () => {
    openModal(strings.poolDetailsTitle, <PoolDetails poolInfo={poolInfo} />, windowHeight * 0.8)
  }

  const poolName = generatePoolName(poolInfo) ?? poolId

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.delegateStake}</Text>

      <Space width="lg" />

      <TouchableOpacity activeOpacity={0.5} onPress={handleShowPoolDetails}>
        <Text style={styles.operationLink}>{poolName}</Text>
      </TouchableOpacity>
    </View>
  )
}

export const generatePoolName = (poolInfo: FullPoolInfo) => {
  return poolInfo.explorer != null ? `[${poolInfo.explorer.ticker}] ${poolInfo.explorer.name}` : null
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

export const useOperations = (certificates: FormattedTx['certificates']) => {
  const {wallet} = useSelectedWallet()
  if (certificates === null) return {components: [], totalFee: Quantities.zero}

  return certificates.reduce<{components: React.ReactNode[]; totalFee: Balance.Quantity}>(
    (acc, certificate, index) => {
      switch (certificate.type) {
        case CertificateType.StakeRegistration: {
          const fee = asQuantity(wallet.protocolParams.keyDeposit)
          return {
            components: [...acc.components, <StakeRegistrationOperation fee={fee} key={index} />],
            totalFee: Quantities.sum([fee, acc.totalFee]),
          }
        }

        case CertificateType.StakeDeregistration:
          return {components: [...acc.components, <StakeDeregistrationOperation key={index} />], totalFee: acc.totalFee}

        case CertificateType.StakeDelegation: {
          const poolKeyHash = certificate.value.pool_keyhash ?? null
          if (poolKeyHash == null) return acc
          return {
            components: [...acc.components, <StakeDelegateOperation key={index} poolId={poolKeyHash} />],
            totalFee: acc.totalFee,
          }
        }

        case CertificateType.VoteDelegation: {
          const drep = certificate.value.drep

          if (drep === 'AlwaysAbstain')
            return {components: [...acc.components, <AbstainOperation key={index} />], totalFee: acc.totalFee}
          if (drep === 'AlwaysNoConfidence')
            return {components: [...acc.components, <NoConfidenceOperation key={index} />], totalFee: acc.totalFee}

          const drepId = ('KeyHash' in drep ? drep.KeyHash : drep.ScriptHash) ?? ''
          return {
            components: [...acc.components, <VoteDelegationOperation key={index} drepID={drepId} />],
            totalFee: acc.totalFee,
          }
        }

        default:
          return acc
      }
    },
    {components: [], totalFee: Quantities.zero},
  )
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
