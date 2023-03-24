import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '../../../components'
import {TxHistoryRouteNavigation} from '../../../navigation'
import {COLORS} from '../../../theme'

type Props = {
  disabled?: boolean
}
export const ScannerButton = ({disabled}: Props) => {
  const navigateTo = useNavigateTo()

  const color = disabled ? COLORS.TEXT_INPUT : 'black'

  return (
    <TouchableOpacity onPress={navigateTo.reader} disabled={disabled}>
      <Icon.Qr color={color} size={30} />
    </TouchableOpacity>
  )
}

const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    reader: () => navigation.navigate('send-read-qr-code'),
  }
}
