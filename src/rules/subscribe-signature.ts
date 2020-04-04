import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'
import { docsUrl } from '../utils'

export const RULE_NAME = 'subscribe-signature'
type Options = []
export type MessageIds = 'subscribeSignature'

export default ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Deprecated.`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      subscribeSignature: ``,
    },
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const source = context.getSourceCode()

    return {
      [`CallExpression[callee.property.name="subscribe"][arguments.length > 1]`](
        node: TSESTree.CallExpression,
      ) {
        // TODO?: verify if it's an Observable https://github.com/cartant/eslint-plugin-rxjs/blob/master/source/utils.ts
        node.arguments.forEach((arg, index) => {
          const property = ['next', 'error', 'complete'][index]

          const openingBracket = index === 0 ? '{ ' : '  '
          const closingBracket = index === node.arguments.length - 1 ? ' }' : ''

          const original = source.getText(arg)
          // if `null` or `undefined` is used, replace it with a noop
          const nullReplacement = ['null', 'undefined'].includes(original)
            ? '() => {}'
            : original

          context.report({
            messageId: 'subscribeSignature',
            node: arg,
            fix: (fixer) =>
              fixer.replaceTextRange(
                arg.range,
                `${openingBracket}${property}: ${nullReplacement}${closingBracket}`,
              ),
          })
        })
      },
    }
  },
})
