import {Platform} from 'react-native'

// export const defaultNavigationOptions = {
//   headerStyle: {
//     backgroundColor: COLORS.BACKGROUND_BLUE,
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   headerTintColor: '#fff',
// } as const

export const defaultStackNavigatorOptions = {
  headerTitleAlign: 'center',
  headerBackTitleVisible: false,
  headerLeftContainerStyle: {
    paddingLeft: Platform.OS === 'ios' ? 8 : undefined,
  },
} as const
