import { createRuleTester } from '../test-utils'
import rule, { RULE_NAME } from '../../src/rules/subscribe-signature'

const ruleTester = createRuleTester()

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        source$.subscribe(value => console.log(value))
      `,
    },
    {
      code: `
        source$.subscribe({
          next: value => console.log(value),
          error: err => console.error(err),
        });
      `,
    },
    {
      code: `
        source$.subscribe({
          next: value => console.log(value),
          error: err => console.error(err),
          complete: () => console.log('done'),
        });
      `,
    },
  ],
  invalid: [
    {
      code: `
        source$.subscribe(
          value => console.log(value),
          null,
          () => console.log('done')
        )
      `,
      output: `
        source$.subscribe(
          { next: value => console.log(value),
            error: () => {},
            complete: () => console.log('done') }
        )
      `,
      errors: [
        // one for each argument
        {
          messageId: 'subscribeSignature',
          line: 3,
        },
        {
          messageId: 'subscribeSignature',
          line: 4,
        },
        {
          messageId: 'subscribeSignature',
          line: 5,
        },
      ],
    },
    {
      code: `
        source$.subscribe(
          value => console.log(value),
          () => console.log('error')
        )
      `,
      output: `
        source$.subscribe(
          { next: value => console.log(value),
            error: () => console.log('error') }
        )
      `,
      errors: [
        {
          messageId: 'subscribeSignature',
          line: 3,
        },
        {
          messageId: 'subscribeSignature',
          line: 4,
        },
      ],
    },
  ],
})
