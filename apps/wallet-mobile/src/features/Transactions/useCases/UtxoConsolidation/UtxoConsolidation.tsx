import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'

import OrganizeWalletImage from '../../../../assets/img/organize-wallet-utxos.png'
import {Button} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {ScrollView, useScrollView} from '../../../../components/ScrollView/ScrollView'
import {useStrings} from '../../common/strings'

export const UtxoConsolidation = () => {
  const strings = useStrings()
  const {styles, color} = useStyles()
  const {isScrollBarShown, setIsScrollBarShown, scrollViewRef} = useScrollView()
  // TODO: Needs tx building with utxo selection
  const shouldShowNotice = true
  const handleOnPress = () => null

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} bounces={false} onScrollBarChange={setIsScrollBarShown}>
        <View style={styles.content}>
          <Image source={OrganizeWalletImage} style={styles.image} />

          <Text style={styles.description}>{strings.organizeWalletDescription}</Text>

          {shouldShowNotice && (
            <View style={styles.notice}>
              <Icon.Info size={20} color={color.el_gray_max} />

              <Text style={styles.warning}>{strings.organizeWalletWarning}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.button, isScrollBarShown && styles.actionsScroll]}>
        <Button onPress={handleOnPress} title={strings.organizeWalletButton} />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    container: {
      ...atoms.flex_1,
    },
    content: {
      ...atoms.p_lg,
      ...atoms.gap_lg,
    },
    description: {
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
    },
    warning: {
      ...atoms.body_1_lg_medium,
      color: color.el_gray_medium,
    },
    image: {
      ...atoms.w_full,
      resizeMode: 'contain',
    },
    notice: {
      ...atoms.p_lg,
      ...atoms.gap_md,
      ...atoms.rounded_sm,
      backgroundColor: color.sys_cyan_100,
    },
    button: {
      ...atoms.p_lg,
    },
    actionsScroll: {
      ...atoms.border_t,
      borderTopColor: color.gray_200,
    },
  })

  return {styles, color} as const
}
