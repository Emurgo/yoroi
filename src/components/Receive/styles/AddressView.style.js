// @flow
import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    elevation: 1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 12,
    shadowOpacity: 0.06,
    shadowColor: 'black',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  index: {
    paddingRight: 8,
  },
  text: {
    paddingRight: 36,
    paddingLeft: 5,
  },
  image: {
    width: 24,
    height: 24,
  },
})
