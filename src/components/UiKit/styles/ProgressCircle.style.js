// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  textWrapper: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 'bold',
    color: COLORS.LIGHT_GRAY_TEXT,
    textAlign: 'center',
  },
  chart: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'relative',
  },
})

export default styles
