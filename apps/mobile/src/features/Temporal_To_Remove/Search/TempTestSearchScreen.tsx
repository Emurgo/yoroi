import * as React from 'react'
import {
  FlatList,
  ListRenderItem,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {useSearch, useSearchOnNavBar} from '../../Search/SearchContext'

interface WordItem {
  id: string
  word: string
}

const WORD_POOL: string[] = [
  'apple',
  'banana',
  'cherry',
  'dragonfruit',
  'elderberry',
  'fig',
  'grape',
  'honeydew',
  'kiwi',
  'lemon',
  'mango',
  'nectarine',
  'orange',
  'papaya',
  'quince',
  'raspberry',
  'strawberry',
  'tangerine',
  'ugli',
  'vanilla',
  'watermelon',
  'xigua',
  'yam',
  'zucchini',
]

const generateRandomWords = (count: number = 50): WordItem[] =>
  Array.from({length: count}, (_, i) => {
    const word = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]
    return {id: `${i}`, word}
  })

const DATA: WordItem[] = generateRandomWords()

export const TempTestSearchScreen = () => {
  useSearchOnNavBar({
    title: 'Test Search',
    placeholder: 'Test Search',
  })

  const {search} = useSearch()

  const filteredData = React.useMemo(() => {
    const lower = search.toLowerCase()
    return DATA.filter((item) => item.word.toLowerCase().includes(lower))
  }, [search])

  const renderItem: ListRenderItem<WordItem> = ({item}) => (
    <View style={styles.item}>
      <Text style={styles.word}>{item.word}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  search: {
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  list: {
    paddingBottom: 16,
  },
  item: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  word: {
    fontSize: 16,
  },
})
