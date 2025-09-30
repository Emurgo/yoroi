import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {ScrollViewProps} from 'react-native'

import {ScrollView} from '~/ui/ScrollView/ScrollView'

export const ModalContentWrapper = ({
  children,
  style,
  ...rest
}: React.PropsWithChildren<ScrollViewProps>) => {
  return (
    <ScrollView
      style={[a.flex_1, style]}
      contentContainerStyle={[a.px_lg]}
      bounces={false}
      focusable
      {...rest}
    >
      {children}
    </ScrollView>
  )
}
