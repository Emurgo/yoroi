import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {useWindowDimensions, View} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'

import {useLastDateAddressUsed} from '~/features/Receive/common/useLastDateAddressUsed'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Text} from '~/ui/Text/Text'
import {isEmptyString} from '~/wallets/utils/string'
import {Copiable} from '../Copiable'

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
  const {palette: p} = useTheme()
  const screenWidth = useWindowDimensions().width

  const hasStakingHash = !isEmptyString(stakingHash)
  const hasSpendingHash = !isEmptyString(spendingHash)

  const handleAddressOnCopy = () => {
    track.receiveCopyAddressClicked({
      copy_address_location: 'Tap Address Details',
    })
  }

  return (
    <View
      style={[
        {
          borderRadius: 16,
          alignItems: 'center',
          flex: 1,
          minHeight: 394,
          alignSelf: 'center',
          overflow: 'hidden',
          width: screenWidth - 34,
        },
        a.px_lg,
        a.py_2xl,
        {gap: 16},
      ]}
    >
      <LinearGradient
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 1,
          },
        ]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={p.bg_gradient_1}
      />

      <Text style={[a.heading_3_medium, {color: p.gray_max}]}>
        {strings.receive.walletAddress}
      </Text>

      <View style={{alignSelf: 'stretch'}}>
        <Text
          style={[a.body_2_md_regular, {color: p.gray_600, textAlign: 'left'}]}
        >
          {strings.receive.address}
        </Text>

        <View style={[a.flex_row, {gap: 4}]}>
          <Text
            style={[
              a.body_1_lg_regular,
              {color: p.gray_900, lineHeight: 24, textAlign: 'left', flex: 1},
            ]}
          >
            {address}
          </Text>

          <Copiable
            text={address}
            onCopy={handleAddressOnCopy}
            feedback={strings.receive.addressCopiedMsg}
          />
        </View>
      </View>

      {hasStakingHash && (
        <View style={{alignSelf: 'stretch'}}>
          <Text
            style={[
              a.body_2_md_regular,
              {color: p.gray_600, textAlign: 'left'},
            ]}
          >
            {strings.receive.stakingKeyHash}
          </Text>

          <View style={[a.flex_row, {gap: 4}]}>
            <Text
              style={[
                a.body_1_lg_regular,
                {color: p.gray_900, lineHeight: 24, textAlign: 'left', flex: 1},
              ]}
            >
              {stakingHash}
            </Text>

            <Copiable text={stakingHash} feedback={strings.receive.addressCopiedMsg} />
          </View>
        </View>
      )}

      {hasSpendingHash && (
        <View style={{alignSelf: 'stretch'}}>
          <Text
            style={[
              a.body_2_md_regular,
              {color: p.gray_600, textAlign: 'left'},
            ]}
          >
            {strings.receive.spendingKeyHash}
          </Text>

          <View style={[a.flex_row, {gap: 4}]}>
            <Text
              style={[
                a.body_1_lg_regular,
                {color: p.gray_900, lineHeight: 24, textAlign: 'left', flex: 1},
              ]}
            >
              {spendingHash}
            </Text>

            <Copiable text={spendingHash} feedback={strings.receive.addressCopiedMsg} />
          </View>
        </View>
      )}

      {Boolean(lastUsed) && (
        <View style={{alignSelf: 'stretch'}}>
          <Text
            style={[
              a.body_2_md_regular,
              {color: p.gray_600, textAlign: 'left'},
            ]}
          >
            {strings.receive.lastUsed}
          </Text>

          <View style={[a.flex_row, {gap: 4}]}>
            <Text
              style={[
                a.body_1_lg_regular,
                {color: p.gray_900, lineHeight: 24, textAlign: 'left', flex: 1},
              ]}
            >
              {lastUsed}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
