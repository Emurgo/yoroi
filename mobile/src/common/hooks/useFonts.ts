import type {FontSource} from 'expo-font'
import * as Font from 'expo-font'
import * as React from 'react'

import RubikBlack from '~/assets/fonts/Rubik-Black.ttf'
import RubikBlackItalic from '~/assets/fonts/Rubik-BlackItalic.ttf'
import RubikBold from '~/assets/fonts/Rubik-Bold.ttf'
import RubikBoldItalic from '~/assets/fonts/Rubik-BoldItalic.ttf'
import RubikExtraBold from '~/assets/fonts/Rubik-ExtraBold.ttf'
import RubikExtraBoldItalic from '~/assets/fonts/Rubik-ExtraBoldItalic.ttf'
import RubikItalicVariable from '~/assets/fonts/Rubik-Italic-VariableFont_wght.ttf'
import RubikItalic from '~/assets/fonts/Rubik-Italic.ttf'
import RubikLight from '~/assets/fonts/Rubik-Light.ttf'
import RubikLightItalic from '~/assets/fonts/Rubik-LightItalic.ttf'
import RubikMedium from '~/assets/fonts/Rubik-Medium.ttf'
import RubikMediumItalic from '~/assets/fonts/Rubik-MediumItalic.ttf'
import RubikRegular from '~/assets/fonts/Rubik-Regular.ttf'
import RubikSemiBold from '~/assets/fonts/Rubik-SemiBold.ttf'
import RubikSemiBoldItalic from '~/assets/fonts/Rubik-SemiBoldItalic.ttf'
import RubikVariable from '~/assets/fonts/Rubik-VariableFont_wght.ttf'
import {logger} from '~/kernel/logger/logger'

export const useFonts = () => {
  const [isLoaded, setisLoaded] = React.useState(false)

  React.useEffect(() => {
    async function loadFonts() {
      try {
        const fontMappings: Record<string, FontSource> = {
          'Rubik': RubikRegular as FontSource,
          'Rubik-Regular': RubikRegular as FontSource,
          'Rubik-Medium': RubikMedium as FontSource,
          'Rubik-Bold': RubikBold as FontSource,
          'Rubik-Light': RubikLight as FontSource,
          'Rubik-SemiBold': RubikSemiBold as FontSource,
          'Rubik-Black': RubikBlack as FontSource,
          'Rubik-ExtraBold': RubikExtraBold as FontSource,
          'Rubik-Italic': RubikItalic as FontSource,
          'Rubik-MediumItalic': RubikMediumItalic as FontSource,
          'Rubik-BoldItalic': RubikBoldItalic as FontSource,
          'Rubik-LightItalic': RubikLightItalic as FontSource,
          'Rubik-SemiBoldItalic': RubikSemiBoldItalic as FontSource,
          'Rubik-BlackItalic': RubikBlackItalic as FontSource,
          'Rubik-ExtraBoldItalic': RubikExtraBoldItalic as FontSource,
          'Rubik-Variable': RubikVariable as FontSource,
          'Rubik-Italic-Variable': RubikItalicVariable as FontSource,
        }

        logger.debug('Loading fonts...', {
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

        logger.debug('Font loading completed', {
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
          logger.debug('All key fonts loaded successfully', {
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
