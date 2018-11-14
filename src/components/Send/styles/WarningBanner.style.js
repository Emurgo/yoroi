import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  text: {
    color: COLORS.RED,
    flex: 1,
    marginHorizontal: 10,
    lineHeight: 20,
  },
})

export default style
