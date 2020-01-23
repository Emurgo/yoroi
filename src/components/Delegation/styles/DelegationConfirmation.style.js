// @flow
import {StyleSheet} from 'react-native'
import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  itemBlock: {
    marginTop: 24,
  },
  itemTitle: {},
  bottomBlock: {
    padding: 16,
    height: 88,
  },
})
