import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button} from '../../../components/Button/Button'
import {Icon} from '../../../components/Icon'
import {Text} from '../../../components/Text'
import {useStrings} from './strings'

type Props = {
  onPress(): void
  onClose?(): void
}

export const ConsiderDelegatingToYoroiBanner = ({onPress, onClose}: Props) => {
  const {styles, colors} = useStyles()
  const {title, description, cta} = useStrings()
  return (
    <LinearGradient start={{x: 1, y: 1}} end={{x: 0, y: 0}} colors={colors.gradient} style={styles.gradient}>
      <View style={styles.root}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon.Close color={colors.icon} size={20} />
          </TouchableOpacity>
        )}

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.description}>{description}</Text>

        <Button style={styles.primaryButton} type="Secondary" size="S" onPress={onPress} title={cta} />
      </View>
    </LinearGradient>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    closeButton: {
      ...atoms.absolute,
      right: atoms.px_lg.paddingRight,
      top: atoms.py_lg.paddingTop,
      width: 20,
      height: 20,
      zIndex: 1,
    },
    primaryButton: {
      ...atoms.self_start,
    },
    gradient: {
      ...atoms.relative,
      ...atoms.rounded_sm,
    },
    root: {
      ...atoms.py_lg,
      ...atoms.px_lg,
      minHeight: 134,
      position: 'relative',
    },
    title: {
      color: color.gray_max,
      ...atoms.font_semibold,
      ...atoms.body_1_lg_medium,
    },
    description: {
      color: color.gray_max,
      ...atoms.font_normal,
      ...atoms.body_2_md_regular,
      ...atoms.pb_lg,
      maxWidth: 279,
    },
  })

  const colors = {
    gradient: color.bg_gradient_1,
    icon: color.gray_max,
  }

  return {styles, colors}
}
