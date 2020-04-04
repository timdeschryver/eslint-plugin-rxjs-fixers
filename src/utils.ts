import { TSESTree } from '@typescript-eslint/experimental-utils'

export const docsUrl = (ruleName: string) =>
  `https://github.com/testing-library/eslint-plugin-testing-library/tree/master/docs/rules/${ruleName}.md`

export function isArrowFunctionExpression(
  node: TSESTree.Node,
): node is TSESTree.ArrowFunctionExpression {
  return node.type === 'ArrowFunctionExpression'
}

export function isFunctionExpression(
  node: TSESTree.Node,
): node is TSESTree.FunctionExpression {
  return node.type === 'FunctionExpression'
}
