import base from './base'
import rules from '../rules'

export default {
  ...base,
  rules: Object.keys(rules).reduce((all, rule) => {
    all[`rxjs-fixers-poc/${rule}`] = 'error'
    return all
  }, {}),
}
