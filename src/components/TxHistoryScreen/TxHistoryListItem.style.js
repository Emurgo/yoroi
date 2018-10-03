import stylesConfig from '../../styles/config'

const styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    paddingTop: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positiveAmount: {
    color: stylesConfig.positiveAmountColor,
  },
  negativeAmount: {
    color: stylesConfig.negativeAmountColor,
  },
  adaSignContainer: {
    marginLeft: 5,
  },
}

export default styles
