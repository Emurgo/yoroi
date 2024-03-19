import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {Platform, StatusBar as StatusBarRN} from 'react-native'

// TODO: it should be a hook
export const StatusBar = () => {
  const {theme, isDark} = useTheme()

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBarRN.setBackgroundColor(theme.color['black-static'])
      StatusBarRN.setBarStyle('light-content')
    } else {
      StatusBarRN.setBarStyle(isDark ? 'light-content' : 'dark-content')
    }
  })

  return null
}
