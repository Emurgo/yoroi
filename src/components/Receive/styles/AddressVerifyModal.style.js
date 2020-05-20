// @flow
import {StyleSheet} from 'react-native'

import {spacing} from '../../../styles/config'

export default StyleSheet.create({
  scrollView: {
    paddingRight: 10,
    height: 180,
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
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 12,
    shadowOpacity: 0.06,
    shadowColor: 'black',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 8,
  },
})
