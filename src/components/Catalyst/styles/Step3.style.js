// @flow

import {StyleSheet} from 'react-native'
import common from './common.style'

export default StyleSheet.create({
  ...common,
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  mr10: {
    marginRight: 10,
  },
  pinInactive: {
    opacity: 0.5,
  },
  pinHighlight: {
    borderWidth: 2,
    borderColor: '#4A5065',
  },
})
