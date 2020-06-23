// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  title: {
    marginVertical: 10,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  titleText: {
    color: COLORS.LIGHT_POSITIVE_GREEN,
    lineHeight: 19,
    fontSize: 16,
  },
  icon: {
    marginRight: 10,
  },
  messageText: {
    color: '#353535',
    lineHeight: 22,
    fontSize: 14,
  },
  wrapper: {
    marginTop: 24,
    marginHorizontal: 16,
    elevation: 1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 12,
    shadowOpacity: 0.06,
    shadowColor: 'black',
    backgroundColor: '#F1FDFA',
    borderRadius: 8,
  },
  close: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
  },
  body: {
    marginVertical: 10,
    marginHorizontal: 16,
  },
})
