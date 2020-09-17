// @flow

import {StyleSheet} from 'react-native'

import stylesConfig, {spacing, COLORS} from '../../../styles/config'

const text = {
  fontFamily: stylesConfig.defaultFont,
  color: COLORS.BLACK,
  lineHeight: 18,
  fontSize: 14,
}

const styles = StyleSheet.create({
  scrollView: {
    paddingRight: 10,
  },
  headerView: {
    alignItems: 'center',
  },
  title: {
    ...text,
    marginBottom: spacing.paragraphBottomMargin,
  },
  image: {
    marginBottom: spacing.paragraphBottomMargin,
  },
  paragraph: {
    ...text,
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
  },
  errorSection: {
    marginVertical: 16,
  },
  errorSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  showErrorTrigger: {
    flex: 1,
    ...text,
    color: COLORS.SECONDARY_TEXT,
  },
  errorSectionView: {
    elevation: 1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 12,
    shadowOpacity: 0.06,
    shadowColor: 'black',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  errorSectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
})

export default styles
