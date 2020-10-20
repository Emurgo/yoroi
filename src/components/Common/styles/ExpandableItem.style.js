// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  labelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  icon: {
    marginLeft: 5,
  },
  disabled: {
    color: COLORS.DISABLED,
  },
  contentWrapper: {
    padding: 16,
  },
})
