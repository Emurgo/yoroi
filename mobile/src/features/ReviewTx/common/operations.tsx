import {formatTokenWithText} from '@yoroi/cardano-wallet/utils/format'
import {Quantities, asQuantity} from '@yoroi/cardano-wallet/utils/utils'
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet/wrappedCsl'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import {useQuery} from '@tanstack/react-query'
import * as React from 'react'
import {Text, TouchableOpacity, View, useWindowDimensions} from 'react-native'

import {
  formatDrepHashToCIP105Format,
  formatDrepHashToCIP129Format,
} from '~/features/Staking/Governance/common/drep'
import {usePoolInfo} from '~/features/Staking/hooks/usePoolInfo'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'

import {PoolDetails} from './PoolDetails'
import {generatePoolName} from './poolUtils'
import {CertificateType, FormattedTx} from './types'

// Helper function to extract hash and type from drep object
// Handles both backend format ({addrKeyHash, type}) and expected format ({KeyHash} or {ScriptHash})
function extractDrepHash(
  drep: unknown,
): {hash: string; type: 'key' | 'script'} | null {
  if (typeof drep !== 'object' || drep === null) {
    return null
  }

  // Handle backend format: {addrKeyHash: string, type: 'keyhash'|'scripthash'}
  if ('addrKeyHash' in drep) {
    const hash = (drep as {addrKeyHash: string}).addrKeyHash ?? ''
    return {hash, type: 'key'}
  }
  if ('addrScriptHash' in drep) {
    const hash = (drep as {addrScriptHash: string}).addrScriptHash ?? ''
    return {hash, type: 'script'}
  }

  // Handle expected format: {KeyHash: string} or {ScriptHash: string}
  if ('KeyHash' in drep) {
    const hash = (drep as {KeyHash: string}).KeyHash ?? ''
    return {hash, type: 'key'}
  }
  if ('ScriptHash' in drep) {
    const hash = (drep as {ScriptHash: string}).ScriptHash ?? ''
    return {hash, type: 'script'}
  }

  return null
}

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
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.registerStakingKey}
        showWarning={showWarning}
        strike={strike}
      />

      <Space.Width.lg />

      <Text
        style={[
          a.body_2_md_regular,
          {color: p.text_gray_medium},
          strike && {textDecorationLine: 'line-through'},
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
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.deregisterStakingKey}
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
  const {atoms: ta} = useTheme()

  return (
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.rewardsWithdrawal.label}
        showWarning={showWarning}
        strike={strike}
      />

      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
        {strings.txReview.operations.rewardsWithdrawal.text}
      </Text>
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
      title: strings.txReview.poolDetails.title,
      content: <PoolDetails poolInfo={poolInfo} />,
      height: windowHeight * 0.8,
    })
  }

  const poolName = generatePoolName(poolInfo)

  return (
    <View>
      <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
        <Label
          label={strings.txReview.operations.delegateStake}
          showWarning={showWarning}
          strike={strike}
        />

        {poolName != null && (
          <>
            <Space.Width.lg />
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={handleShowPoolDetails}
              style={{flex: 1}}
            >
              <Text
                style={[
                  a.body_2_md_regular,
                  {color: p.text_primary_medium},
                  strike && {textDecorationLine: 'line-through'},
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {poolName}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Space.Height.xs />

      <Copiable text={poolId} style={{flex: 1}}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={handleShowPoolDetails}
          style={{flex: 1}}
        >
          <Text
            style={[
              a.body_2_md_regular,
              {color: p.text_gray_medium},
              strike && {textDecorationLine: 'line-through'},
            ]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {poolId}
          </Text>
        </TouchableOpacity>
      </Copiable>
    </View>
  )
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
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.selectAbstain}
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
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.selectNoConfidence}
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
      <View style={[a.flex, a.flex_row, a.align_center]}>
        <Label
          label={strings.txReview.operations.delegateVotingToDRep}
          showWarning={showWarning}
          strike={strike}
        />

        <Space.Width.lg />

        <Copiable text={CIP129label} style={{flex: 1}}>
          <View style={{flex: 1}}>
            <Text
              style={[
                a.body_2_md_regular,
                {color: p.text_gray_medium},
                strike && {textDecorationLine: 'line-through'},
              ]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {CIP129label}
            </Text>
          </View>
        </Copiable>
      </View>

      <Space.Height.sm />

      <View style={[a.flex, a.flex_row, a.align_center]}>
        <Label
          label={strings.txReview.operations.delegateVotingToDRepSpecified}
          showWarning={showWarning}
          strike={strike}
        />

        <Space.Width.lg />

        <Copiable text={CIP105label} style={{flex: 1}}>
          <View style={{flex: 1}}>
            <Text
              style={[
                a.body_2_md_regular,
                {color: p.text_gray_medium},
                strike && {textDecorationLine: 'line-through'},
              ]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {CIP105label}
            </Text>
          </View>
        </Copiable>
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
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.drepRegistration}
        showWarning={showWarning}
        strike={strike}
      />

      <Space.Width.lg />

      <Text
        style={[
          a.body_2_md_regular,
          {color: p.text_gray_medium},
          strike && {textDecorationLine: 'line-through'},
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
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.drepDeregistration}
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
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.poolRegistration}
        showWarning={showWarning}
        strike={strike}
      />

      <Space.Width.lg />

      <Text
        style={[
          a.body_2_md_regular,
          {color: p.text_gray_medium},
          strike && {textDecorationLine: 'line-through'},
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
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.poolRetirement}
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
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.drepUpdate}
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
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.moveInstantaneousRewards}
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
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.committeeHotAuthorization}
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
    <View style={[a.flex, a.flex_row, a.align_center, a.justify_between]}>
      <Label
        label={strings.txReview.operations.committeeColdResign}
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
    <View style={[a.flex, a.flex_row, a.align_center]}>
      <Text
        style={[
          a.body_2_md_regular,
          {color: p.text_gray_low},
          strike && {textDecorationLine: 'line-through'},
        ]}
      >
        {label}
      </Text>

      {showWarning && (
        <View style={[a.pl_xs]}>
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
          const poolKeyHash =
            typeof certificate.value.pool_keyhash === 'string'
              ? certificate.value.pool_keyhash
              : null
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

          // Handle backend format: {type: "abstain"} or string format: "AlwaysAbstain"
          if (
            drep === 'AlwaysAbstain' ||
            (typeof drep === 'object' &&
              drep !== null &&
              'type' in drep &&
              (drep as {type: string}).type === 'abstain')
          )
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
          // Handle backend format: {type: "no_confidence"} or string format: "AlwaysNoConfidence"
          if (
            drep === 'AlwaysNoConfidence' ||
            (typeof drep === 'object' &&
              drep !== null &&
              'type' in drep &&
              ((drep as {type: string}).type === 'no_confidence' ||
                (drep as {type: string}).type === 'noConfidence'))
          )
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

          // Extract hash from drep object (handles both backend and expected formats)
          const drepHash = extractDrepHash(drep)
          if (drepHash != null) {
            return {
              components: [
                ...acc.components,
                {
                  component: (
                    <VoteDelegationOperation
                      key={index}
                      hash={drepHash.hash}
                      type={drepHash.type}
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

          // If drep is null or doesn't match expected format, show generic VoteDelegation
          // This handles cases where the backend doesn't provide drep data
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <VoteDelegationOperation
                    key={index}
                    hash=""
                    type="key"
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

        case CertificateType.GenesisKeyDelegation: {
          // Genesis key delegation - no specific operation component yet
          // Return acc to skip for now, but don't throw error
          return acc
        }

        case CertificateType.StakeAndVoteDelegation: {
          // Combined certificate: show both stake delegation and vote delegation
          // First try to show vote delegation if drep is available
          const drep = certificate.value.drep
          // Handle backend format: {type: "abstain"} or string format: "AlwaysAbstain"
          if (
            drep === 'AlwaysAbstain' ||
            (typeof drep === 'object' &&
              drep !== null &&
              'type' in drep &&
              (drep as {type: string}).type === 'abstain')
          )
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
          // Handle backend format: {type: "no_confidence"} or string format: "AlwaysNoConfidence"
          if (
            drep === 'AlwaysNoConfidence' ||
            (typeof drep === 'object' &&
              drep !== null &&
              'type' in drep &&
              ((drep as {type: string}).type === 'no_confidence' ||
                (drep as {type: string}).type === 'noConfidence'))
          )
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

          // Extract hash from drep object (handles both backend and expected formats)
          const drepHash = extractDrepHash(drep)
          if (drepHash != null) {
            return {
              components: [
                ...acc.components,
                {
                  component: (
                    <VoteDelegationOperation
                      key={index}
                      hash={drepHash.hash}
                      type={drepHash.type}
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

          // If drep is null or doesn't match, fall back to showing vote delegation with empty hash
          // or stake delegation if poolKeyHash is available
          const poolKeyHash =
            typeof certificate.value.pool_keyhash === 'string'
              ? certificate.value.pool_keyhash
              : null
          if (poolKeyHash != null) {
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

          // Show generic VoteDelegation if neither drep nor poolKeyHash is available
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <VoteDelegationOperation
                    key={index}
                    hash=""
                    type="key"
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

        case CertificateType.StakeRegistrationAndDelegation: {
          // Combined certificate: show stake delegation (more specific than registration)
          const poolKeyHash =
            typeof certificate.value.pool_keyhash === 'string'
              ? certificate.value.pool_keyhash
              : null
          if (poolKeyHash == null) {
            // If no poolKeyHash, show registration instead
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

        case CertificateType.StakeVoteRegistrationAndDelegation: {
          // Combined certificate: prefer vote delegation, then stake delegation, then registration
          const drep = certificate.value.drep
          // Handle backend format: {type: "abstain"} or string format: "AlwaysAbstain"
          if (
            drep === 'AlwaysAbstain' ||
            (typeof drep === 'object' &&
              drep !== null &&
              'type' in drep &&
              (drep as {type: string}).type === 'abstain')
          )
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
          // Handle backend format: {type: "no_confidence"} or string format: "AlwaysNoConfidence"
          if (
            drep === 'AlwaysNoConfidence' ||
            (typeof drep === 'object' &&
              drep !== null &&
              'type' in drep &&
              ((drep as {type: string}).type === 'no_confidence' ||
                (drep as {type: string}).type === 'noConfidence'))
          )
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

          // Extract hash from drep object (handles both backend and expected formats)
          const drepHash = extractDrepHash(drep)
          if (drepHash != null) {
            return {
              components: [
                ...acc.components,
                {
                  component: (
                    <VoteDelegationOperation
                      key={index}
                      hash={drepHash.hash}
                      type={drepHash.type}
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

          // Fall back to stake delegation
          const poolKeyHash =
            typeof certificate.value.pool_keyhash === 'string'
              ? certificate.value.pool_keyhash
              : null
          if (poolKeyHash != null) {
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

          // Fall back to vote delegation with empty hash if drep is null
          // This ensures we show something even when drep data is missing
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <VoteDelegationOperation
                    key={index}
                    hash=""
                    type="key"
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

        case CertificateType.VoteRegistrationAndDelegation: {
          // Combined certificate: show vote delegation
          const drep = certificate.value.drep

          // Handle backend format: {type: "abstain"} or string format: "AlwaysAbstain"
          if (
            drep === 'AlwaysAbstain' ||
            (typeof drep === 'object' &&
              drep !== null &&
              'type' in drep &&
              (drep as {type: string}).type === 'abstain')
          )
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
          // Handle backend format: {type: "no_confidence"} or string format: "AlwaysNoConfidence"
          if (
            drep === 'AlwaysNoConfidence' ||
            (typeof drep === 'object' &&
              drep !== null &&
              'type' in drep &&
              ((drep as {type: string}).type === 'no_confidence' ||
                (drep as {type: string}).type === 'noConfidence'))
          )
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

          // Extract hash from drep object (handles both backend and expected formats)
          const drepHash = extractDrepHash(drep)
          if (drepHash != null) {
            return {
              components: [
                ...acc.components,
                {
                  component: (
                    <VoteDelegationOperation
                      key={index}
                      hash={drepHash.hash}
                      type={drepHash.type}
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

          // If drep is null or doesn't match expected format, show generic VoteDelegation
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <VoteDelegationOperation
                    key={index}
                    hash=""
                    type="key"
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
  return CardanoMobileWrapped.cslScope((csl) => {
    const keyHash = csl.Ed25519KeyHash.fromHex(poolId)
    return keyHash.toBech32('drep')
  })
}

export const useDrepBech32Id = (poolId: string) => {
  const query = useQuery({
    queryKey: ['drepBech32', poolId],
    queryFn: () => getDrepBech32Id(poolId),
    initialData: null,
  })

  return query?.data ?? null
}
