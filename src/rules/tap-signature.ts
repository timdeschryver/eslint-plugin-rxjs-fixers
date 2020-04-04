import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'
import { docsUrl } from '../utils'

export const RULE_NAME = 'tap-signature'
type Options = []
export type MessageIds = 'tapSignature'

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
      tapSignature: ``,
    },
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const source = context.getSourceCode()
    const tapReferences: TSESTree.Identifier[] = []

    return {
      [`ImportDeclaration[source.value="rxjs/operators"] > ImportSpecifier[imported.name="tap"]`](
        node: TSESTree.ImportSpecifier,
      ) {
        // if the import has been renamed, skip it
        if (
          node.local.range[0] !== node.imported.range[0] &&
          node.local.range[1] !== node.imported.range[1]
        ) {
          return
        }

        const [{ references }] = context.getDeclaredVariables(node)
        tapReferences.push(...references.map((r) => r.identifier))
      },
      [`CallExpression[callee.name="tap"][arguments.length > 1]`](
        node: TSESTree.CallExpression,
      ) {
        if (
          !tapReferences.some(
            (r) => r.loc[0] === node.loc[0] && r.loc[1] === node.loc[1],
          )
        ) {
          return
        }
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
            messageId: 'tapSignature',
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
