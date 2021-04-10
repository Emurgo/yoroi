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
  note: {
    color: '#242838',
    fontWeight: 'bold',
  },
  qrCode: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secretCode: {
    backgroundColor: '#F0F3F5',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
  },
  copyButton: {
    padding: 16,
    paddingRight: 0,
    justifyContent: 'center',
  },
  key: {
    flex: 1,
  },
})
