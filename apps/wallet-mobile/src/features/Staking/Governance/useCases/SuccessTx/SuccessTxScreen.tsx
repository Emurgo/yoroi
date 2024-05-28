import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useUnsafeParams, useWalletNavigation} from '../../../../../kernel/navigation'
import {useNavigateTo, useStrings} from '../../common'
import {Routes} from '../../common/navigation'
import {SuccessTxImage} from '../../illustrations'
import {GovernanceKindMap} from '../../types'

export const SuccessTxScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const navigate = useNavigateTo()
  const walletNavigateTo = useWalletNavigation()
  const params = useUnsafeParams<Routes['staking-gov-tx-success']>()
  const {track} = useMetrics()

  const navigateToStaking = params?.navigateToStaking ?? false

  useFocusEffect(
    React.useCallback(() => {
      if (!params) return
      track.governanceTransactionSuccessPageViewed({governance_selection: GovernanceKindMap[params.kind]})
    }, [params, track]),
  )

  const handleOnPress = () => {
    if (navigateToStaking) {
      walletNavigateTo.navigateToStakingDashboard()
      return
    }
    navigate.home()
  }

  return (
    <View style={styles.root}>
      <Spacer fill />

      <View style={styles.center}>
        <SuccessTxImage />

        <Spacer height={24} />

        <Text style={styles.title}>{strings.thankYouForParticipating}</Text>

        <Spacer height={16} />

        {navigateToStaking ? (
          <Text style={styles.description}>{strings.readyToCollectRewards}</Text>
        ) : (
          <>
            <Text style={styles.description}>{strings.thisTransactionCanTakeAWhile}</Text>

            <Spacer height={16} />

            <Text style={styles.description}>{strings.participationBenefits}</Text>
          </>
        )}
      </View>

      <Spacer fill />

      <Button
        title={navigateToStaking ? strings.goToStaking : strings.goToGovernance}
        shelleyTheme
        onPress={handleOnPress}
      />

      <Spacer height={6} />
    </View>
  )
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      padding: 16,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: 'Rubik-Medium',
      fontSize: 20,
      lineHeight: 30,
      color: color.gray_cmax,
      fontWeight: '500',
      textAlign: 'center',
    },
    description: {
      fontFamily: 'Rubik-Regular',
      fontSize: 16,
      lineHeight: 24,
      color: color.gray_c600,
      textAlign: 'center',
    },
  })

  return styles
}
