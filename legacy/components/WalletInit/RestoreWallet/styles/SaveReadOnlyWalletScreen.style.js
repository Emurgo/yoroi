// @flow

import {StyleSheet} from 'react-native'

import {theme} from '../../../../styles/config'

const SECTION_MARGIN = 22
const LABEL_MARGIN = 6

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.BACKGROUND,
    paddingHorizontal: 16,
  },
  scrollView: {
    paddingRight: 10,
  },
  walletInfoContainer: {
    marginTop: SECTION_MARGIN,
  },
  label: {
    marginBottom: LABEL_MARGIN,
  },
  checksumContainer: {
    marginBottom: SECTION_MARGIN,
  },
  checksumView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderColor: 'red',
    flexWrap: 'wrap',
  },
  checksumText: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 12,
  },
  addressesContainer: {
    marginBottom: SECTION_MARGIN,
  },
  keyAttributesContainer: {
    marginTop: SECTION_MARGIN,
  },
  keyView: {
    padding: 4,
    backgroundColor: theme.COLORS.CODE_STYLE_BACKGROUND,
    marginBottom: 10,
  },
  walletFormStyle: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  walletFormButtonStyle: {
    marginHorizontal: 0,
  },
})
