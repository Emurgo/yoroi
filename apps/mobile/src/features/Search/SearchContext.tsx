import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {
  StackNavigationOptions,
  TransitionPresets,
} from '@react-navigation/stack'
import {atoms as a, ThemeAtoms, ThemedPalette, useTheme} from '@yoroi/theme'
import {produce} from 'immer'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
} from 'react'
import {
  Dimensions,
  Platform,
  TextInput,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'

import {Icon} from '~/ui/Icon'

type SearchState = {
  search: string
  visible: boolean
  isSearching: boolean
}
type SearchActions = {
  searchChanged: (search: string) => void
  clearSearch: () => void
  closeSearch: () => void
  showSearch: () => void
  hideSearch: () => void
}

const SearchContext = createContext<undefined | (SearchState & SearchActions)>(
  undefined,
)

export const useSearch = () => {
  const value = useContext(SearchContext)
  if (!value) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return value
}

export const SearchProvider = ({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: Partial<SearchState>
}) => {
  const [state, dispatch] = useReducer(searchReducer, {
    ...defaultState,
    ...initialState,
  })
  const actions = React.useRef<SearchActions>({
    clearSearch: () => dispatch({type: 'clear'}),
    closeSearch: () => dispatch({type: 'close'}),
    searchChanged: (search: string) =>
      dispatch({type: 'searchChanged', search}),
    showSearch: () => dispatch({type: 'showSearch'}),
    hideSearch: () => dispatch({type: 'hideSearch'}),
  }).current

  const context = React.useMemo(
    () => ({...state, ...actions}),
    [state, actions],
  )

  return (
    <SearchContext.Provider value={context}>{children}</SearchContext.Provider>
  )
}

type SearchAction =
  | {type: 'clear'}
  | {type: 'close'}
  | {type: 'searchChanged'; search: string}
  | {type: 'showSearch'}
  | {type: 'hideSearch'}

function searchReducer(state: SearchState, action: SearchAction) {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'clear':
        draft.search = ''
        draft.isSearching = false
        break

      case 'close':
        draft.search = ''
        draft.visible = false
        draft.isSearching = false
        break

      case 'searchChanged':
        draft.search = action.search
        draft.isSearching = action.search.length > 0 && draft.visible
        break

      case 'showSearch':
        draft.visible = true
        draft.isSearching = draft.search.length > 0
        break

      case 'hideSearch':
        draft.visible = false
        draft.isSearching = false
        break

      default:
        throw new Error(`searchReducer invalid action`)
    }
  })
}

const defaultState: SearchState = Object.freeze({
  search: '',
  visible: false,
  isSearching: false,
})

export const useSearchOnNavBar = ({
  placeholder,
  title,
  noBack = false,
  onBack,
  isChild = false,
  extraNavigationOptions,
}: {
  placeholder: string
  title: string
  noBack?: boolean
  onBack?: () => void
  isChild?: boolean
  extraNavigationOptions?: StackNavigationOptions
}) => {
  const navigation = useNavigation()
  const {palette: p} = useTheme()
  const defaultNavigationOptions = React.useMemo(
    () => defaultStackNavigationOptions(p),
    [p],
  )

  const {search, visible, showSearch, hideSearch, clearSearch} = useSearch()

  const handleCloseSearch = useCallback(() => {
    hideSearch()
    clearSearch()
  }, [hideSearch, clearSearch])

  const handleGoBack = useCallback(() => {
    handleCloseSearch()
    /*
     * goBack has two actions:
     *   1) go back when the search input is not visible
     *   2) close the search input when the search input is visible
     */
    if (visible) return true

    if (onBack) onBack()
    else navigation.goBack()

    return true
  }, [handleCloseSearch, visible, onBack, navigation])

  const withSearchInput: StackNavigationOptions = React.useMemo(
    () => ({
      ...defaultNavigationOptions,
      headerTitle: () => <InputSearch placeholder={placeholder} />,
      headerRight: () =>
        search.length > 0 ? <EraseButton onPress={handleCloseSearch} /> : null,
      headerLeft: () => <BackButton onPress={handleGoBack} />,
      headerTitleAlign: 'left',
      headerTitleContainerStyle: {
        flex: 1,
      },
      headerBackTitleVisible: false,
    }),
    [
      defaultNavigationOptions,
      handleCloseSearch,
      handleGoBack,
      placeholder,
      search.length,
    ],
  )

  const withSearchButton: StackNavigationOptions = React.useMemo(
    () => ({
      ...defaultNavigationOptions,
      title,
      headerTitle: title, // fixes issues found in some screens
      headerRight: () => <SearchButton onPress={() => showSearch()} />,
      headerLeft: () => (noBack ? null : <BackButton onPress={handleGoBack} />),
      headerBackTitleVisible: false,
      ...extraNavigationOptions,
    }),
    [
      defaultNavigationOptions,
      extraNavigationOptions,
      handleGoBack,
      noBack,
      showSearch,
      title,
    ],
  )

  React.useLayoutEffect(() => {
    if (!isChild)
      navigation.setOptions(visible ? withSearchInput : withSearchButton)
  })

  useFocusEffect(
    React.useCallback(() => {
      if (isChild)
        navigation
          .getParent()
          ?.setOptions(visible ? withSearchInput : withSearchButton)
    }, [isChild, navigation, visible, withSearchButton, withSearchInput]),
  )
}

export const useDisableSearchOnBar = ({
  title,
  isChild = false,
  onBack,
}: {
  title: string
  isChild?: boolean
  onBack?: () => void
}) => {
  const navigation = useNavigation()
  const {palette: p} = useTheme()

  useFocusEffect(
    React.useCallback(() => {
      if (isChild)
        navigation.getParent()?.setOptions({
          ...defaultStackNavigationOptions(p),
          headerLeft: onBack
            ? () => <BackButton onPress={onBack} />
            : undefined,
          headerRight: undefined,
          title,
        })
    }, [isChild, navigation, p, onBack, title]),
  )

  React.useLayoutEffect(() => {
    if (!isChild)
      navigation.setOptions({
        ...defaultStackNavigationOptions(p),
        headerLeft: onBack ? () => <BackButton onPress={onBack} /> : undefined,
        headerRight: undefined,
        title,
      })
  })
}

type Props = {
  placeholder: string
}
const InputSearch = ({placeholder}: Props) => {
  const {search, searchChanged} = useSearch()
  const {palette: p, isDark} = useTheme()

  return (
    <TextInput
      autoFocus
      value={search}
      placeholder={placeholder}
      onChangeText={(search) => searchChanged(search)}
      autoCapitalize="none"
      style={[a.flex_1, {color: p.el_gray_max}]}
      testID="inputSearch"
      placeholderTextColor={p.text_gray_medium}
      keyboardAppearance={isDark ? 'dark' : 'light'}
    />
  )
}

const SearchButton = (props: TouchableOpacityProps) => {
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity testID="iconSearch" {...props}>
      <Icon.Magnify size={26} color={p.text_gray_medium} />
    </TouchableOpacity>
  )
}

const EraseButton = (props: TouchableOpacityProps) => {
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity {...props}>
      <Icon.Cross size={20} color={p.el_gray_max} />
    </TouchableOpacity>
  )
}

const BackButton = (props: TouchableOpacityProps) => {
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity testID="buttonBack" {...props}>
      <Icon.Chevron direction="left" color={p.el_gray_max} />
    </TouchableOpacity>
  )
}

// TODO: remove code below when the main default options are ready
export const BackButton2 = (
  props: TouchableOpacityProps & {color?: string},
) => {
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity {...props} testID="buttonBack2">
      <Icon.Chevron direction="left" color={props.color ?? p.gray_max} />
    </TouchableOpacity>
  )
}

// OPTIONS
const WIDTH = Dimensions.get('window').width

export const defaultStackNavigationOptions = (
  atoms: ThemeAtoms,
  color: ThemedPalette,
): StackNavigationOptions => {
  return {
    ...(Platform.OS === 'android' && {...TransitionPresets.SlideFromRightIOS}),
    detachPreviousScreen:
      false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
    cardStyle: {
      backgroundColor: color.bg_color_max,
    },
    cardOverlay: () => (
      <View
        style={{
          flex: 1,
          backgroundColor: color.bg_color_max,
        }}
      />
    ),
    headerTintColor: color.gray_max,
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      backgroundColor: color.bg_color_max,
    },
    headerTitleStyle: {
      ...atoms.body_1_lg_medium,
      width: WIDTH - 75,
      textAlign: 'center',
    },
    headerTitleAlign: 'center',
    headerTitleContainerStyle: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerLeftContainerStyle: {
      ...atoms.pl_sm,
    },
    headerRightContainerStyle: {
      ...atoms.pr_sm,
    },
    headerLeft: (props) => <BackButton2 {...props} />,
  }
}
