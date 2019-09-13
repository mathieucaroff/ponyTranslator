import { createStreamTranslator } from './streamTranslator'
import { Rule } from './interface'

let randomString = (k: number) => {
   let str = [...Array(k)].map(() => Math.random().toString(36)).join('')
   let text = str.replace(/[0-4.]/g, '').replace(/[5-9]/g, ' ')
   return text.slice(0, 4 * k).trim()
}

describe('streamTranslator', () => {
   it('Does not alter the text', () => {
      let streamTranslator = createStreamTranslator({ ruleArr: [] })

      let text = randomString(10)

      expect(streamTranslator.justTranslate(text)).toBe(text)
   })
   it('Perfoms single word replacements', () => {
      let streamTranslator = createStreamTranslator({
         ruleArr: [{ lef: 'somebody', rig: 'somepony' }],
      })

      let text = `They met somebody`
      let resu = `They met somepony`

      expect(streamTranslator.justTranslate(text)).toBe(resu)
   })
   it('Keeps the case', () => {
      let streamTranslator = createStreamTranslator({
         ruleArr: [{ lef: 'somebody', rig: 'somepony' }],
      })

      let text = `Somebody SOMEBODY someBody someBODY SOMEBODy SomeBODY`
      let resu = `Somepony SOMEPONY somepony somepony Somepony Somepony`

      expect(streamTranslator.justTranslate(text)).toBe(resu)
   })
   it('Does not alter spaces', () => {
      let streamTranslator = createStreamTranslator({
         ruleArr: [{ lef: 'a', rig: 'z' }, { lef: 'b', rig: 'y' }],
      })

      let text = `\ta b\tc\nd\re  f\t\tg\n\nh\r\ri \tj\t\nk\n\rl\r\n`
      let resu = `\tz y\tc\nd\re  f\t\tg\n\nh\r\ri \tj\t\nk\n\rl\r\n`

      expect(streamTranslator.justTranslate(text)).toBe(resu)
   })
   it('Does not alter punctuation', () => {
      let streamTranslator = createStreamTranslator({
         ruleArr: [{ lef: 'a', rig: 'z' }, { lef: 'b', rig: 'y' }],
      })

      let text = `q!w@ a b d#g$ j%y ^p& u*l( ;)[-] =s'e/x .c,v!`
      let resu = `q!w@ z y d#g$ j%y ^p& u*l( ;)[-] =s'e/x .c,v!`

      expect(streamTranslator.justTranslate(text)).toBe(resu)
   })
})
