// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  container: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_POSITIVE_GREEN,
    width: 206,
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  text: {
    color: COLORS.LIGHT_POSITIVE_GREEN,
  },
})
