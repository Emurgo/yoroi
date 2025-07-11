import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, useWindowDimensions, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {isEmptyString} from '../../../kernel/utils'
import {useLastDateAddressUsed} from '../../features/Receive/common/useLastDateAddressUsed'
import {useStrings} from '../../features/Receive/common/useStrings'
import {Copiable} from '../Copiable'
import {Text} from '../Text/Text'

type AddressDetailsProps = {
  address: string
  stakingHash?: string
  spendingHash?: string
}

export const ShareDetailsCard = ({
  address,
  spendingHash,
  stakingHash,
}: AddressDetailsProps) => {
  const strings = useStrings()
  const {track} = useMetrics()
  const lastUsed = useLastDateAddressUsed(address)
  const {color} = useTheme()
  const screenWidth = useWindowDimensions().width

  const hasStakingHash = !isEmptyString(stakingHash)
  const hasSpendingHash = !isEmptyString(spendingHash)

  const handleAddressOnCopy = () => {
    track.receiveCopyAddressClicked({
      copy_address_location: 'Tap Address Details',
    })
  }

  return (
    <View style={[styles.addressDetails, {width: screenWidth - 34}]}>
      <LinearGradient
        style={[StyleSheet.absoluteFill, {opacity: 1}]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={color.bg_gradient_1}
      />

      <Text style={[styles.title, {color: color.gray_max}]}>
        {strings.walletAddress}
      </Text>

      <View style={styles.textSection}>
        <Text style={[styles.textAddress, {color: color.gray_600}]}>
          {strings.address}
        </Text>

        <View style={styles.textRow}>
          <Text style={[styles.textAddressDetails, {color: color.gray_900}]}>
            {address}
          </Text>

          <Copiable
            text={address}
            onCopy={handleAddressOnCopy}
            feedback={strings.addressCopiedMsg}
          />
        </View>
      </View>

      {hasStakingHash && (
        <View style={styles.textSection}>
          <Text style={[styles.textAddress, {color: color.gray_600}]}>
            {strings.stakingKeyHash}
          </Text>

          <View style={styles.textRow}>
            <Text style={[styles.textAddressDetails, {color: color.gray_900}]}>
              {stakingHash}
            </Text>

            <Copiable text={stakingHash} feedback={strings.addressCopiedMsg} />
          </View>
        </View>
      )}

      {hasSpendingHash && (
        <View style={styles.textSection}>
          <Text style={[styles.textAddress, {color: color.gray_600}]}>
            {strings.spendingKeyHash}
          </Text>

          <View style={styles.textRow}>
            <Text style={[styles.textAddressDetails, {color: color.gray_900}]}>
              {spendingHash}
            </Text>

            <Copiable text={spendingHash} feedback={strings.addressCopiedMsg} />
          </View>
        </View>
      )}

      {Boolean(lastUsed) && (
        <View style={styles.textSection}>
          <Text style={[styles.textAddress, {color: color.gray_600}]}>
            {strings.lastUsed}
          </Text>

          <View style={styles.textRow}>
            <Text style={[styles.textAddressDetails, {color: color.gray_900}]}>
              {lastUsed}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    ...a.heading_3_medium,
  },
  addressDetails: {
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    minHeight: 394,
    alignSelf: 'center',
    overflow: 'hidden',
    ...a.px_lg,
    ...a.py_2xl,
    gap: 16,
  },
  textAddressDetails: {
    ...a.body_1_lg_regular,
    lineHeight: 24,
    textAlign: 'left',
    flex: 1,
  },
  textAddress: {
    ...a.body_2_md_regular,
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
