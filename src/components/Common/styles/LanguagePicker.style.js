// @flow
import {StyleSheet} from 'react-native'
import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    marginBottom: 80,
    alignSelf: 'center',
  },
  ackBlock: {
    color: COLORS.LIGHT_GRAY,
    marginHorizontal: 16,
    marginBottom: 40,
  },
})
