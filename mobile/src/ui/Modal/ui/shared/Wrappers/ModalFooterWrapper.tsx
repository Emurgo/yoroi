import {atoms as a} from '@yoroi/theme'

import {StyleSheet, View, ViewProps} from 'react-native'

export const ModalFooterWrapper = ({
  children,
  style,
  ...rest
}: React.PropsWithChildren<ViewProps>) => {
  return (
    <View
      style={StyleSheet.flatten([a.gap_xs, a.self_stretch, style])}
      {...rest}
    >
      {children}
    </View>
  )
}
