// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const headingTextStyle = {
  color: COLORS.WHITE,
  textAlign: 'center',
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  main: {
    flex: 1,
  },
  mainPadded: {
    paddingTop: 25,
  },
  goBack: {
    width: 30,
  },
  chevron: {
    tintColor: COLORS.WHITE,
    marginVertical: 10,
  },
  heading: {
    ...headingTextStyle,
    fontSize: 22,
    lineHeight: 28,
  },
  subHeadingContainer: {
    marginVertical: 10,
  },
  subHeading: {
    ...headingTextStyle,
  },
  imageContainer: {
    marginVertical: 20,
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(110, 110, 255, 0.4)',
    borderRadius: 8,
  },
  image: {
    height: 120,
    width: 120,
  },
  welcomeMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeMessageText: {
    ...headingTextStyle,
    fontSize: 50,
    lineHeight: 60,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  error: {
    color: COLORS.RED,
    fontSize: 18,
    lineHeight: 25,
    marginBottom: 17,
    textAlign: 'center',
  },
})

export default styles
