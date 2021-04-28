// @flow
import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollViewContentContainer: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mnemonicNote: {
    paddingBottom: 16,
  },
  mnemonicWords: {
    backgroundColor: '#fff',
    borderColor: '#9B9B9B',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mnemonicText: {
    lineHeight: 30,
    marginRight: 24,
  },
  image: {
    paddingTop: 24,
    alignItems: 'center',
  },
  button: {
    padding: 16,
  },
})
