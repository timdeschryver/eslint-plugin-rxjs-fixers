import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'
import {
  docsUrl,
  isArrowFunctionExpression,
  isFunctionExpression,
} from '../utils'

export const RULE_NAME = 'result-selectors'
type Options = []
export type MessageIds = 'resultSelectors' | 'resultSelectorsMapImport'

const DEPRECATED_OPERATORS_REGEXP = /^(concatMap|concatMapTo|exhaustMap|mergeMap|mergeMapTo|switchMap|switchMapTo)$/

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
      resultSelectors: ``,
      resultSelectorsMapImport: ``,
    },
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const source = context.getSourceCode()
    let importDeclaration: TSESTree.ImportDeclaration
    let mapIsImported = false
    const operatorReferences: TSESTree.Identifier[] = []

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

        importDeclaration = node.parent as TSESTree.ImportDeclaration
        mapIsImported = importDeclaration.specifiers.some(
          (s) => s.local.name === 'map',
        )

        const [{ references }] = context.getDeclaredVariables(node)
        operatorReferences.push(...references.map((r) => r.identifier))
      },

      [`CallExpression[callee.name=${DEPRECATED_OPERATORS_REGEXP}][arguments.length > 1]`](
        node: TSESTree.CallExpression,
      ) {
        if (
          !operatorReferences.some(
            (r) => r.loc[0] === node.loc[0] && r.loc[1] === node.loc[1],
          )
        ) {
          return
        }

        const [projector, ...args] = node.arguments
        args.forEach((arg) => {
          // probably the concurrent param, skip this
          if (!isArrowFunctionExpression(arg) && !isFunctionExpression(arg)) {
            return
          }

          const text = source.getText(arg)

          /*
           * from the end of projector till the end of the selector
           * to also include the comma at the end of the projector method
           */
          const rangeToReplace: TSESTree.Range = [
            projector.range[1],
            arg.range[1],
          ]

          context.report({
            messageId: 'resultSelectors',
            node: arg,
            fix: (fixer) =>
              fixer.replaceTextRange(rangeToReplace, `.pipe(map(${text}))`),
          })

          if (!mapIsImported) {
            mapIsImported = true
            context.report({
              messageId: 'resultSelectorsMapImport',
              node: importDeclaration,
              fix: (fixer) =>
                fixer.insertTextBefore(
                  importDeclaration.specifiers[0],
                  `map, `,
                ),
            })
          }
        })
      },
    }
  },
})
