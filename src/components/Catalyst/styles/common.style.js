// @flow

import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  scrollViewContentContainer: {
    paddingBottom: 36,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7384',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#242838',
  },
  pinContainer: {
    marginTop: 70,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  pin: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    width: 60,
    height: 60,
  },
  pinNumber: {
    fontSize: 20,
    lineHeight: 22,
    color: '#353535',
  },
  pinNormal: {
    borderWidth: 1,
    borderColor: '#9B9B9B',
  },
  mr10: {
    marginRight: 10,
  },
  mt16: {
    marginTop: 16,
  },
  mb70: {
    marginBottom: 70,
  },
  mb40: {
    marginBottom: 40,
  },
  mb16: {
    marginBottom: 16,
  },
})
