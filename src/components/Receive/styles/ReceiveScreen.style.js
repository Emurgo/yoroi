// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    paddingVertical: 24,
  },
  address: {
    alignItems: 'center',
  },
  heading: {
    paddingHorizontal: 28,
    marginTop: 16,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  safeAreaView: {
    flex: 1,
  },
  addressListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
})
