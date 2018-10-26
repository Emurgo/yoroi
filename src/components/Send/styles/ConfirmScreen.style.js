import {COLORS} from '../../../styles/config'

const _item = {
  borderBottomColor: COLORS.LIGHT_GRAY,
  borderBottomWidth: 1,
  borderStyle: 'solid',
  padding: 30,
}

export default {
  balance: {
    ..._item,
    backgroundColor: COLORS.BACKGROUND_GRAY,
    padding: 20,
    flexDirection: 'row',
  },
  balanceLabel: {
    color: COLORS.GRAY,
    margin: 5,
  },
  balanceValue: {
    margin: 5,
  },
  fees: {
    width: '50%',
  },
  container: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  item: _item,
  label: {
    color: COLORS.PRIMARY,
  },
  password: {
    borderColor: COLORS.PRIMARY,
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    fontSize: 20,
    height: 50,
    width: '100%',
  },
  receiver: {
    flexWrap: 'wrap',
  },
  remainingBalance: {
    width: '50%',
  },
  transactionSummary: {
    ..._item,
    flexDirection: 'row',
  },
}
