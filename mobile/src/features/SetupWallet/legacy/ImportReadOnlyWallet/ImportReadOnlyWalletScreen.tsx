import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'

export const ImportReadOnlyWalletScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <View style={[a.flex_1, ta.bg_color_max]}>
      <ScrollView style={[a.flex_1, a.p_lg]}>
        <View style={[a.flex_1, a.align_center, a.justify_center]}>
          <Text style={[a.heading_3_medium, ta.text_gray_max]}>
            {strings.setupWallet.importReadOnlyTitle}
          </Text>

          <Space.Height.lg />

          <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
            {strings.setupWallet.importReadOnlyWalletDescription}
          </Text>

          <Space.Height.lg />

          <TextInput
            label={strings.setupWallet.walletAddressLabel}
            placeholder={strings.setupWallet.walletAddressLabel}
            autoFocus
            autoComplete="off"
          />

          <Space.Height.lg />

          <Button
            title={strings.setupWallet.save}
            // TODO: REVISIT ?
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  )
}
