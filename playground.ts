import { soon } from './src/util/compose.js'

import { createPonyTranslator } from './src/ponyTranslator.js'
import { ifEnabled } from './src/util/ifEnabled.js'

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
   // xCssAssist
   let xCssAssistArr = Array.from(
      document.querySelectorAll<HTMLElement>('[xCssAssist]'),
   )
   let resize = () => {
      xCssAssistArr.forEach(async (el) => {
         let attrValue = el.getAttribute('xCssAssist')
         if (attrValue === null) {
            throw 'xCssAssist != xCssAssist - go figure --'
         } else if (attrValue === 'width') {
            let source = el.querySelector<HTMLElement>('.xWidthSource')
            let destination = el.querySelector<HTMLElement>(
               '.xWidthDestination',
            )
            if (source === null) {
               throw `missing element with xWidthSource class`
            } else if (destination === null) {
               throw `missing element with xWidthDestination class`
            }
            destination.style.width = ''
            await new Promise((resolve) => setTimeout(resolve, 900))
            destination.style.width = `${source.clientWidth}px`
         } else {
            throw `unhandled xCssAssist attrValue ${attrValue}`
         }
      })
   }
   window.addEventListener('resize', resize)
   resize()

   // Translation
   ;['jsForward' as const, 'jsBackward' as const].forEach(async (direction) => {
      let input = document.querySelector<HTMLTextAreaElement>(
         `.${direction}.jsInput`,
      )!
      let output = document.querySelector<HTMLTextAreaElement>(
         `.${direction}.jsOutput`,
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

      let ponyTranslator = await createPonyTranslator({
         direction: {
            jsForward: 'forward' as const,
            jsBackward: 'backward' as const,
         }[direction],
      })

      let update = () => {
         output.textContent = ponyTranslator.justTranslate(input.value || '')
      }
      input.addEventListener('keydown', soon(update))
      update()
   })
}

main()

// Develop
let logKey = (ev) => {
   console.log({ key: ev.key, ev })
}

ifEnabled('keydown').do(() => {
   document.documentElement.addEventListener('keydown', logKey)
})

ifEnabled('keyup').do(() => {
   document.documentElement.addEventListener('keyup', logKey)
})

ifEnabled('autoreload').do(() => {
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
})
