// @flow
import {StyleSheet} from 'react-native'
import common from './common.style'

export default StyleSheet.create({
  ...common,
  container: {
    ...common.container,
    justifyContent: 'space-between',
  },
})
