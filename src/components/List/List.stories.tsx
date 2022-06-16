import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Image, StyleSheet, View} from 'react-native'

import emptyListImage from '../../assets/img/no_transactions.png'
import {Spacer} from '../Spacer'
import {Text} from '../Text'
import {DataElement, List} from './List'

const data = [
  {text: 'aaaa', id: 'aaaaa'},
  {text: '简体中文', id: '简体中文'},
  {text: 'cccc', id: 'cccc'},
  {text: 'ddddd', id: 'ddddd'},
  {text: 'wwwww', id: 'wwwww'},
  {text: 'Ccccc', id: 'Ccccc'},
  {text: '日本語', id: '日本語'},
  {text: 'uuuu', id: 'uuuu'},
  {text: '3333', id: '3333'},
  {text: '646657', id: '646657'},
  {text: 'awerfff', id: 'awerfff'},
  {text: 'dfffff', id: 'dfffff'},
  {text: 'wstttt', id: 'wstttt'},
  {text: 'aaaawwerrtt', id: 'aaaawwerrtt'},
  {text: 'hhhhhh', id: 'hhhhhh'},
]

function EmptyList() {
  return (
    <View style={styles.listEmpty}>
      <Spacer height={100} />
      <Image style={styles.emptyListImage} source={emptyListImage} />
      <Spacer height={20} />
      <Text style={styles.emptyListText}>No text found</Text>
    </View>
  )
}

type Props = {
  data: Array<DataElement>
  withSearch?: boolean
  placeholderText: string
  EmptyListComponent: React.FunctionComponent
}

function TestComponent({withSearch, data, placeholderText, EmptyListComponent}: Props) {
  const [idSelected, setIdSelected] = React.useState<string>('')

  return (
    <List
      idSelected={idSelected}
      setIdSelected={setIdSelected}
      withSearch={withSearch}
      data={data}
      placeholderText={placeholderText}
      EmptyListComponent={EmptyListComponent}
    />
  )
}

const styles = StyleSheet.create({
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListImage: {},
  emptyListText: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 30,
  },
})

storiesOf('SearchableList', module)
  .add('Default', () => <TestComponent data={data} placeholderText="Search Text" EmptyListComponent={EmptyList} />)
  .add('Without Search', () => (
    <TestComponent withSearch={false} data={data} placeholderText="Search Text" EmptyListComponent={EmptyList} />
  ))
