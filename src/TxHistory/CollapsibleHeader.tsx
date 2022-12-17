import React from 'react'
import {InteractionManager, LayoutAnimation, View, ViewProps} from 'react-native'

export const CollapsibleHeader = ({expanded, children}: {expanded: boolean} & ViewProps) => {
  const [_expanded, setExpanded] = React.useState(expanded)
  const firstRenderRef = React.useRef(true)

  React.useLayoutEffect(() => {
    // it fixes layout and blank screen issues
    // https://emurgo.atlassian.net/browse/YOMO-428
    // https://emurgo.atlassian.net/browse/YOMO-427
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }

    InteractionManager.runAfterInteractions(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

      setExpanded(expanded)
    })
  }, [expanded])

  return _expanded ? (
    <View style={{overflow: 'hidden'}}>
      <View style={!expanded && {position: 'absolute', width: '100%'}}>{children}</View>
    </View>
  ) : null
}
