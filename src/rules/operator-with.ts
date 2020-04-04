import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'
import { docsUrl } from '../utils'

export const RULE_NAME = 'operator-with'
type Options = []
export type MessageIds = 'operatorWith' | 'operatorWithImport'

const DEPRECATED_OPERATORS_REGEXP = /^(zip|combineLatest|merge|concat|race)$/

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
      operatorWith: `{{deprecatedOperatorName}} has been deprecated in favor of {{operatorName}}`,
      operatorWithImport: `{{deprecatedOperatorName}} has been deprecated in favor of {{operatorName}}`,
    },
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    return {
      [`ImportDeclaration[source.value="rxjs/operators"] > ImportSpecifier[imported.name=${DEPRECATED_OPERATORS_REGEXP}]`](
        node: TSESTree.ImportSpecifier,
      ) {
        // if the import has been renamed, skip it
        if (
          node.local.range[0] !== node.imported.range[0] &&
          node.local.range[1] !== node.imported.range[1]
        ) {
          return
        }

        const data = {
          deprecatedOperatorName: node.imported.name,
          operatorName: `${node.imported.name}With`,
        }

        context.report({
          messageId: 'operatorWithImport',
          node,
          fix: (fixer) => fixer.insertTextAfter(node, 'With'),
          data,
        })

        const [{ references }] = context.getDeclaredVariables(node)
        references.forEach((ref) => {
          context.report({
            messageId: 'operatorWith',
            node: ref.identifier,
            fix: (fixer) => fixer.insertTextAfter(ref.identifier, 'With'),
            data,
          })
        })
      },
    }
  },
})
