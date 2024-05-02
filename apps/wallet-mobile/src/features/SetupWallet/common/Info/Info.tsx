import * as React from 'react'
import {StyleSheet} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Spacer} from '../../../../components'
import {Info as InfoIcon} from '../../illustrations/Info'

export const Info = ({onPress, paddingTop}: {onPress: () => void; paddingTop?: number}) => {
  const {styles} = useStyles()

  return (
    <TouchableOpacity style={styles.info} onPress={onPress}>
      {paddingTop !== undefined && <Spacer height={paddingTop} />}

      <InfoIcon size={24} />
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const styles = StyleSheet.create({
    info: {
      height: 24,
    },
  })

  return {styles} as const
}
