export type Callback<T> = (data: T) => void

/**
 * An Err is a custom Error object that can be returned by a function.
 * This method prefered to throwing because JS error handling is very
 * bad.
 */
export interface Err {
   err: string
   ctx?: unknown
}

/**
 * A Lemma is a word, together with the separator which comes after it.
 * Lemmas are used when spliting a string, to be able to restore the
 * separator later on.
 */
export interface Lemma {
   word: string
   sep?: string
}

/**
 * A Rule specifies the conversion of a word, a prefixe or an expression
 * to another.
 */
export interface Rule {
   lef: string
   rig: string
}
