// @flow
import {StyleSheet} from 'react-native'

import {spacing, THEME} from '../../../../styles/config'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.BACKGROUND,
  },
  cameraContainer: {
    backgroundColor: THEME.COLORS.BACKGROUND,
    flex: 1,
  },
  bottomView: {
    marginTop: 30,
    marginHorizontal: 20,
    flex: 1,
  },
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
  },
})
