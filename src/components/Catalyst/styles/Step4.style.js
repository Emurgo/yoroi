// @flow
import {StyleSheet} from 'react-native'
import common from './common.style'

export default StyleSheet.create({
  ...common,
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
})
