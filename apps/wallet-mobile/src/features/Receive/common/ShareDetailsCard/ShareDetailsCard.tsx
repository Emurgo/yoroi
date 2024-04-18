import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, useWindowDimensions, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {CopyButton, Text} from '../../../../components'
import {useMetrics} from '../../../../metrics/metricsManager'
import {isEmptyString} from '../../../../utils/utils'
import {useStrings} from '../useStrings'
import {useLastDateAddressUsed} from './useLastDateAddressUsed'

type AddressDetailsProps = {
  address: string
  stakingHash?: string
  spendingHash?: string
}

export const ShareDetailsCard = ({address, spendingHash, stakingHash}: AddressDetailsProps) => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const {track} = useMetrics()
  const lastUsed = useLastDateAddressUsed(address)

  const hasStakingHash = !isEmptyString(stakingHash)
  const hasSpendingHash = !isEmptyString(spendingHash)

  const handleAddressOnCopy = () => {
    track.receiveCopyAddressClicked({copy_address_location: 'Tap Address Details'})
  }

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

          <CopyButton value={address} onCopy={handleAddressOnCopy} message={strings.addressCopiedMsg} />
        </View>
      </View>

      {hasStakingHash && (
        <View style={styles.textSection}>
          <Text style={[styles.textAddress, {color: colors.grayText}]}>{strings.stakingKeyHash}</Text>

          <View style={styles.textRow}>
            <Text style={styles.textAddressDetails}>{stakingHash}</Text>

            <CopyButton value={stakingHash} message={strings.addressCopiedMsg} />
          </View>
        </View>
      )}

      {hasSpendingHash && (
        <View style={styles.textSection}>
          <Text style={[styles.textAddress, {color: colors.grayText}]}>{strings.spendingKeyHash}</Text>

          <View style={styles.textRow}>
            <Text style={styles.textAddressDetails}>{spendingHash}</Text>

            <CopyButton value={spendingHash} message={strings.addressCopiedMsg} />
          </View>
        </View>
      )}

      {Boolean(lastUsed) && (
        <View style={styles.textSection}>
          <Text style={[styles.textAddress, {color: colors.grayText}]}>{strings.lastUsed}</Text>

          <View style={styles.textRow}>
            <Text style={styles.textAddressDetails}>{lastUsed}</Text>
          </View>
        </View>
      )}
    </View>
  )
}

const useStyles = () => {
  const screenWidth = useWindowDimensions().width
  const {theme} = useTheme()
  const {color, typography, padding} = theme

  const styles = StyleSheet.create({
    title: {
      ...atoms.heading_3_medium,
      color: color.gray_cmax,
    },
    addressDetails: {
      borderRadius: 16,
      width: screenWidth - 34,
      alignItems: 'center',
      flex: 1,
      minHeight: 394,
      alignSelf: 'center',
      overflow: 'hidden',
      ...atoms.px_lg,
      ...padding['y-xxl'],
      gap: 16,
    },
    textAddressDetails: {
      ...atoms.body_1_lg_regular,
      lineHeight: 24,
      textAlign: 'left',
      flex: 1,
      color: color.gray_c900,
    },
    textAddress: {
      ...atoms.body_2_md_regular,
      color: color.gray_c600,
      textAlign: 'left',
    },
    textSection: {
      alignSelf: 'stretch',
    },
    textRow: {
      flexDirection: 'row',
      gap: 4,
    },
  })

  const colors = {
    grayText: color.gray_c600,
    backgroundGradientCard: color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
