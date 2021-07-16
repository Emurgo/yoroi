// @flow

import {StyleSheet} from 'react-native'

import {spacing, COLORS} from '../../../styles/config'

export default StyleSheet.create({
  scrollView: {
    paddingRight: 10,
    marginBottom: 12,
  },
  paragraph: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 22,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    marginBottom: spacing.paragraphBottomMargin,
  },
  button: {
    marginHorizontal: 10,
  },
  addressDetailsView: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowOffset: {width: 2, height: 2},
    shadowRadius: 12,
    shadowOpacity: 1,
    shadowColor: COLORS.SHADOW_COLOR,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 8,
  },
})
