export let soon = (f) => (...args) => {
   return new Promise((resolve) => setTimeout(() => resolve(f(...args)), 1))
}

export let each = (...fargs) => (...args) => fargs.map((f) => f(...args))
