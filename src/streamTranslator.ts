import { Rule, Callback, Lemma } from './interface'
import { createWord } from './util/word'

export interface StreamTranslatorParam {
   direction?: 'forward' | 'backward'
   ruleArr: Rule[]
}

export let createStreamTranslator = ({
   direction = 'forward',
   ruleArr,
}: StreamTranslatorParam) => {
   //
   // init
   //
   let ruleList = ruleArr.map(
      direction === 'forward'
         ? ({ lef, rig }) => ({
              lef: lef.toLowerCase(),
              rig: rig.toLowerCase(),
           })
         : ({ lef, rig }) => ({
              lef: rig.toLowerCase(),
              rig: lef.toLowerCase(),
           }),
   )

   //
   // private
   //
   let buffer: Lemma[] = []
   let outputArr: Callback<string>[] = []

   /**
    * Dispatch a string to the registered callback funtions
    * @param text Content to send to all subscribed outputs
    */
   let outputText = (text: string) => {
      outputArr.forEach((callback) => callback(text))
   }

   /**
    * Given a text, add it to the buffer and translate the buffer to the
    * output as much as allowed by the rules matching the buffer
    */
   let processText = (text: string) => {
      let partArr: Lemma[] = splitText(text)
      buffer.push(...partArr)

      let count = 0
      let outBuffer: string[] = []

      buffer.every((lemma, k) => {
         let { word, sep } = lemma
         let newWord = word
         let token = word.toLowerCase()
         ruleList.some(({ lef, rig }) => {
            if (token === lef) {
               newWord = createWord(rig).withCaseOf(word).result()
               return true
            }
         })

         outBuffer.push(newWord)
         if (sep) {
            outBuffer.push(sep)
         }
         count = k + 1
         return true
      })

      buffer.splice(0, count)
      outputText(outBuffer.join(''))
   }

   /**
    * Split a text into a series of lemma
    * @param text string to be split
    */
   let splitText = (text: string): Lemma[] => {
      let splitArr = text.split(/([ \t\n]|\b)/g) || []
      let parts: Lemma[] = []
      for (let k = 0; k < splitArr.length; k += 2) {
         let lemma = {
            word: splitArr[k],
            sep: splitArr[k + 1],
         }
         parts.push(lemma)
      }
      return parts
   }

   //
   // public
   //
   /**
    * `subscribe` adds a callback function to the registered callbacks
    * @param callback the function that will be executed and passed the
    *   output each time the streamTranslator outputs text.
    */
   let subscribe = (callback: Callback<string>) => {
      outputArr.push(callback)
   }

   /**
    * `input` accepts the next piece of text that should be processed by
    * the (stream) translator
    * @param text the next text chunk of the input stream
    */
   let input = (text: string) => {
      processText(text)
   }

   /**
    * `finish` flushes and ends the stream. Removes registered outputs.
    */
   let finish = () => {
      outputText(buffer.join(''))
      buffer = []
      outputArr = []
   }

   /**
    * `justTranslate` fully translates a text right away
    * @param text the content to translate
    */
   let justTranslate = (text: string): string => {
      let clone = createStreamTranslator({
         ruleArr: ruleList,
      })
      let out: string[] = []
      clone.subscribe((part) => out.push(part))
      clone.input(text)
      clone.finish()
      return out.join('')
   }

   return {
      finish,
      input,
      justTranslate,
      subscribe,
   }
}

export type StreamTranslator = ReturnType<typeof createStreamTranslator>
