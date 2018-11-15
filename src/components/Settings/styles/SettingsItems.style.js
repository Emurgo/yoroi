// @flow
import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  label: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionContent: {
    marginHorizontal: 16,
    elevation: 1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 12,
    shadowOpacity: 0.06,
    shadowColor: 'black',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 5,
    paddingHorizontal: 28,
  },
})
