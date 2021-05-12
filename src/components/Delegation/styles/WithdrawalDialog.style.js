// @flow
import {StyleSheet} from 'react-native'

import {theme} from '../../../styles/config'

export default StyleSheet.create({
  paragraph: {
    marginBottom: theme.spacing.paragraphBottomMargin,
    ...theme.text,
  },
})
