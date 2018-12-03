// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingTop: '50%',
  },
  emptyText: {
    color: '#9B9B9B',
    marginTop: 32,
  },
})
