// @flow
import {StyleSheet} from 'react-native'

const phrase = {
  lineHeight: 24,
  borderColor: '#9b9b9b',
}

export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  container: {
    marginTop: 10,
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  phrase: {
    ...phrase,
  },
  iosPhrase: {
    ...phrase,
    height: 'auto',
    marginTop: 24,
  },
})
