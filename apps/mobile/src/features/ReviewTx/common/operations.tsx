import {FullPoolInfo} from '@emurgo/yoroi-lib'
import {useQuery} from '@tanstack/react-query'
import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import * as React from 'react'
import {Text, useWindowDimensions, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {
  formatDrepHashToCIP105Format,
  formatDrepHashToCIP129Format,
} from '~/features/Staking/Governance/common/drep'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {wrappedCsl} from '~/wallets/cardano/wrappedCsl'
import {usePoolInfo} from '~/features/Staking/hooks/usePoolInfo'
import {formatTokenWithText} from '~/wallets/utils/format'
import {asQuantity, Quantities} from '~/wallets/utils/utils'
import {useStrings} from '~/kernel/i18n/useStrings'
import {PoolDetails} from './PoolDetails'
import {CertificateType, FormattedTx} from './types'

export const StakeRegistrationOperation = ({
  fee,
  showWarning,
  strike,
}: {
  fee: Balance.Quantity
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {palette: p} = useTheme()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.registerStakingKey}
        showWarning={showWarning}
        strike={strike}
      />

      <Space.Width.lg />

      <Text
        style={[
          styles.operationValue,
          {color: p.text_gray_medium},
          strike && styles.strike,
        ]}
      >
        {formatTokenWithText(fee, wallet.portfolioPrimaryTokenInfo)}
      </Text>
    </View>
  )
}

export const StakeDeregistrationOperation = ({
  showWarning,
  strike,
}: {
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.deregisterStakingKey}
        showWarning={showWarning}
        strike={strike}
      />
    </View>
  )
}

export const StakeRewardsWithdrawalOperation = ({
  showWarning,
  strike,
}: {
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.rewardsWithdrawalLabel}
        showWarning={showWarning}
        strike={strike}
      />

      <Text style={styles.operationValue}>{strings.txReview.rewardsWithdrawalText}</Text>
    </View>
  )
}

export const StakeDelegationOperation = ({
  poolId,
  showWarning,
  strike,
}: {
  poolId: string
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()
  const poolInfo = usePoolInfo({poolId})
  const {openModal} = useModal()
  const {height: windowHeight} = useWindowDimensions()
  const {palette: p} = useTheme()

  const handleShowPoolDetails = () => {
    openModal({
      title: strings.txReview.poolDetailsTitle,
      content: <PoolDetails poolInfo={poolInfo} />,
      height: windowHeight * 0.8,
    })
  }

  const poolName = generatePoolName(poolInfo) ?? poolId

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.delegateStake}
        showWarning={showWarning}
        strike={strike}
      />

      <Space.Width.lg />

      <TouchableOpacity activeOpacity={0.5} onPress={handleShowPoolDetails}>
        <Text
          style={[
            styles.operationLink,
            {color: p.text_primary_medium},
            strike && styles.strike,
          ]}
        >
          {poolName}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export const generatePoolName = (poolInfo: FullPoolInfo) => {
  return poolInfo.explorer != null
    ? `[${poolInfo.explorer.ticker}] ${poolInfo.explorer.name}`
    : null
}

export const AbstainOperation = ({
  showWarning,
  strike,
}: {
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.selectAbstain}
        showWarning={showWarning}
        strike={strike}
      />
    </View>
  )
}

export const NoConfidenceOperation = ({
  showWarning,
  strike,
}: {
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.selectNoConfidence}
        showWarning={showWarning}
        strike={strike}
      />
    </View>
  )
}

export const VoteDelegationOperation = ({
  hash,
  type,
  showWarning,
  strike,
}: {
  hash: string
  type: 'key' | 'script'
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const CIP129label = formatDrepHashToCIP129Format(hash, type)
  const CIP105label = formatDrepHashToCIP105Format(hash)

  return (
    <>
      <View style={styles.operation}>
        <Label
          label={strings.txReview.delegateVotingToDRep}
          showWarning={showWarning}
          strike={strike}
        />

        <Space.Width.lg />

        <Text
          style={[
            styles.operationValue,
            {color: p.text_gray_medium},
            strike && styles.strike,
          ]}
        >
          {CIP129label}
        </Text>
      </View>

      <Space.Height.sm />

      <View style={styles.operation}>
        <Label
          label={strings.txReview.delegateVotingToDRepSpecified}
          showWarning={showWarning}
          strike={strike}
        />

        <Space.Width.lg />

        <Text
          style={[
            styles.operationValue,
            {color: p.text_gray_medium},
            strike && styles.strike,
          ]}
        >
          {CIP105label}
        </Text>
      </View>
    </>
  )
}

export const DrepRegistrationOperation = ({
  fee,
  showWarning,
  strike,
}: {
  fee: Balance.Quantity
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {palette: p} = useTheme()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.drepRegistration}
        showWarning={showWarning}
        strike={strike}
      />

      <Space.Width.lg />

      <Text
        style={[
          styles.operationValue,
          {color: p.text_gray_medium},
          strike && styles.strike,
        ]}
      >
        {formatTokenWithText(fee, wallet.portfolioPrimaryTokenInfo)}
      </Text>
    </View>
  )
}

export const DrepDeregistrationOperation = ({
  showWarning,
  strike,
}: {
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.drepDeregistration}
        showWarning={showWarning}
        strike={strike}
      />
    </View>
  )
}

export const PoolRegistrationOperation = ({
  fee,
  showWarning,
  strike,
}: {
  fee: Balance.Quantity
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {palette: p} = useTheme()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.poolRegistration}
        showWarning={showWarning}
        strike={strike}
      />

      <Space.Width.lg />

      <Text
        style={[
          styles.operationValue,
          {color: p.text_gray_medium},
          strike && styles.strike,
        ]}
      >
        {formatTokenWithText(fee, wallet.portfolioPrimaryTokenInfo)}
      </Text>
    </View>
  )
}

export const PoolRetirementOperation = ({
  showWarning,
  strike,
}: {
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.poolRetirement}
        showWarning={showWarning}
        strike={strike}
      />
    </View>
  )
}
export const DrepUpdateOperation = ({
  showWarning,
  strike,
}: {
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.drepUpdate}
        showWarning={showWarning}
        strike={strike}
      />
    </View>
  )
}
export const MoveInstantaneousRewardsOperation = ({
  showWarning,
  strike,
}: {
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.moveInstantaneousRewards}
        showWarning={showWarning}
        strike={strike}
      />
    </View>
  )
}
export const CommitteeHotAuthorizationOperation = ({
  showWarning,
  strike,
}: {
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.committeeHotAuthorization}
        showWarning={showWarning}
        strike={strike}
      />
    </View>
  )
}

export const CommitteeColdResignOperation = ({
  showWarning,
  strike,
}: {
  showWarning?: boolean
  strike?: boolean
}) => {
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Label
        label={strings.txReview.committeeColdResign}
        showWarning={showWarning}
        strike={strike}
      />
    </View>
  )
}

const Label = ({
  label,
  showWarning,
  strike,
}: {
  label: string
  showWarning?: boolean
  strike?: boolean
}) => {
  const {palette: p} = useTheme()
  return (
    <View style={styles.operationLabelContainer}>
      <Text
        style={[
          styles.operationLabel,
          {color: p.text_gray_low},
          strike && styles.strike,
        ]}
      >
        {label}
      </Text>

      {showWarning && (
        <View style={styles.infoIcon}>
          <Icon.Info size={24} color={p.sys_orange_500} />
        </View>
      )}
    </View>
  )
}

type OperationsCount = Record<CertificateType, number>
export type Operations = {
  components: Array<{
    duplicated: boolean
    type: CertificateType
    component: React.ReactNode
  }>
  totalFee: Balance.Quantity
}
export const useOperations = (certificates: FormattedTx['certificates']) => {
  const {wallet} = useSelectedWallet()
  const operationCount = {} as OperationsCount

  if (certificates === null)
    return {
      components: [] as Operations['components'],
      totalFee: Quantities.zero,
    }

  const certificatesTypes = certificates.map((cert) => cert.type)
  certificatesTypes.forEach((cert) =>
    updateOperationsCount(cert, operationCount),
  )

  return certificates.reduce<Operations>(
    (acc, certificate, index) => {
      const fistElementIndex = certificatesTypes.indexOf(certificate.type)
      const isFistElement = fistElementIndex === index
      const isNotFirstElementDuplicated =
        operationCount[certificate.type] > 1 && !isFistElement
      const isFirstElementDuplicated =
        operationCount[certificate.type] > 1 && isFistElement

      switch (certificate.type) {
        case CertificateType.StakeRegistration: {
          const fee = asQuantity(wallet.protocolParams.keyDeposit)

          return {
            components: [
              ...acc.components,
              {
                component: (
                  <StakeRegistrationOperation
                    fee={fee}
                    key={index}
                    showWarning={isFirstElementDuplicated}
                    strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.StakeRegistration,
              },
            ],
            totalFee: Quantities.sum([fee, acc.totalFee]),
          }
        }

        case CertificateType.StakeDeregistration:
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <StakeDeregistrationOperation
                    key={index}
                    showWarning={isFirstElementDuplicated}
                    strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.StakeDeregistration,
              },
            ],
            totalFee: acc.totalFee,
          }

        case CertificateType.StakeDelegation: {
          const poolKeyHash = certificate.value.pool_keyhash ?? null
          if (poolKeyHash == null) return acc
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <StakeDelegationOperation
                    key={index}
                    poolId={poolKeyHash}
                    showWarning={isFirstElementDuplicated}
                    strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.StakeDelegation,
              },
            ],
            totalFee: acc.totalFee,
          }
        }

        case CertificateType.VoteDelegation: {
          const drep = certificate.value.drep

          if (drep === 'AlwaysAbstain')
            return {
              components: [
                ...acc.components,
                {
                  component: (
                    <AbstainOperation
                      key={index}
                      showWarning={isFirstElementDuplicated}
                      strike={isNotFirstElementDuplicated}
                    />
                  ),
                  duplicated: isNotFirstElementDuplicated,
                  type: CertificateType.VoteDelegation,
                },
              ],
              totalFee: acc.totalFee,
            }
          if (drep === 'AlwaysNoConfidence')
            return {
              components: [
                ...acc.components,
                {
                  component: (
                    <NoConfidenceOperation
                      showWarning={isFirstElementDuplicated}
                      key={index}
                      strike={isNotFirstElementDuplicated}
                    />
                  ),
                  duplicated: isNotFirstElementDuplicated,
                  type: CertificateType.VoteDelegation,
                },
              ],
              totalFee: acc.totalFee,
            }

          const hash =
            ('KeyHash' in drep ? drep.KeyHash : drep.ScriptHash) ?? ''
          const type = 'KeyHash' in drep ? 'key' : 'script'
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <VoteDelegationOperation
                    key={index}
                    hash={hash}
                    type={type}
                    showWarning={isFirstElementDuplicated}
                    strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.VoteDelegation,
              },
            ],
            totalFee: acc.totalFee,
          }
        }

        case CertificateType.DRepRegistration: {
          const fee = asQuantity(wallet.protocolParams.keyDeposit)
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <DrepRegistrationOperation
                    fee={fee}
                    key={index}
                    showWarning={isFirstElementDuplicated}
                    strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.DRepRegistration,
              },
            ],
            totalFee: Quantities.sum([fee, acc.totalFee]),
          }
        }

        case CertificateType.DRepDeregistration: {
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <DrepDeregistrationOperation
                    key={index}
                    showWarning={isFirstElementDuplicated}
                    strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.DRepDeregistration,
              },
            ],
            totalFee: acc.totalFee,
          }
        }

        case CertificateType.PoolRegistration: {
          const fee = asQuantity(wallet.protocolParams.poolDeposit)
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <PoolRegistrationOperation
                    fee={fee}
                    key={index}
                    showWarning={isFirstElementDuplicated}
                    strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.PoolRegistration,
              },
            ],
            totalFee: Quantities.sum([fee, acc.totalFee]),
          }
        }

        case CertificateType.PoolRetirement: {
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <PoolRetirementOperation
                    key={index}
                    showWarning={isFirstElementDuplicated}
                    strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.PoolRetirement,
              },
            ],
            totalFee: acc.totalFee,
          }
        }

        case CertificateType.DRepUpdate: {
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <DrepUpdateOperation
                    key={index}
                    showWarning={isFirstElementDuplicated}
                    strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.DRepUpdate,
              },
            ],
            totalFee: acc.totalFee,
          }
        }

        case CertificateType.MoveInstantaneousRewardsCert: {
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <MoveInstantaneousRewardsOperation
                    key={index}
                    showWarning={isFirstElementDuplicated}
                    strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.MoveInstantaneousRewardsCert,
              },
            ],
            totalFee: acc.totalFee,
          }
        }

        case CertificateType.CommitteeHotAuth: {
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <CommitteeHotAuthorizationOperation
                    key={index}
                    showWarning={isFirstElementDuplicated}
                    strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.CommitteeHotAuth,
              },
            ],
            totalFee: acc.totalFee,
          }
        }

        case CertificateType.CommitteeColdResign: {
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <CommitteeColdResignOperation
                    key={index}
                    showWarning={isFirstElementDuplicated}
                    strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.CommitteeColdResign,
              },
            ],
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

const updateOperationsCount = (
  operation: CertificateType,
  operationsCount: OperationsCount,
) => {
  let count = operationsCount[operation]

  if (count != null) {
    operationsCount[operation] = ++count
    return operationsCount
  }

  operationsCount[operation] = 1
  return operationsCount
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
    suspense: true,
  })

  return query?.data ?? null
}
