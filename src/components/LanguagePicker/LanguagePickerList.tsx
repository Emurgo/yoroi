import React, {useState} from 'react'
import {FlatList, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native'

import {Icon} from '../Icon'
import {Text} from '../Text'

export function LanguagePickerList({
  data,
  idSelected,
  setIdSelected,
  placeholderText = 'Search',
  withSearch = true,
  EmptyListComponent,
  defaultId = null,
}: Props) {
  const [itemToSearch, setItemToSearch] = useState<string>('')

  const normalizedText = normalize(itemToSearch)
  const dataFiltered = data.filter((item) => normalize(item.text).startsWith(normalizedText))
  const emptyList = itemToSearch && dataFiltered.length === 0 && EmptyListComponent ? <EmptyListComponent /> : null

  const onItemPressed = (item) => (item.id === idSelected ? setIdSelected(defaultId) : setIdSelected(item.id))

  return (
    <View style={{flex: 1}}>
      {withSearch && <Input setItemToSearch={setItemToSearch} text={itemToSearch} placeholderText={placeholderText} />}

      <FlatList
        data={dataFiltered}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <Item text={item.text} onItemPressed={() => onItemPressed(item)} selected={idSelected === item.id} />
        )}
        ItemSeparatorComponent={() => <HR />}
        ListEmptyComponent={emptyList}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}

function normalize(text: string) {
  return text.trim().toLowerCase()
}

function Item({text, onItemPressed, selected}: ItemProps) {
  return (
    <TouchableOpacity style={styles.item} onPress={onItemPressed}>
      <Text style={styles.title}>{text}</Text>
      {selected && <Icon.Check size={24} color="blue" />}
    </TouchableOpacity>
  )
}

function HR(props) {
  return <View {...props} style={styles.hr} />
}

function Input({setItemToSearch, text, placeholderText}: InputProps) {
  const [focused, setFocused] = useState<boolean>(false)

  return (
    <View style={styles.search}>
      <View style={styles.innerSearch}>
        <Icon.Magnify style={styles.searchIcon} size={30} color="#6B7384" />

        <TextInput
          value={text}
          onChangeText={setItemToSearch}
          style={focused ? styles.inputFocused : styles.inputNotFocused}
          placeholder={placeholderText}
          placeholderTextColor="#6B7384"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {text !== '' && (
          <TouchableOpacity onPress={() => setItemToSearch('')} style={styles.crossIcon}>
            <Icon.Cross size={30} color="#6B7384" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const input = {
  borderWidth: 1,
  borderColor: '#DCE0E9',
  borderRadius: 10,
  color: 'black',
  paddingRight: 8,
  paddingLeft: 45,
  paddingVertical: 15,
  fontSize: 17,
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
  },
  hr: {
    height: 1,
    backgroundColor: '#DCE0E9',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  title: {
    fontSize: 16,
  },
  inputNotFocused: {
    ...input,
  },
  inputFocused: {
    ...input,
    borderColor: 'black',
  },
  search: {
    top: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  innerSearch: {
    width: '100%',
    position: 'relative',
    padding: 8,
  },
  searchIcon: {
    position: 'absolute',
    top: 25,
    left: 18,
    zIndex: 1,
  },
  crossIcon: {
    position: 'absolute',
    top: 22,
    right: 18,
    zIndex: 1,
  },
})

type InputProps = {
  setItemToSearch: (string) => void
  text: string
  placeholderText: string
}

type ItemProps = {
  text: string
  onItemPressed: () => void
  selected: boolean
}

export type DataElement = {
  id: string
  text: string
}

type Props = {
  data: Array<DataElement>
  withSearch?: boolean
  placeholderText?: string
  EmptyListComponent?: React.FunctionComponent
  idSelected: string | null
  setIdSelected: (string) => void
  defaultId?: string | null
}
