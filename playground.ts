import { soon } from './src/util/compose'

import { createPonyTranslator } from './src/ponyTranslator'
import { ifEnabled } from './src/util/ifEnabled'
import { capitalize } from './src/util/capitalize'
import { githubCornerHTML } from './src/lib/githubCorner'

import { repository, version } from './package.json'

let main = async () => {
   let wrapperDiv = document.getElementsByClassName('wrapper')[0]
   let cornerDiv = document.createElement('div')
   cornerDiv.innerHTML = githubCornerHTML(repository, version)
   wrapperDiv.appendChild(cornerDiv)

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
            let destination =
               el.querySelector<HTMLElement>('.xWidthDestination')
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
   ;['forward' as const, 'backward' as const].forEach(async (direction) => {
      let input = document.querySelector<HTMLTextAreaElement>(
         `.js${capitalize(direction)}.jsInput`,
      )!
      let output = document.querySelector<HTMLTextAreaElement>(
         `.js${capitalize(direction)}.jsOutput`,
      )!

      let ponyTranslator = createPonyTranslator({ direction })

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
      resp = await fetch('./dist/playground')
      content += await resp.text()
      if (lastContent && content !== lastContent) {
         location.reload()
      } else {
         lastContent = content
      }
   }
   reload()
})
