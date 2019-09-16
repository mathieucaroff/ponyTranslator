import { soon } from './src/util/compose.js'

import { createPonyTranslator } from './src/ponyTranslator.js'

let clamp = (min, max?) => (value) => {
   if (max !== undefined && max !== null && value > max) {
      value = max
   }
   if (min !== undefined && min !== null && value < min) {
      value = min
   }
   return value
}

let main = async () => {
   ;['forward' as const, 'backward' as const].forEach(async (direction) => {
      let input = document.querySelector<HTMLTextAreaElement>(
         `.${direction}.input`,
      )!
      let output = document.querySelector<HTMLTextAreaElement>(
         `.${direction}.output`,
      )!

      // Verification
      let missing: string[] = []
      if (input === null) {
         missing.push('input')
      }
      if (output === null) {
         missing.push('output')
      }
      if (missing.length > 0) {
         throw `could not acquire ${missing} element(s)`
      }

      let ponyTranslator = await createPonyTranslator({ direction })
      let update = () => {
         output.textContent = ponyTranslator.justTranslate(input.value || '')
      }
      input.addEventListener('keydown', soon(update))
      update()
   })
}

main()

// // Discovery
// let logKey = (ev) => {
//    console.log({ key: ev.key })
// }
// document.documentElement.addEventListener('keydown', logKey)
// document.documentElement.addEventListener('keyup', logKey)

// Develop
let lastContent = ''
let reload = async () => {
   setTimeout(reload, 500)
   let resp = await fetch('./playground.html')
   let content = await resp.text()
   resp = await fetch('./dist/playground.js')
   content += await resp.text()
   if (lastContent && content !== lastContent) {
      location.reload()
   } else {
      lastContent = content
   }
}
reload()
