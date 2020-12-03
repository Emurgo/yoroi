// @flow
import {StyleSheet, Dimensions} from 'react-native'

import {spacing, THEME} from '../../../../styles/config'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.BACKGROUND,
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    height: Dimensions.get('screen').height / 2,
  },
  bottomView: {
    paddingTop: 24,
    paddingHorizontal: 16,
    height: Dimensions.get('screen').height / 2,
    position: 'absolute',
    top: Dimensions.get('screen').height / 2,
    backgroundColor: THEME.COLORS.BACKGROUND, // important
  },
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
  },
})
