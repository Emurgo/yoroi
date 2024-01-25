import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {StatusBar as StatusBarRN} from 'react-native'

type Props = {
  type: 'dark' | 'light'
  overrideColor?: string
}

// TODO: it should be a hook
export const StatusBar = ({type, overrideColor}: Props) => {
  const {theme} = useTheme()
  const backgroundColor = type === 'dark' ? theme.color['white-static'] : theme.color['black-static']

  useFocusEffect(() => {
    StatusBarRN.setBackgroundColor(overrideColor ?? backgroundColor)
    StatusBarRN.setBarStyle(type === 'dark' ? 'dark-content' : 'light-content')
  })

  return null
}
