// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  passwordRequirementsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  passwordRequirement: {
    flexDirection: 'row',
    width: '50%',
  },
  validationPasses: {
    color: COLORS.LIGHT_POSITIVE_GREEN,
  },
})
