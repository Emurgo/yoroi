import React, {useState} from 'react'
import {FlatList, StyleSheet, View} from 'react-native'

import {LanguagePickerListItem} from './LanguagePickerListItem'
import {LanguagePickerListSearchInput} from './LanguagePickerListSearchInput'

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
    <View style={styles.container}>
      {withSearch && (
        <LanguagePickerListSearchInput
          setItemToSearch={setItemToSearch}
          text={itemToSearch}
          placeholderText={placeholderText}
        />
      )}

      <FlatList
        data={dataFiltered}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <LanguagePickerListItem
            text={item.text}
            onItemPressed={() => onItemPressed(item)}
            selected={idSelected === item.id}
          />
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

function HR(props) {
  return <View {...props} style={styles.hr} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  list: {
    paddingHorizontal: 16,
  },
  hr: {
    height: 1,
    backgroundColor: '#DCE0E9',
  },
})

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
