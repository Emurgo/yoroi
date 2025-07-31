import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, Text, View} from 'react-native'

import {useStrings} from '~/features/Transactions/common/strings'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {ScrollView, useScrollView} from '~/ui/ScrollView/ScrollView'
import OrganizeWalletImage from '~/assets/img/organize-wallet-utxos.png'

export const UtxoConsolidation = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {isScrollBarShown, setIsScrollBarShown, scrollViewRef} = useScrollView()
  // TODO: Needs tx building with utxo selection
  const shouldShowNotice = true
  const handleOnPress = () => null

  return (
    <View style={a.flex_1}>
      <ScrollView
        ref={scrollViewRef}
        bounces={false}
        onScrollBarChange={setIsScrollBarShown}
      >
        <View style={[a.p_lg, a.gap_lg]}>
          <Image
            source={OrganizeWalletImage}
            style={[a.w_full, {resizeMode: 'contain'}]}
          />

          <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
            {strings.organizeWalletDescription}
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
              <Icon.Info size={20} color={p.el_gray_max} />

              <Text style={[a.body_1_lg_medium, {color: p.el_gray_medium}]}>
                {strings.organizeWalletWarning}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          a.p_lg,
          isScrollBarShown && [a.border_t, {borderTopColor: p.gray_200}],
        ]}
      >
        <Button onPress={handleOnPress} title={strings.organizeWalletButton} />
      </View>
    </View>
  )
}
