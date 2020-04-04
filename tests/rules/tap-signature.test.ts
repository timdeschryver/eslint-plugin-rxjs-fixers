import { createRuleTester } from '../test-utils'
import rule, { RULE_NAME } from '../../src/rules/tap-signature'

const ruleTester = createRuleTester()

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { tap } from 'rxjs/operators'
              
        source$.pipe(  
          tap(value => console.log(value))
        )
      `,
    },
    {
      code: `
        import { tap } from 'rxjs/operators'
              
        source$.pipe(  
          tap({
            next: value => console.log(value),
            error: err => console.error(err),
          })
        )
      `,
    },
    {
      code: `
        import { tap } from 'rxjs/operators'
        
        source$.pipe(  
          tap({
              next: value => console.log(value),
              error: err => console.error(err),
              complete: () => console.log('done'),
          })
        )
      `,
    },
  ],
  invalid: [
    {
      code: `
        import { tap } from 'rxjs/operators'

        source$.pipe(
          tap(
            value => console.log(value),
            err => console.error(err),
            () => console.log('done')
          ),
        )
      `,
      output: `
        import { tap } from 'rxjs/operators'

        source$.pipe(
          tap(
            { next: value => console.log(value),
              error: err => console.error(err),
              complete: () => console.log('done') }
          ),
        )
      `,
      errors: [
        // one for each argument
        {
          messageId: 'tapSignature',
          line: 6,
        },
        {
          messageId: 'tapSignature',
          line: 7,
        },
        {
          messageId: 'tapSignature',
          line: 8,
        },
      ],
    },
    {
      code: `
        import { tap } from 'rxjs/operators'

        source$.pipe(
          tap(
            value => console.log(value),
            err => console.error(err)
          ),
        )
      `,
      output: `
        import { tap } from 'rxjs/operators'

        source$.pipe(
          tap(
            { next: value => console.log(value),
              error: err => console.error(err) }
          ),
        )
      `,
      errors: [
        {
          messageId: 'tapSignature',
          line: 6,
        },
        {
          messageId: 'tapSignature',
          line: 7,
        },
      ],
    },
    {
      code: `
        import { tap } from 'rxjs/operators'

        source$.pipe(
          tap(
            value => console.log(value),
            null,
            () => console.log('done')
          ),
        )
      `,
      output: `
        import { tap } from 'rxjs/operators'

        source$.pipe(
          tap(
            { next: value => console.log(value),
              error: () => {},
              complete: () => console.log('done') }
          ),
        )
      `,
      errors: [
        {
          messageId: 'tapSignature',
          line: 6,
        },
        {
          messageId: 'tapSignature',
          line: 7,
        },
        {
          messageId: 'tapSignature',
          line: 8,
        },
      ],
    },
  ],
})
