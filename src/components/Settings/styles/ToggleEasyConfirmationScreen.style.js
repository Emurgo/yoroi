// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  main: {
    flex: 1,
  },
  mainCentered: {
    justifyContent: 'center',
  },
  heading: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  warning: {
    color: COLORS.RED,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
})

export default styles
