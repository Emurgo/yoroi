// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  container: {},
  input: {
    borderColor: COLORS.PRIMARY,
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    fontSize: 20,
    height: 50,
    width: '100%',
  },
  label: {
    color: COLORS.PRIMARY,
  },
  error: {
    color: COLORS.RED,
  },
})
