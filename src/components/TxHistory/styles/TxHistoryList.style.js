// @flow
import {COLORS} from '../../../styles/config'

const styles = {
  TxHistoryList: {
    flex: 1,
    marginBottom: 15,
  },
  TxHistoryList__dayContainer: {
    flex: 0,
    flexShrink: 1,
    marginTop: 10,
    marginBottom: 15,
  },
  DayHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    paddingBottom: 15,
    flex: 1,
    alignItems: 'center',
  },
  DayHeader__text: {
    color: COLORS.BLACK,
    fontSize: 20,
  },
}

export default styles
