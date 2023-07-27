import { useNavigation } from '@react-navigation/native'
import * as React from 'react'

import { QRCodeScanner } from '../../../../../components'
import { TxHistoryRouteNavigation } from '../../../../../navigation'
import { useSelectedWallet } from '../../../../../SelectedWallet'
import { asQuantity, pastedFormatter, Quantities } from '../../../../../yoroi-wallets/utils'
import { useSend } from '../../../common/SendContext'
import { useStrings } from '../../../common/strings'

export const ReadQRCodeScreen = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const wallet = useSelectedWallet()
  const {receiverChanged, amountChanged, tokenSelectedChanged} = useSend()
  const strings = useStrings()

  const handleOnRead = ({data: qrData}) => {
    const regex = /(cardano):([a-zA-Z1-9]\w+)\??/
    if (regex.test(qrData)) {
      const address = qrData.match(regex)?.[2]
      if (qrData.indexOf('?') !== -1) {
        const index = qrData.indexOf('?')
        const params = getParams(qrData.substr(index))
        if ('amount' in params) {
          receiverChanged(address ?? '')
          const amount = pastedFormatter(params?.amount ?? '')
          tokenSelectedChanged(wallet.primaryTokenInfo.id)
          amountChanged(Quantities.integer(asQuantity(amount), wallet.primaryTokenInfo.decimals ?? 0))
        }
      } else {
        receiverChanged(address ?? '')
      }
    } else {
      receiverChanged(qrData ?? '')
    }
    navigation.navigate('send-start-tx')
    return Promise.resolve(false)
  }

  return <QRCodeScanner onRead={handleOnRead} withMask maskText={strings.addressReaderQrText} />
}

const getParams = (params: string) => {
  const query = params.substr(1)
  const result: {amount?: string; address?: string} = {}
  query.split('?').forEach((part) => {
    const item = part.split('=')
    result[item[0]] = decodeURIComponent(item[1])
  })
  return result
}
