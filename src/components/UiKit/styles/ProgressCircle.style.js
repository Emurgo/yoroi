// @flow

import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 'bold',
    color: '#676970',
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
