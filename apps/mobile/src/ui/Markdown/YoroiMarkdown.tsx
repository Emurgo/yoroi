import React from 'react'
import Markdown from 'react-native-marked'
import type {MarkedStyles} from 'react-native-marked/src/theme/types'

type Props = {
  contentUri: string
  style?: MarkedStyles
}

export const YoroiMarkdown = ({contentUri, style}: Props) => {
  return <Markdown value={contentUri} styles={style} />
}
