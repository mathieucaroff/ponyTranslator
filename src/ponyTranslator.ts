import { Rule } from './interface.js'
import { parseRuleText } from './parseRule.js'
import { createStreamTranslator } from './streamTranslator.js'

let getText: () => Promise<string>
if (!window) {
   getText = async () => {
      let {
         promises: { readFile },
      } = await import('fs')
      let ruleText = await readFile(`${__dirname}/../pony.rule.yml`, 'utf-8')
      return ruleText
   }
} else {
   getText = async () => {
      let response = await fetch('.../../pony.rule.yml')
      let ruleText = await response.text()
      return ruleText
   }
}

export let getRuleArr = async () => {
   let text = await getText()
   let res = parseRuleText(text)
   if ('err' in res) {
      console.error(res)
      throw res
   }
   return res
}

export interface PonyTranslatorParam {
   direction?: 'forward' | 'backward'
   ruleGetter?: () => Promise<Rule[]>
}

export let createPonyTranslator = async (param: PonyTranslatorParam = {}) => {
   let { direction, ruleGetter = getRuleArr } = param

   let ruleArr = await ruleGetter()

   return createStreamTranslator({
      direction,
      ruleArr,
   })
}
