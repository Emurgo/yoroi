// @flow
import {StyleSheet} from 'react-native'
import common from './common.style'

export default StyleSheet.create({
  ...common,
  description: {
    alignItems: 'center',
  },
  text: {
    color: '#38393D',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '80%',
  },
  images: {
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iOS: {
    marginRight: 16,
  },
})
