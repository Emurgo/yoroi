import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'

export const ImportReadOnlyWalletScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <View style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <ScrollView style={[a.flex_1, a.p_lg]}>
        <View style={[a.flex_1, a.align_center, a.justify_center]}>
          <Text style={[a.heading_3_medium, {color: p.text_gray_max}]}>
            {strings.setupWallet.importReadOnlyWallet.title}
          </Text>

          <Space.Height.lg />

          <Text style={[a.body_1_lg_regular, {color: p.text_gray_max}]}>
            {strings.setupWallet.importReadOnlyWallet.description}
          </Text>

          <Space.Height.lg />

          <TextInput
            label={strings.setupWallet.importReadOnlyWallet.walletAddress}
            placeholder={strings.setupWallet.importReadOnlyWallet.walletAddressPlaceholder}
            autoFocus
            autoComplete="off"
          />

          <Space.Height.lg />

          <Button
            title={strings.setupWallet.importReadOnlyWallet.import}
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  )
}
