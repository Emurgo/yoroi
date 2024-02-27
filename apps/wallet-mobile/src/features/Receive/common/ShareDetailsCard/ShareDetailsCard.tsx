import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, useWindowDimensions, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {CopyButton, Text} from '../../../../components'
import {isEmptyString} from '../../../../utils/utils'
import {useStrings} from '../useStrings'

type AddressDetailsProps = {
  address: string
  stakingHash?: string
  spendingHash?: string
}

export const ShareDetailsCard = ({address, spendingHash, stakingHash}: AddressDetailsProps) => {
  const strings = useStrings()
  const {styles, colors} = useStyles()

  const hasStakingHash = !isEmptyString(stakingHash)
  const hasSpendingHash = !isEmptyString(spendingHash)

  return (
    <View style={styles.addressDetails}>
      <LinearGradient
        style={[StyleSheet.absoluteFill, {opacity: 1}]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={colors.backgroundGradientCard}
      />

      <Text style={styles.title}>{strings.walletAddress}</Text>

      <View style={styles.textSection}>
        <Text style={[styles.textAddress, {color: colors.grayText}]}>{strings.address}</Text>

        <View style={styles.textRow}>
          <Text style={styles.textAddressDetails}>{address}</Text>

          <CopyButton value={address} />
        </View>
      </View>

      {hasStakingHash && (
        <View style={styles.textSection}>
          <Text style={[styles.textAddress, {color: colors.grayText}]}>{strings.stakingKeyHash}</Text>

          <View style={styles.textRow}>
            <Text style={styles.textAddressDetails}>{stakingHash}</Text>

            <CopyButton value={stakingHash} />
          </View>
        </View>
      )}

      {hasSpendingHash && (
        <View style={styles.textSection}>
          <Text style={[styles.textAddress, {color: colors.grayText}]}>{strings.spendingKeyHash}</Text>

          <View style={styles.textRow}>
            <Text style={styles.textAddressDetails}>{spendingHash}</Text>

            <CopyButton value={spendingHash} />
          </View>
        </View>
      )}
    </View>
  )
}

const useStyles = () => {
  const screenWidth = useWindowDimensions().width
  const {theme} = useTheme()
  const {color, typography} = theme

  const styles = StyleSheet.create({
    title: {
      ...typography['heading-3-medium'],
      color: color.gray.max,
    },
    addressDetails: {
      borderRadius: 16,
      width: screenWidth - 34,
      alignItems: 'center',
      flex: 1,
      minHeight: 394,
      alignSelf: 'center',
      overflow: 'hidden',
      paddingHorizontal: 16,
      gap: 16,
      paddingTop: 32,
    },
    textAddressDetails: {
      ...typography['body-2-m-regular'],
      lineHeight: 18,
      textAlign: 'left',
      flex: 1,
      color: color.gray[900],
    },
    textAddress: {
      ...typography['body-2-m-regular'],
      color: color.gray[600],
      textAlign: 'left',
    },
    textSection: {
      gap: 4,
      alignSelf: 'stretch',
    },
    textRow: {
      flexDirection: 'row',
      gap: 4,
    },
  })

  const colors = {
    grayText: color.gray[600],
    backgroundGradientCard: color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
