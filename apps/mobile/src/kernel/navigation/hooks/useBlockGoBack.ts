import {useNavigation} from '@react-navigation/native'
import * as React from 'react'

export const useBlockGoBack = () => {
  const navigation = useNavigation()

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type !== 'RESET') {
        e.preventDefault()
      }
    })
    return () => unsubscribe()
  }, [navigation])
}
