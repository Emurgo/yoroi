import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {useUnsafeParams, useWalletNavigation} from '../../../../../navigation'
import {useNavigateTo, useStrings} from '../../common'
import {Routes} from '../../common/navigation'
import {SuccessTxImage} from '../../illustrations'

export const SuccessTxScreen = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const walletNavigateTo = useWalletNavigation()
  const params = useUnsafeParams<Routes['staking-gov-tx-success']>()

  const navigateToStaking = params?.navigateToStaking ?? false

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
    color: '#000000',
    fontWeight: '500',
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Rubik-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7384',
    textAlign: 'center',
  },
})
