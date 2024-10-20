import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button} from '../../../../../components/Button/Button'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {Text} from '../../../../../components/Text'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useUnsafeParams, useWalletNavigation} from '../../../../../kernel/navigation'
import {Routes, useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {SuccessTxImage} from '../../illustrations/SuccessTxImage'
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

      <Button title={navigateToStaking ? strings.goToStaking : strings.goToGovernance} onPress={handleOnPress} />

      <Spacer height={6} />
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.py_lg,
      ...atoms.px_lg,
      backgroundColor: color.bg_color_max,
    },
    center: {
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    title: {
      ...atoms.heading_3_medium,
      ...atoms.font_semibold,
      ...atoms.text_center,
      ...atoms.justify_center,
      color: color.text_gray_max,
    },
    description: {
      ...atoms.body_1_lg_regular,
      ...atoms.text_center,
      color: color.text_gray_medium,
    },
  })

  return styles
}
