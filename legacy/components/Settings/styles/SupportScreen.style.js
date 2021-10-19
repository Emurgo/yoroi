// @flow

import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  item: {
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemWrap: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 24,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
})
