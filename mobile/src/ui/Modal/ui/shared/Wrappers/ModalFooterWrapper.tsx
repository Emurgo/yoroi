import {atoms as a} from '@yoroi/theme'

import {View, ViewProps} from 'react-native'

export const ModalFooterWrapper = ({
  children,
  ...props
}: React.PropsWithChildren<ViewProps>) => {
  return (
    <View style={[a.gap_lg, a.self_stretch]} {...props}>
      {children}
    </View>
  )
}
