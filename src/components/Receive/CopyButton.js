// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, TouchableHighlight, Clipboard} from 'react-native'

import CopyIcon from '../../assets/CopyIcon'

import {COLORS} from '../../styles/config'


type Props = {
  value: string,
  copyValue?: () => mixed,
  styles?: mixed,
};

// $FlowFixMe Flow badly infers Props with HOC composition
const CopyButton = ({styles, value, copyValue}: Props) => (
  <View style={styles}>
    <TouchableHighlight
      activeOpacity={0.9}
      underlayColor={COLORS.WHITE}
      onPress={copyValue}
    >
      <View>
        <CopyIcon width={12} height={12} />
      </View>
    </TouchableHighlight>
  </View>
)

export default compose(
  withHandlers({
    copyValue: ({value}) => () => Clipboard.setString(value),
  })
)(CopyButton)
