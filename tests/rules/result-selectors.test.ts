import { createRuleTester } from '../test-utils'
import rule, { RULE_NAME } from '../../src/rules/result-selectors'

const ruleTester = createRuleTester()

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { mergeMap } from 'rxjs/operators'

        source$
          .pipe(
            mergeMap(
              (outer) => of(outer + outer)
            )
          )
        `,
    },
    {
      code: `
        import { mergeMap } from 'rxjs/operators'

        source$
          .pipe(
            mergeMap(
              (outer) => of(outer + outer),
              7
            )
          )
        `,
    },
  ],
  invalid: [
    {
      code: `
        import { mergeMap } from 'rxjs/operators'

        source$
          .pipe(
            mergeMap(
              (outer) => of(outer + outer),
              (outer, inner) => [outer, inner]
            )
          )
      `,
      output: `
        import { map, mergeMap } from 'rxjs/operators'

        source$
          .pipe(
            mergeMap(
              (outer) => of(outer + outer).pipe(map((outer, inner) => [outer, inner]))
            )
          )
      `,
      errors: [
        {
          messageId: 'resultSelectorsMapImport',
        },
        {
          messageId: 'resultSelectors',
        },
      ],
    },
    {
      code: `
        import { mergeMap } from 'rxjs/operators'

        source$
          .pipe(
            mergeMap(
              (outer) => of(outer + outer),
              (outer, inner) => [outer, inner],
              7
            )
          )
      `,
      output: `
        import { map, mergeMap } from 'rxjs/operators'

        source$
          .pipe(
            mergeMap(
              (outer) => of(outer + outer).pipe(map((outer, inner) => [outer, inner])),
              7
            )
          )
      `,
      errors: [
        {
          messageId: 'resultSelectorsMapImport',
        },
        {
          messageId: 'resultSelectors',
        },
      ],
    },
    {
      code: `
        import { map, exhaustMap } from 'rxjs/operators'

        source$
          .pipe(
            exhaustMap(
              (outer) => of(outer + outer),
              (outer, inner) => [outer, inner]
            )
          )
      `,
      output: `
        import { map, exhaustMap } from 'rxjs/operators'

        source$
          .pipe(
            exhaustMap(
              (outer) => of(outer + outer).pipe(map((outer, inner) => [outer, inner]))
            )
          )
      `,
      errors: [
        {
          messageId: 'resultSelectors',
        },
      ],
    },
  ],
})
