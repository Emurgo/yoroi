const translations = {};

import en_US from "./locales/en-US";
import ru_RU from "./locales/ru-RU";

const defaultLocale = en_US

translations['en-US'] = en_US

// Merged english messages with selected by user locale messages
// In this case all english data would be overridden to user selected locale, but untranslated
// (missed in object keys) just stay in english
translations['ru-RU'] = Object.assign({}, defaultLocale, ru_RU);


export default translations;
