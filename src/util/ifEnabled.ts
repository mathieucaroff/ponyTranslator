/**
 *
 * @param longName The name of the feature
 * @param shortName an optional, shorter name for the feature
 */
export let ifEnabled = (longName, shortName?) => {
   let hashhas = (word: string) => {
      let { hash } = location
      let text = `#${word}`
      return hash.endsWith(text) || hash.includes(`${text}#`)
   }

   let test = () => {
      let result: boolean | undefined = window[longName] as any
      if (result === undefined && hashhas(longName)) {
         result = true
      }
      if (result === undefined && shortName && hashhas(shortName)) {
         result = true
      }
      if (result !== true) {
         result = false
      }
      return result
   }

   return {
      do: (callback) => {
         if (test()) {
            callback()
         }
      },
   }
}
