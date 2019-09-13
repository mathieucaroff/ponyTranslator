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
         throw {
            err: 'Got empty model',
         }
      } else if (!model.match(/[A-Za-z]/)) {
         throw {
            err: 'Model must contain at least one letter',
         }
      } else {
         throw {
            err: 'Model case could not be identified',
         }
      }
   }
   return {
      result,
      withCaseOf,
   }
}
