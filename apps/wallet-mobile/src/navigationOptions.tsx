import {Platform} from 'react-native'

export const defaultStackNavigatorOptions = {
  headerTitleAlign: 'center',
  headerBackTitleVisible: false,
  headerLeftContainerStyle: {
    paddingLeft: Platform.OS === 'ios' ? 8 : undefined,
  },
} as const
