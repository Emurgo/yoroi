/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import {Platform, StyleSheet, Text, View} from 'react-native'
import {connect} from 'react-redux'
import {compose} from 'redux'

import data from './mockData/history.json'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\nCmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
})

const changeDummy = () => ({
  path: ['dummy'],
  reducer: () => 'different text',
  type: 'Change dummy text',
})

type Props = {text: string, changeDummy: () => void};
class App extends Component<Props> {
  render() {
    return (
      <View
        style={styles.container}
      >
        <Text
          style={styles.welcome}
          onPress={this.props.changeDummy}
        >Welcome to React Nativexxxx!!!{this.props.text}{data.toString()}</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    )
  }
}

export default compose(
  connect((state) => ({
    text: state.dummy,
  }), {
    changeDummy,
  }),
)(App)
