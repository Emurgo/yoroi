import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {ScrollViewProps, StyleSheet} from 'react-native'

import {ScrollView} from '~/ui/ScrollView/ScrollView'

export const ModalContentWrapper = ({
  children,
  style,
  ...rest
}: React.PropsWithChildren<ScrollViewProps>) => {
  return (
    <ScrollView
      style={[a.flex_1]}
      contentContainerStyle={StyleSheet.flatten([a.px_lg, style])}
      bounces={false}
      focusable
      {...rest}
    >
      {children}
    </ScrollView>
  )
}
