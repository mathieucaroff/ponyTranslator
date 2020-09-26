import { Rule, Err } from './interface.js'

export let parseRuleText = (ruleText: string): Rule[] | Err => {
   let isHeader = (text) => text.match(/^-{3,}$|^%YAML [0-9]/)
   let hasContent = (text) => text.match(/^[ \t]*[^ \t#]/)

   let hasNewline = (text) => text.match(/\n/)
   let onlyCrlf = (text) => hasNewline(text) && !text.match(/[^\r]\n/)

   if (onlyCrlf(ruleText)) {
      console.warn(
         'Rule file uses (untested) CRLF line endings. Please use LF line endings instead.',
         new Error().stack,
      )
   }

   let errorArr: Err[] = []
   let ruleArr: Rule[] = []
   ruleText.split(/\r?\n/).forEach(([line, k]) => {
      if (!hasContent(line) || isHeader(line)) {
         return
      }
      let result = parseRule(line)
      if ('err' in result) {
         errorArr.push({
            err: `Invalid rule: ${result.err}`,
            ctx: {
               line_number: k,
               line,
               ...(result.ctx || {}),
            },
         })
      } else {
         ruleArr.push(result)
      }
   })

   if (errorArr.length > 0) {
      return {
         err: 'Invalid rule file',
         ctx: {
            errorArr,
         },
      }
   }
   return ruleArr
}

export let parseRule = (line: string): Rule | Err => {
   let lef: string
   let rig: string

   // stringRg matches a ""-delimited or ''-delimited string
   //
   // wordRg matches a stringRg string, or a (delimiter-less) word
   // such a word can contain a space, but no colon. Spaces at the
   // begining and the end are ommited
   //
   // lineRegex matches a full key-value pair
   var stringRg = (k) => `("|')((?:[^\\${k}\\\\]|\\\\.)*)\\${k}`
   var wordRg = (k) => `(?:([^ \t0-9'":](?:[^:]*[^ :])?)|${stringRg(k)})`
   let [entry, comment] = line.split(/[ \t]+(#.*)$/)
   let linePartArr = entry.split(':')
   if (linePartArr.length !== 2) {
      if (linePartArr.length < 2) {
         return {
            err: 'Line must contain one colon separating key from value',
         }
      } else {
         return {
            err: `Line must contain exactly one colon but it contains ${
               linePartArr.length - 1
            } of them.`,
         }
      }
   } else {
      // Split-line match
      let [a, b] = linePartArr
      let ma = a.match(`^- *${wordRg(2)} *$`)
      let mb = b.match(`^ *${wordRg(2)}([ \t]*)$`)
      if (ma === null || mb === null) {
         return {
            err: [
               ...(ma === null ? ['Cannot parse key side'] : []),
               ...(mb === null ? ['Cannot parse value side'] : []),
            ].join('; '),
            ctx: {
               ...(ma === null ? { a } : {}),
               ...(mb === null ? { b } : {}),
            },
         }
      }
      lef = ma[1] || interpretString(ma[3])
      rig = mb[1] || interpretString(mb[3])
      let trailing = mb[4]
      if (trailing) {
         return {
            err: 'Trailing spaces at the end of the line are disallowed',
         }
      }
   }
   if (lef.split('*').length !== rig.split('*').length) {
      return {
         err: 'Unballanced number of asterisks "*"',
         ctx: { lef, rig },
      }
   }
   return {
      lef,
      rig,
   }
}

export let interpretString = (str: string) => {
   let res = str
      .replace(/\\t/g, '\t')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\(.)/g, '$1')
   return res
}
