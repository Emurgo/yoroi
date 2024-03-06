import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {Platform, StatusBar as StatusBarRN} from 'react-native'

type Props = {
  type: 'dark' | 'light'
  overrideColor?: string
}

// TODO: it should be a hook
export const StatusBar = ({overrideColor}: Props) => {
  const {theme, isDark} = useTheme()
  const backgroundColor = isDark ? theme.color['white-static'] : theme.color['black-static']

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBarRN.setBackgroundColor(theme.color['black-static'])
      StatusBarRN.setBarStyle('light-content')
    } else {
      StatusBarRN.setBarStyle(isDark ? 'light-content' : 'dark-content')
      StatusBarRN.setBackgroundColor(overrideColor ?? backgroundColor)
    }
  })

  return null
}
