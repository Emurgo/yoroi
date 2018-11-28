// @flow
import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
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
    flex: 1,
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
