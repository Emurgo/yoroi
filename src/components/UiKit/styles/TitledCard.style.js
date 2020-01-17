// @flow

import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    lineHeight: 24,
    color: '#4A4A4A',
  },
  inner: {
    flex: 1,
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 1,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
})
