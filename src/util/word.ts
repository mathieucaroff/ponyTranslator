export let createWord = (word: string) => {
   let result = () => word
   let withCaseOf = (model: string) => {
      if (model.match(/^[^a-z]+$/)) {
         return createWord(word.toUpperCase())
      } else if (model.match(/^[^A-Za-z]*[A-Z]/)) {
         return createWord(
            word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase(),
         )
      } else if (model.match(/^[^A-Za-z]*[^A-Z]/)) {
         return createWord(word.toLowerCase())
      } else if (!model) {
         throw new Error('Got empty model')
      } else if (!model.match(/[A-Za-z]/)) {
         throw new Error('Model must contain at least one letter')
      } else {
         throw new Error('Model case could not be identified')
      }
   }
   return {
      result,
      withCaseOf,
   }
}
