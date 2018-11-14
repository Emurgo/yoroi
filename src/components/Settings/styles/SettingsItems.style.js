// @flow
import {COLORS} from '../../../styles/config'

const styles = {
  label: {
    color: COLORS.DARK_BLUE,
  },
  link: {
    color: COLORS.DARK_BLUE,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  description: {
    fontSize: 15,
  },
  icon: {
    size: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.DARK_GRAY,
  },
  descriptionContainer: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: COLORS.DARK_BLUE,
  },
}

export default styles
