import stylesConfig from '../../styles/config'

const styles = {
  container: {
    flexShrink: 1,
    padding: 5,
    backgroundColor: '#fff',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestampContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 15,
  },
  positiveAmount: {
    color: stylesConfig.positiveAmountColor,
    fontSize: 20,
  },
  negativeAmount: {
    color: stylesConfig.negativeAmountColor,
    fontSize: 20,
  },
  adaSignContainer: {
    marginLeft: 5,
  },
  label: {
    fontSize: 17,
  },
  section: {
    marginTop: 10,
  }
}

export default styles
