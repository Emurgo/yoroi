// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    padding: 16,
  },
  containerQR: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  address: {
    lineHeight: 24,
    height: 'auto',
    paddingVertical: 8,
  },
  actions: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

})

export default styles
