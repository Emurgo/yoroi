import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button} from '../../../../components/Button/Button'
import {DismissibleView} from '../../../../components/DismissableView'
import {Icon} from '../../../../components/Icon'
import {Text} from '../../../../components/Text'
import {GovernanceBackground} from '../../illustrations/GovernanceBackground'
import {useStrings} from '../strings'

type Props = {
  isVisible: boolean
  onDismiss: () => void
}

export const DelegateToYoroiDRepBanner = ({onDismiss, isVisible}: Props) => {
  const {styles, colors} = useStyles()
  const {title, description, cta} = useStrings()

  const handleOnDismiss = React.useCallback(() => onDismiss(), [onDismiss])
  const handleOnCta = React.useCallback(() => console.log('cta'), [])

  return (
    <DismissibleView isVisible={isVisible}>
      <LinearGradient start={{x: 1, y: 1}} end={{x: 0, y: 0}} colors={colors.gradient} style={styles.gradient}>
        <View style={styles.root}>
          <GovernanceBackground style={styles.backgroundImage} />
          <TouchableOpacity onPress={handleOnDismiss} style={styles.dismiss}>
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
    backgroundImage: {
      ...atoms.absolute,
      right: 0,
      bottom: 0,
    },
    dismiss: {
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
