import {useNavigation} from '@react-navigation/native'
import {StackNavigationOptions} from '@react-navigation/stack'
import React, {createContext, ReactNode, useContext, useReducer} from 'react'
import {TextInput, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {Icon} from '../components/Icon'
import {defaultStackNavigationOptionsV2} from '../navigation'

type SearchState = {
  search: string
  visible: boolean
}
type SearchActions = {
  searchChanged: (search: string) => void
  clearSearch: () => void
  showSearch: () => void
  hideSearch: () = void
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
    searchChanged: (search: string) => dispatch({type: 'searchChanged', search}),
    showSearch: () => dispatch({type: 'showSearch'}),
    hideSearch: () => dispatch({type: 'hideSearch'}),
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [state, actions])

  return <SearchContext.Provider value={context}>{children}</SearchContext.Provider>
}

type SearchAction =
  | {type: 'clear'}
  | {type: 'searchChanged'; search: string}
  | {type: 'showSearch'}
  | {type: 'hideSearch'}

function searchReducer(state: SearchState, action: SearchAction) {
  switch (action.type) {
    case 'clear':
      return {...state, search: ''}

    case 'searchChanged':
      return {
        ...state,
        search: action.search,
      }

    case 'showSearch':
      return {
        ...state,
        visible: true,
      }

    case 'hideSearch':
      return {
        ...state,
        visible: false,
      }

    default:
      throw new Error(`searchReducer invalid action`)
  }
}

const defaultState: SearchState = Object.freeze({search: '', visible: false})

export const useSearchOnNavBar = ({
  placeholder,
  title,
  noBack = false,
}: {
  placeholder: string
  title: string
  noBack?: boolean
}) => {
  const navigation = useNavigation()

  const {search, visible, showSearch, hideSearch, clearSearch} = useSearch()

  const handleCloseSearch = () => {
    hideSearch()
    clearSearch()
  }
  const handleGoBack = () => {
    handleSearchClose()
    if (!inputSearchVisible) navigation.goBack()
  }

  const withSearchInput: StackNavigationOptions = {
    ...defaultStackNavigationOptionsV2,
    headerTitle: () => <InputSearch placeholder={placeholder} />,
    headerRight: () => (search.length > 0 ? <EraseButton onPress={handleSearchClose} /> : null),
    headerLeft: () => <BackButton onPress={handleGoBack} />,
    headerTitleAlign: 'left',
    headerTitleContainerStyle: {
      flex: 1,
    },
    headerBackTitleVisible: false,
  }

  const withSearchButton: StackNavigationOptions = {
    ...defaultStackNavigationOptionsV2,
    headerTitle: title,
    headerRight: () => <SearchButton onPress={() => inputSearchVisibleChanged(true)} />,
    ...(noBack ? {headerLeft: () => null} : {}),
    headerBackTitleVisible: false,
  }

  React.useLayoutEffect(() => {
    navigation.setOptions(inputSearchVisible ? withSearchInput : withSearchButton)
  })
}

type Props = {
  placeholder: string
}
const InputSearch = ({placeholder}: Props) => {
  const {search, searchChanged} = useSearch()

  return (
    <TextInput
      autoFocus
      value={search}
      placeholder={placeholder}
      onChangeText={(search) => searchChanged(search)}
      autoCapitalize="none"
      style={{flex: 1}}
    />
  )
}

const SearchButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props}>
    <Icon.Magnify size={26} />
  </TouchableOpacity>
)

const EraseButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props}>
    <Icon.Cross size={20} />
  </TouchableOpacity>
)

const BackButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props}>
    <Icon.Chevron direction="left" color="#000000" />
  </TouchableOpacity>
)
