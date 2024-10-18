import {PoolInfoApi} from '@emurgo/yoroi-lib'
import {useBech32DRepID} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {useQuery} from 'react-query'

import {Space} from '../../../components/Space/Space'
import {getPoolBech32Id} from '../../../yoroi-wallets/cardano/delegationUtils'
import {formatTokenWithText} from '../../../yoroi-wallets/utils/format'
import {asQuantity} from '../../../yoroi-wallets/utils/utils'
import {useSelectedNetwork} from '../../WalletManager/common/hooks/useSelectedNetwork'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from './hooks/useStrings'

export const RegisterStakingKeyOperation = () => {
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
export const DelegateStakeOperation = ({poolId}: {poolId: string}) => {
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

export const usePoolInfo = ({poolId}: {poolId: string}) => {
  const {networkManager} = useSelectedNetwork()
  const poolInfoApi = React.useMemo(
    () => new PoolInfoApi(networkManager.legacyApiBaseUrl),
    [networkManager.legacyApiBaseUrl],
  )
  const poolInfo = useQuery({
    queryKey: ['usePoolInfoStakeOperation', poolId],
    queryFn: async () => {
      const poolBech32Id = await getPoolBech32Id(poolId)
      return poolInfoApi.getSingleExplorerPoolInfo(poolBech32Id)
    },
  })

  return poolInfo?.data ?? null
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

export const DelegateVotingToDrepOperation = ({drepID}: {drepID: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  const {data: bech32DrepId} = useBech32DRepID(drepID)

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.delegateVotingToDRep}</Text>

      <Space width="lg" />

      <Text style={styles.operationValue}>{bech32DrepId ?? drepID}</Text>
    </View>
  )
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
