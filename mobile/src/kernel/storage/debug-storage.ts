import {App} from '@yoroi/types'

import {AsyncStorageStatic} from '@react-native-async-storage/async-storage'
import {MMKV} from 'react-native-mmkv'

import {logger} from '~/kernel/logger/logger'

type Tree = {
  [key: string]: Tree | string | null
}

export const debugStorage = async <
  IsAsync extends boolean = true,
  Key extends string = string,
>(
  storage:
    | App.Storage<IsAsync, Key>
    | AsyncStorageStatic
    | MMKV
    | App.ObservableStorage<IsAsync, Key>,
  filter?: (key: string) => boolean,
): Promise<void> => {
  const keys = await storage.getAllKeys()
  const filteredKeys = filter ? keys.filter(filter) : keys

  const tree: Tree = {}
  for (const key of filteredKeys) {
    // Get the value for this key
    let value: string | null | undefined = null
    if ('getItem' in storage) {
      value = await storage.getItem(key)
    } else {
      value = storage.getString(key)
    }

    // Format the value
    let formattedValue: string
    if (value === null || value === undefined) {
      formattedValue = `empty: ${value}`
    } else {
      try {
        const parsed = JSON.parse(value)
        formattedValue =
          typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
      } catch {
        formattedValue = `unknown: ${value}`
      }
    }

    // Add to tree
    const parts = key.split('/').filter(Boolean)
    let current = tree
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (i === parts.length - 1) {
        current[part ?? ''] = formattedValue
      } else {
        if (
          !current[part ?? ''] ||
          typeof current[part ?? ''] === 'string' ||
          current[part ?? ''] === null
        ) {
          current[part ?? ''] = {}
        }
        current = current[part ?? ''] as Tree
      }
    }
  }

  const printTree = (
    node: Tree | string | null,
    prefix = '',
    isLast = true,
  ): string => {
    let output = ''
    if (node === null) {
      output += `${prefix}${isLast ? '└── ' : '├── '}null\n`
      return output
    }

    if (typeof node === 'string') {
      output += `${prefix}${isLast ? '└── ' : '├── '}${node}\n`
      return output
    }

    const entries = Object.entries(node)
    entries.forEach(([key, value], index) => {
      const isLastEntry = index === entries.length - 1
      const newPrefix = `${prefix}${isLast ? '    ' : '│   '}`

      if (typeof value === 'string') {
        output += `${prefix}${isLastEntry ? '└── ' : '├── '}${key}: ${value}\n`
      } else {
        output += `${prefix}${isLastEntry ? '└── ' : '├── '}${key}/\n`
        output += printTree(value, newPrefix, isLastEntry)
      }
    })
    return output
  }

  const output = `\nStorage Contents:\n================\n${printTree(tree)}================\n`
  logger.debug(output, {origin: 'debugStorage'})
}
