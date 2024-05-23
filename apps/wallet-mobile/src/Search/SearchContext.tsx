import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {StackNavigationOptions} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import {produce} from 'immer'
import React, {createContext, ReactNode, useCallback, useContext, useReducer} from 'react'
import {TextInput, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {Icon} from '../components/Icon'
import {defaultStackNavigationOptions} from '../kernel/navigation'

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

const SearchContext = createContext<undefined | (SearchState & SearchActions)>(undefined)

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
  const [state, dispatch] = useReducer(searchReducer, {...defaultState, ...initialState})
  const actions = React.useRef<SearchActions>({
    clearSearch: () => dispatch({type: 'clear'}),
    closeSearch: () => dispatch({type: 'close'}),
    searchChanged: (search: string) => dispatch({type: 'searchChanged', search}),
    showSearch: () => dispatch({type: 'showSearch'}),
    hideSearch: () => dispatch({type: 'hideSearch'}),
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [state, actions])

  return <SearchContext.Provider value={context}>{children}</SearchContext.Provider>
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

const defaultState: SearchState = Object.freeze({search: '', visible: false, isSearching: false})

export const useSearchOnNavBar = ({
  placeholder,
  title,
  noBack = false,
  onBack,
  isChild = false,
}: {
  placeholder: string
  title: string
  noBack?: boolean
  onBack?: () => void
  isChild?: boolean
}) => {
  const navigation = useNavigation()
  const {atoms, color} = useTheme()
  const defaultNavigationOptions = React.useMemo(() => defaultStackNavigationOptions(atoms, color), [atoms, color])

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
      headerRight: () => (search.length > 0 ? <EraseButton onPress={handleCloseSearch} /> : null),
      headerLeft: () => <BackButton onPress={handleGoBack} />,
      headerTitleAlign: 'left',
      headerTitleContainerStyle: {
        flex: 1,
      },
      headerBackTitleVisible: false,
    }),
    [defaultNavigationOptions, handleCloseSearch, handleGoBack, placeholder, search.length],
  )

  const withSearchButton: StackNavigationOptions = React.useMemo(
    () => ({
      ...defaultNavigationOptions,
      headerTitle: title,
      headerRight: () => <SearchButton onPress={() => showSearch()} />,
      headerLeft: () => <BackButton onPress={handleGoBack} />,
      ...(noBack ? {headerLeft: () => null} : {}),
      headerBackTitleVisible: false,
    }),
    [defaultNavigationOptions, handleGoBack, noBack, showSearch, title],
  )

  React.useLayoutEffect(() => {
    if (!isChild) navigation.setOptions(visible ? withSearchInput : withSearchButton)
  })

  useFocusEffect(
    React.useCallback(() => {
      if (isChild) navigation.getParent()?.setOptions(visible ? withSearchInput : withSearchButton)
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
  const {atoms, color} = useTheme()

  useFocusEffect(
    React.useCallback(() => {
      if (isChild)
        navigation.getParent()?.setOptions({
          ...defaultStackNavigationOptions(atoms, color),
          headerLeft: onBack ? () => <BackButton onPress={onBack} /> : undefined,
          headerRight: undefined,
          title,
        })
    }, [isChild, navigation, onBack, atoms, color, title]),
  )

  React.useLayoutEffect(() => {
    if (!isChild)
      navigation.setOptions({
        ...defaultStackNavigationOptions(atoms, color),
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
  const {color} = useTheme()

  return (
    <TextInput
      autoFocus
      value={search}
      placeholder={placeholder}
      onChangeText={(search) => searchChanged(search)}
      autoCapitalize="none"
      style={{flex: 1, color: color.el_gray_high}}
      testID="inputSearch"
      placeholderTextColor={color.text_gray_medium}
    />
  )
}

const SearchButton = (props: TouchableOpacityProps) => {
  const {color} = useTheme()

  return (
    <TouchableOpacity testID="iconSearch" {...props}>
      <Icon.Magnify size={26} color={color.text_gray_normal} />
    </TouchableOpacity>
  )
}

const EraseButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props}>
    <Icon.Cross size={20} />
  </TouchableOpacity>
)

const BackButton = (props: TouchableOpacityProps) => {
  const {color} = useTheme()

  return (
    <TouchableOpacity testID="buttonBack" {...props}>
      <Icon.Chevron direction="left" color={color.gray_cmax} />
    </TouchableOpacity>
  )
}
