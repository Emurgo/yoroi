import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {MnemonicWordInputRef} from '../../useCases/RestoreWallet/RestoreWalletScreen'
import {MnemonicInput} from './MnemonicInput'

storiesOf('MnemonicInput', module)
  .add('valid', () => {
    const [suggestedWords, setSuggestedWords] = React.useState<Array<string>>([])
    const [mnemonicWords, setMnemonicWords] = React.useState<Array<string>>(Array.from({length}).map(() => ''))
    const mnenonicRefs = React.useRef(mnemonicWords.map(() => React.createRef<MnemonicWordInputRef>())).current
    const [_, setFocusedIndex] = React.useState<number>(0)
    const [mnemonicSelectedWords, setMnemonicSelectedWords] = React.useState<Array<string>>(
      Array.from({length: 15}).map(() => ''),
    )
    const [mnemonic, setMnemonic] = React.useState('')

    const onSelect = (index: number, word: string) => {
      setMnemonicWords((words) => {
        const newWords = [...words]
        newWords[index] = word

        return newWords
      })

      setSuggestedWords([])
    }

    const onFocus = (index: number) => {
      setFocusedIndex(index)
    }

    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <MnemonicInput
          mnenonicRefs={mnenonicRefs}
          suggestedWords={suggestedWords}
          setSuggestedWords={setSuggestedWords}
          length={15}
          onDone={setMnemonic}
          onSelect={onSelect}
          onFocus={onFocus}
          isValidPhrase={true}
          mnemonicSelectedWords={mnemonicSelectedWords}
          setMnemonicSelectedWords={setMnemonicSelectedWords}
          mnemonic={mnemonic}
        />
      </View>
    )
  })
  .add('invalid', () => {
    const [suggestedWords, setSuggestedWords] = React.useState<Array<string>>([])
    const [mnemonicWords, setMnemonicWords] = React.useState<Array<string>>(Array.from({length}).map(() => ''))
    const mnenonicRefs = React.useRef(mnemonicWords.map(() => React.createRef<MnemonicWordInputRef>())).current
    const [_, setFocusedIndex] = React.useState<number>(0)
    const [mnemonicSelectedWords, setMnemonicSelectedWords] = React.useState<Array<string>>(
      Array.from({length: 15}).map(() => ''),
    )
    const [mnemonic, setMnemonic] = React.useState('')

    const onSelect = (index: number, word: string) => {
      setMnemonicWords((words) => {
        const newWords = [...words]
        newWords[index] = word

        return newWords
      })

      setSuggestedWords([])
    }

    const onFocus = (index: number) => {
      setFocusedIndex(index)
    }

    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <MnemonicInput
          mnenonicRefs={mnenonicRefs}
          suggestedWords={suggestedWords}
          setSuggestedWords={setSuggestedWords}
          length={15}
          onDone={setMnemonic}
          onSelect={onSelect}
          onFocus={onFocus}
          isValidPhrase={false}
          mnemonicSelectedWords={mnemonicSelectedWords}
          setMnemonicSelectedWords={setMnemonicSelectedWords}
          mnemonic={mnemonic}
        />
      </View>
    )
  })
