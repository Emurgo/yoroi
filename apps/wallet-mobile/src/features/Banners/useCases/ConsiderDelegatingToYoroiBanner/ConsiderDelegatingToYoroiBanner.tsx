import {shouldShowDRep2UsOnStakingCenter, useBanner, useBanners} from '@yoroi/banners'
import {useTheme} from '@yoroi/theme'
import {Banners} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button} from '../../../../components/Button/Button'
import {DismissibleView} from '../../../../components/DismissableView'
import {Icon} from '../../../../components/Icon'
import {Text} from '../../../../components/Text'
import {yoroiDRepIdHex} from '../../../../kernel/constants'
import {useStrings} from '../../common/strings'

export const ConsiderDelegatingToYoroiBanner = () => {
  const {styles, colors} = useStyles()
  const {title, description, cta} = useStrings()
  const {manager} = useBanners<Banners.StorageKey>()
  const {dismiss, dismissedAt} = useBanner({id: Banners.Id.DRep2UsStakingCenter, manager})

  const handleOnClose = React.useCallback(() => dismiss(), [dismiss])
  const handleOnCta = React.useCallback(() => console.log('cta'), [])

  const shouldShow = shouldShowDRep2UsOnStakingCenter({
    yoroiDRepIdHex,
    currentDRepIdHex: 'hi',
    isStaking: true,
    dismissedAt,
  })

  return (
    <DismissibleView isVisible={shouldShow}>
      <LinearGradient start={{x: 1, y: 1}} end={{x: 0, y: 0}} colors={colors.gradient} style={styles.gradient}>
        <View style={styles.root}>
          <TouchableOpacity onPress={handleOnClose} style={styles.closeButton}>
            <Icon.Close color={colors.icon} size={20} />
          </TouchableOpacity>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.description}>{description}</Text>

          <Button style={styles.cta} type="Secondary" size="S" onPress={handleOnCta} title={cta} />
        </View>
      </LinearGradient>
    </DismissibleView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    closeButton: {
      width: 20,
      height: 20,
      right: atoms.px_lg.paddingRight,
      top: atoms.py_lg.paddingTop,
      ...atoms.absolute,
      ...atoms.z_10,
    },
    cta: {
      ...atoms.self_start,
    },
    gradient: {
      ...atoms.relative,
      ...atoms.rounded_sm,
    },
    root: {
      minHeight: 134,
      ...atoms.py_lg,
      ...atoms.px_lg,
      ...atoms.relative,
    },
    title: {
      color: color.gray_max,
      ...atoms.font_semibold,
      ...atoms.body_1_lg_medium,
    },
    description: {
      color: color.gray_max,
      maxWidth: 279,
      ...atoms.font_normal,
      ...atoms.body_2_md_regular,
      ...atoms.pb_lg,
    },
  })

  const colors = {
    gradient: color.bg_gradient_1,
    icon: color.gray_max,
  }

  return {styles, colors} as const
}
