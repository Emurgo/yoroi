// @flow

import {connect} from 'react-redux'
import {compose} from 'redux'

import {renderFormattedText} from '../../utils/textRendering'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.TermsOfServiceScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
}

const TermsOfService = ({translations}: Props) =>
  renderFormattedText(translations.content)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
)(TermsOfService)
