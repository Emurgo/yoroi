// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
    padding: 20,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: COLORS.DARK_GRAY,
  },
  formLabel: {
    color: COLORS.PRIMARY,
  },
  input: {
    borderColor: COLORS.PRIMARY,
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    fontSize: 20,
    height: 50,
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
  },
  passwordRequirementsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  passwordRequirement: {
    flexDirection: 'row',
    width: '50%',
  },
})

export default styles
