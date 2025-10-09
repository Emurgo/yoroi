import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Image, Text, View} from 'react-native'

import OrganizeWalletImage from '~/assets/img/organize-wallet-utxos.png'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/useScrollView'

export const UtxoConsolidation = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {scrollViewRef} = useScrollView()
  // TODO: Needs tx building with utxo selection
  const shouldShowNotice = true
  const handleOnPress = () => null

  return (
    <SafeArea>
      <ScrollView ref={scrollViewRef} bounces={false}>
        <View style={[a.p_lg, a.gap_lg]}>
          <Image
            source={OrganizeWalletImage}
            style={[a.w_full, {resizeMode: 'contain'}]}
          />

          <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
            {strings.transactions.utxo.utxoConsolidationTitle}
          </Text>

          {shouldShowNotice && (
            <View
              style={[
                a.p_lg,
                a.gap_md,
                a.rounded_sm,
                {backgroundColor: p.sys_cyan_100},
              ]}
            >
              <Icon.Info size={20} color={ta.el_gray_max.color} />

              <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
                {strings.transactions.utxo.utxoConsolidationWarning}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <SafeArea.Footer>
        <Button
          onPress={handleOnPress}
          title={strings.transactions.utxo.organizeWalletButton}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
