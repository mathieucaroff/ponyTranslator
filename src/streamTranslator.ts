import { Rule, Callback, Lemma } from './interface'
import { createWord } from './util/word'

export interface StreamTranslatorParam {
   direction?: 'forward' | 'backward'
   ruleArr: Rule[]
}

export interface STRule {
   pattern: Lemma[]
   replacement: string
   index: number
   jocker: boolean
}

export let createStreamTranslator = ({
   direction = 'forward',
   ruleArr,
}: StreamTranslatorParam) => {
   //
   // init
   //
   let ruleList = ruleArr.map(({ lef, rig }) => {
      let jocker = false
      if (lef.endsWith('*')) {
         lef = lef.slice(0, -1)
         jocker = true
      }
      if (rig.endsWith('*')) {
         rig = rig.slice(0, -1)
         jocker = true
      }
      if (direction === 'backward') {
         ;[lef, rig] = [rig, lef]
      }
      return {
         pattern: splitText(lef.toLowerCase()),
         replacement: rig.toLowerCase(),
         jocker,
      }
   })

   //
   // private
   //
   let buffer: Lemma[] = []
   let activeList: STRule[] = []
   let outputArr: Callback<string>[] = []

   /**
    * Dispatch a string to the registered callback functions
    * @param text Content to send to all subscribed outputs
    */
   function outputText(text: string) {
      outputArr.forEach((callback) => callback(text))
   }

   function lastLength(rule: STRule) {
      return rule.pattern.slice(-1)[0].word.length
   }

   function wordMatch(
      word: string,
      ruleWord: string,
      jocker: boolean,
   ): boolean {
      if (jocker) {
         return word.startsWith(ruleWord)
      } else {
         return word === ruleWord
      }
   }

   /**
    * Given a text, try all the rules on its words, keep the minimum of
    * words needed in the buffer and outputText() words as early as possible
    */
   function processText(text: string) {
      // output keeps the values to be outputted at the end of the function
      let output: string[] = []

      let lemmaArray = splitText(text)

      for (let k = 0; k < lemmaArray.length; k++) {
         let lemma = lemmaArray[k]

         let normalizedWord = lemma.word.toLowerCase()

         // first, identify the newly matching rules and add them to the active list
         for (let m = 0; m < ruleList.length; m++) {
            let rule = ruleList[m]

            if (wordMatch(normalizedWord, rule.pattern[0].word, rule.jocker)) {
               activeList.push({ ...rule, index: 0 })
            }
         }

         // then, go through the active list to filter the no-longer-matching rules,
         // to update the still-matching ones, and to see if any rule finishes
         // if several rules finish, keep the longest (i.e. the oldest)
         let finishedRule: STRule = undefined as any
         activeList = activeList.filter((active) => {
            let { word } = active.pattern[active.index]
            if (wordMatch(normalizedWord, word, active.jocker)) {
               active.index += 1
            } else {
               // the rule has failed to match the word and thus is removed
               return false
            }

            // the rule finishes if its index as reached its length
            // i.e. all the words of its pattern have been consumed
            if (active.index >= active.pattern.length) {
               if (
                  !finishedRule ||
                  lastLength(finishedRule) < lastLength(active)
               ) {
                  finishedRule = active
               }
               // the finished rule is removed from the active list
               return false
            }

            // the other unfinished rules are kept
            return true
         })

         // if a rule has matched, apply its replacement
         if (finishedRule!) {
            let patternSize = finishedRule.pattern.length
            if (patternSize === 1) {
               let word = createWord(finishedRule.replacement)
                  .withCaseOf(lemma.word)
                  .result()
               buffer.push({ word, sep: lemma.sep })
            } else {
               buffer.splice(-patternSize + 1, patternSize - 1, {
                  word: finishedRule.replacement,
                  sep: lemma.sep,
               })
            }

            if (finishedRule.jocker) {
               // the suffix is the end of the piece of the lemma word that is longer
               // than the pattern word
               let suffix = lemma.word.slice(
                  finishedRule.pattern.slice(-1)[0].word.length,
               )
               buffer.slice(-1)[0].word += suffix
            }

            // a rule has been applied; this invalidates all actives
            activeList = []
         } else {
            // else, store the lemma into the current buffer
            buffer.push(lemma)
         }

         // flush out the words of the current buffer that are no longer needed
         let maximumCount = 0
         activeList.forEach((active) => {
            let wordCount = active.index
            maximumCount = Math.max(maximumCount, wordCount)
         })
         while (buffer.length > maximumCount) {
            let lemma = buffer.shift()!
            output.push(lemma.word)
            if (lemma.sep) {
               output.push(lemma.sep)
            }
         }
         if (output.length > 0) {
            outputText(output.join(''))
            output = []
         }
      }
   }

   /**
    * Split a text into a series of lemma
    * @param text string to be split
    */
   function splitText(text: string): Lemma[] {
      let splitArr = text.split(/([ \t\n])/g) || []
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
   function subscribe(callback: Callback<string>) {
      outputArr.push(callback)
   }

   /**
    * `input` accepts the next piece of text that should be processed by
    * the (stream) translator
    * @param text the next text chunk of the input stream
    */
   function input(text: string) {
      processText(text)
   }

   /**
    * `finish` flushes and ends the stream. Removes registered outputs.
    */
   function finish() {
      let output: string[] = []
      buffer.forEach((lemma) => {
         output.push(lemma.word)
         if (lemma.sep) {
            output.push(lemma.sep)
         }
      })
      outputText(output.join(''))
      buffer = []
      outputArr = []
   }

   /**
    * `justTranslate` fully translates a text right away
    * @param text the content to translate
    */
   function justTranslate(text: string): string {
      let clone = createStreamTranslator({ ruleArr, direction })
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
