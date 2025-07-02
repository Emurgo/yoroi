import {useTheme} from '@yoroi/theme'
import React from 'react'
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

import {atoms as a} from '@yoroi/theme'
import {Button} from '../../../../ui/Button/Button'
import {Icon} from '../../../../ui/Icon'

type Props = {
  title: string
  icon?: ImageSourcePropType
  message: string
  buttonTitle?: string
  action?: (event?: unknown) => void
  showCloseIcon?: boolean
  onRequestClose?: () => void
  style?: ViewStyle
}

export const WarningBanner = ({
  title,
  icon,
  message,
  buttonTitle,
  action,
  showCloseIcon,
  onRequestClose,
  style,
}: Props) => {
  const {palette: p} = useTheme()

  return (
    <View
      style={[
        {
          marginTop: 24,
          marginHorizontal: 16,
          elevation: 1,
          shadowOffset: {width: 0, height: 2},
          shadowRadius: 12,
          shadowOpacity: 0.06,
          shadowColor: p.black_static,
          backgroundColor: p.primary_100,
          borderRadius: 8,
        },
        style,
      ]}
    >
      <View style={[a.flex_row, a.justify_center, {marginVertical: 10}]}>
        {icon != null && (
          <Image source={icon} style={{marginRight: 10, width: 18}} />
        )}

        <Text style={[{color: p.gray_500}, a.body_1_lg_regular]}>{title}</Text>
      </View>

      <View style={{marginVertical: 10, marginHorizontal: 16}}>
        <Text style={[{color: p.gray_900}, a.body_2_md_regular]}>
          {message}
        </Text>
      </View>

      {buttonTitle !== undefined && action !== undefined && (
        <Button
          onPress={action}
          title={buttonTitle}
          style={{marginHorizontal: 50, marginVertical: 16}}
        />
      )}

      {showCloseIcon === true && (
        <TouchableOpacity
          style={[a.absolute, a.p_sm, {top: 0, right: 0}]}
          onPress={onRequestClose}
        >
          <Icon.Cross size={22} color={p.gray_600} />
        </TouchableOpacity>
      )}
    </View>
  )
}
