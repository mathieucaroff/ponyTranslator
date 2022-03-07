import { Rule } from './interface'
import { createStreamTranslator } from './streamTranslator'
import ruleData from '../pony.rule.yml'

export interface PonyTranslatorParam {
   direction?: 'forward' | 'backward'
   ruleGetter?: () => Rule[]
}

function getRuleArr() {
   return ruleData.map((entry): Rule => {
      let [lef, rig] = Object.entries(entry)[0] as [string, string]
      return { lef, rig }
   })
}

export let createPonyTranslator = (param: PonyTranslatorParam = {}) => {
   let { direction, ruleGetter = getRuleArr } = param
   ruleData

   let ruleArr = ruleGetter()

   return createStreamTranslator({
      direction,
      ruleArr,
   })
}
