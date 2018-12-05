// @flow
import React from 'react'
import {TouchableOpacity} from 'react-native'

import {Text, Banner} from '../UiKit'

type Props = {|
  text: string,
  action?: () => any,
|}

const WarningBanner = ({text, action}: Props) => (
  <Banner error text={text}>
    {action && (
      <TouchableOpacity
        onPress={action}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      >
        <Text small>Reload</Text>
      </TouchableOpacity>
    )}
  </Banner>
)

export default WarningBanner
