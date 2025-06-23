import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import globalMessages from '../../../kernel/i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
    scanTitle: intl.formatMessage(messages.scanTitle),

    ok: intl.formatMessage(globalMessages.ok),
    cameraPermissionDeniedTitle: intl.formatMessage(messages.cameraPermissionDeniedTitle),
    cameraPermissionDeniedHelp: intl.formatMessage(messages.cameraPermissionDeniedHelp),
    errorUnknownTitle: intl.formatMessage(messages.errorUnknownTitle),
    errorUnknownHelp: intl.formatMessage(messages.errorUnknownHelp),
    errorUnknownContentTitle: intl.formatMessage(messages.errorUnknownContentTitle),
    errorUnknownContentHelp: intl.formatMessage(messages.errorUnknownContentHelp),

    linksErrorExtraParamsDeniedTitle: intl.formatMessage(messages.linksErrorExtraParamsDeniedTitle),
    linksErrorExtraParamsDeniedHelp: intl.formatMessage(messages.linksErrorExtraParamsDeniedHelp),
    linksErrorForbiddenParamsProvidedTitle: intl.formatMessage(messages.linksErrorForbiddenParamsProvidedTitle),
    linksErrorForbiddenParamsProvidedHelp: intl.formatMessage(messages.linksErrorForbiddenParamsProvidedHelp),
    linksErrorRequiredParamsMissingTitle: intl.formatMessage(messages.linksErrorRequiredParamsMissingTitle),
    linksErrorRequiredParamsMissingHelp: intl.formatMessage(messages.linksErrorRequiredParamsMissingHelp),
    linksErrorParamsValidationFailedTitle: intl.formatMessage(messages.linksErrorParamsValidationFailedTitle),
    linksErrorParamsValidationFailedHelp: intl.formatMessage(messages.linksErrorParamsValidationFailedHelp),
    linksErrorUnsupportedAuthorityTitle: intl.formatMessage(messages.linksErrorUnsupportedAuthorityTitle),
    linksErrorUnsupportedAuthorityHelp: intl.formatMessage(messages.linksErrorUnsupportedAuthorityHelp),
    linksErrorUnsupportedVersionTitle: intl.formatMessage(messages.linksErrorUnsupportedVersionTitle),
    linksErrorUnsupportedVersionHelp: intl.formatMessage(messages.linksErrorUnsupportedVersionHelp),
    linksErrorSchemeNotImplementedTitle: intl.formatMessage(messages.linksErrorSchemeNotImplementedTitle),
    linksErrorSchemeNotImplementedHelp: intl.formatMessage(messages.linksErrorSchemeNotImplementedHelp),

    continue: intl.formatMessage(messages.continue),
    openAppSettings: intl.formatMessage(messages.openAppSettings),
  } as const).current
}

const messages = Object.freeze(
  defineMessages({
    scanTitle: {
      id: 'scan.title',
      defaultMessage: '!!!Please scan a QR code',
    },

    cameraPermissionDeniedTitle: {
      id: 'scan.cameraPermissionDenied.title',
      defaultMessage: '!!!Missing camera permission',
    },
    cameraPermissionDeniedHelp: {
      id: 'scan.cameraPermissionDenied.help',
      defaultMessage: '!!!Open the app settings and enable the camera permission.',
    },
    errorUnknownTitle: {
      id: 'scan.errorUnknown.title',
      defaultMessage: '!!!Unknown error',
    },
    errorUnknownHelp: {
      id: 'scan.errorUnknown.help',
      defaultMessage: '!!!Unknown help',
    },
    errorUnknownContentTitle: {
      id: 'scan.errorUnknownContent.title',
      defaultMessage: '!!!Unknown content error',
    },
    errorUnknownContentHelp: {
      id: 'scan.errorUnknownContent.help',
      defaultMessage: '!!!Unknown content help',
    },

    linksErrorExtraParamsDeniedTitle: {
      id: 'scan.linksErrorExtraParamsDenied.title',
      defaultMessage: '!!!Extra parameter denied',
    },
    linksErrorExtraParamsDeniedHelp: {
      id: 'scan.linksErrorExtraParamsDenied.help',
      defaultMessage: '!!!Extra parameter denied help',
    },
    linksErrorForbiddenParamsProvidedTitle: {
      id: 'scan.linksErrorForbiddenParamsProvided.title',
      defaultMessage: '!!!Forbidden parameter provided',
    },
    linksErrorForbiddenParamsProvidedHelp: {
      id: 'scan.linksErrorForbiddenParamsProvided.help',
      defaultMessage: '!!!Forbidden parameter provided help',
    },
    linksErrorRequiredParamsMissingTitle: {
      id: 'scan.linksErrorRequiredParamsMissing.title',
      defaultMessage: '!!!Missing required parameter',
    },
    linksErrorRequiredParamsMissingHelp: {
      id: 'scan.linksErrorRequiredParamsMissing.help',
      defaultMessage: '!!!Missing required parameter help',
    },
    linksErrorParamsValidationFailedTitle: {
      id: 'scan.linksErrorParamsValidationFailed.title',
      defaultMessage: '!!!Parameter validation failed',
    },
    linksErrorParamsValidationFailedHelp: {
      id: 'scan.linksErrorParamsValidationFailed.help',
      defaultMessage: '!!!Parameter validation failed help',
    },
    linksErrorUnsupportedAuthorityTitle: {
      id: 'scan.linksErrorUnsupportedAuthority.title',
      defaultMessage: '!!!Unsupported authority',
    },
    linksErrorUnsupportedAuthorityHelp: {
      id: 'scan.linksErrorUnsupportedAuthority.help',
      defaultMessage: '!!!Unsupported authority help',
    },
    linksErrorUnsupportedVersionTitle: {
      id: 'scan.linksErrorUnsupportedVersion.title',
      defaultMessage: '!!!Unsupported version',
    },
    linksErrorUnsupportedVersionHelp: {
      id: 'scan.linksErrorUnsupportedVersion.help',
      defaultMessage: '!!!Unsupported version help',
    },
    linksErrorSchemeNotImplementedTitle: {
      id: 'scan.linksErrorSchemeNotImplemented.title',
      defaultMessage: '!!!Scheme not implemented',
    },
    linksErrorSchemeNotImplementedHelp: {
      id: 'scan.linksErrorSchemeNotImplemented.help',
      defaultMessage: '!!!Scheme not implemented help',
    },

    continue: {
      id: 'global.actions.dialogs.commonbuttons.continueButton',
      defaultMessage: '!!!Continue',
    },
    openAppSettings: {
      id: 'global.openAppSettings',
      defaultMessage: '!!!Open app settings',
    },
  }),
)
