import { createRuleTester } from '../test-utils'
import rule, { RULE_NAME } from '../../src/rules/operator-with'

const ruleTester = createRuleTester()

ruleTester.run(RULE_NAME, rule, {
  valid: [],
  invalid: [
    {
      code: `
        import { zip, combineLatest, merge, concat } from 'rxjs/operators'

        source$.pipe(
          zip(other$),
          combineLatest(a$, b$),
          merge(partner$),
          concat(ender$),
        )
      `,
      output: `
        import { zipWith, combineLatestWith, mergeWith, concatWith } from 'rxjs/operators'

        source$.pipe(
          zipWith(other$),
          combineLatestWith(a$, b$),
          mergeWith(partner$),
          concatWith(ender$),
        )
      `,
      errors: [
        {
          messageId: 'operatorWithImport',
          line: 2,
          data: {
            deprecatedOperatorName: 'zip',
            operatorName: 'zipWith',
          },
        },
        {
          messageId: 'operatorWithImport',
          line: 2,
          data: {
            deprecatedOperatorName: 'combineLatest',
            operatorName: 'combineLatestWith',
          },
        },
        {
          messageId: 'operatorWithImport',
          line: 2,
          data: {
            deprecatedOperatorName: 'merge',
            operatorName: 'mergeWith',
          },
        },
        {
          messageId: 'operatorWithImport',
          line: 2,
          data: {
            deprecatedOperatorName: 'concat',
            operatorName: 'concatWith',
          },
        },
        {
          messageId: 'operatorWith',
          line: 5,
          data: {
            deprecatedOperatorName: 'zip',
            operatorName: 'zipWith',
          },
        },
        {
          messageId: 'operatorWith',
          line: 6,
          data: {
            deprecatedOperatorName: 'combineLatest',
            operatorName: 'combineLatestWith',
          },
        },
        {
          messageId: 'operatorWith',
          line: 7,
          data: {
            deprecatedOperatorName: 'merge',
            operatorName: 'mergeWith',
          },
        },
        {
          messageId: 'operatorWith',
          line: 8,
          data: {
            deprecatedOperatorName: 'concat',
            operatorName: 'concatWith',
          },
        },
      ],
    },
  ],
})
