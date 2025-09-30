import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'
import {SafeAreaViewProps} from 'react-native-safe-area-context'

import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Text} from '~/ui/Text/Text'

type Props = SafeAreaViewProps & {
  title?: string
  footer?: React.ReactNode
}

export const ModalWrapper = ({
  title,
  footer,
  children,
  edges,
  ...rest
}: Props) => {
  const {atoms: ta} = useTheme()

  return (
    <SafeArea edges={edges} style={[a.justify_between]} {...rest}>
      {title && (
        <View style={[a.py_sm, a.px_lg]}>
          <Text style={[a.heading_3_medium, ta.text_gray_max, a.text_center]}>
            {title}
          </Text>
        </View>
      )}

      {children}

      {footer && <View style={[a.p_lg, a.align_end]}>{footer}</View>}
    </SafeArea>
  )
}
