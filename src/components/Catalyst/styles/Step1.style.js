// @flow
import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
    marginBottom: 8,
    flex: 1,
  },
  pinContainer: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  pin: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9B9B9B',
    borderRadius: 6,
    width: 56,
    height: 56,
  },
  pinNumber: {
    color: '#242838',
  },
})
