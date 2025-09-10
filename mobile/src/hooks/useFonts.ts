import * as Font from 'expo-font'
import * as React from 'react'

import {logger} from '~/kernel/logger/logger'

export const useFonts = () => {
  const [isLoaded, setisLoaded] = React.useState(false)

  React.useEffect(() => {
    async function loadFonts() {
      try {
        const fontMappings = {
          'Rubik': require('../../assets/fonts/Rubik-Regular.ttf'),
          'Rubik-Regular': require('../../assets/fonts/Rubik-Regular.ttf'),
          'Rubik-Medium': require('../../assets/fonts/Rubik-Medium.ttf'),
          'Rubik-Bold': require('../../assets/fonts/Rubik-Bold.ttf'),
          'Rubik-Light': require('../../assets/fonts/Rubik-Light.ttf'),
          'Rubik-SemiBold': require('../../assets/fonts/Rubik-SemiBold.ttf'),
          'Rubik-Black': require('../../assets/fonts/Rubik-Black.ttf'),
          'Rubik-ExtraBold': require('../../assets/fonts/Rubik-ExtraBold.ttf'),
          'Rubik-Italic': require('../../assets/fonts/Rubik-Italic.ttf'),
          'Rubik-MediumItalic': require('../../assets/fonts/Rubik-MediumItalic.ttf'),
          'Rubik-BoldItalic': require('../../assets/fonts/Rubik-BoldItalic.ttf'),
          'Rubik-LightItalic': require('../../assets/fonts/Rubik-LightItalic.ttf'),
          'Rubik-SemiBoldItalic': require('../../assets/fonts/Rubik-SemiBoldItalic.ttf'),
          'Rubik-BlackItalic': require('../../assets/fonts/Rubik-BlackItalic.ttf'),
          'Rubik-ExtraBoldItalic': require('../../assets/fonts/Rubik-ExtraBoldItalic.ttf'),
          'Rubik-Variable': require('../../assets/fonts/Rubik-VariableFont_wght.ttf'),
          'Rubik-Italic-Variable': require('../../assets/fonts/Rubik-Italic-VariableFont_wght.ttf'),
        }

        logger.info('Loading fonts...', {
          origin: 'useFonts',
          fontCount: Object.keys(fontMappings).length,
          fontNames: Object.keys(fontMappings),
        })

        // Load all fonts at once using the new API
        await Font.loadAsync(fontMappings)

        const keyFonts = [
          'Rubik',
          'Rubik-Regular',
          'Rubik-Medium',
          'Rubik-Bold',
          'Rubik-Light',
          'Rubik-SemiBold',
          'Rubik-Black',
          'Rubik-ExtraBold',
          'Rubik-Italic',
        ]
        const fontStatus = keyFonts.map((font) => ({
          font,
          isLoaded: Font.isLoaded(font),
        }))

        logger.info('Font loading completed', {
          origin: 'useFonts',
          expectedFonts: Object.keys(fontMappings),
          keyFontStatus: fontStatus,
        })

        const allFontsLoaded = keyFonts.every((font) => Font.isLoaded(font))
        if (!allFontsLoaded) {
          const failedFonts = keyFonts.filter((font) => !Font.isLoaded(font))
          logger.warn('Some fonts failed to load', {
            origin: 'useFonts',
            failedFonts,
            fontStatus,
          })
        } else {
          logger.info('All key fonts loaded successfully', {
            origin: 'useFonts',
            fontStatus,
          })
        }
      } catch (error) {
        logger.error('Font loading error details:', {
          error: error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        })
      } finally {
        setisLoaded(true)
      }
    }

    loadFonts()
  }, [])

  return isLoaded
}
