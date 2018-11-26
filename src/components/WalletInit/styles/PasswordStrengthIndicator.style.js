// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  container: {
    marginTop: 16,
  },
  row: {
    marginTop: 8,
    flexDirection: 'row',
  },
  label: {
    marginLeft: 4,
  },
  validationPasses: {
    color: COLORS.LIGHT_POSITIVE_GREEN,
  },
})
