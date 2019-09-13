import { interpretString, parseRule } from './parseRule'
import { Err } from './interface'

describe('interpretString', () => {
   it('Returns the string', () => {
      expect(interpretString('a!@#`"\'')).toBe('a!@#`"\'')
   })
   it('Handles escape sequences', () => {
      expect(interpretString(`\\'\\"`)).toBe(`'"`)
      expect(interpretString('\\`')).toBe('`')
      expect(interpretString('\\t\\n\\r')).toBe('\t\n\r')
   })
})

describe('parseRule', () => {
   it('Parses quoteless', () => {
      expect(parseRule('- a: b')).toEqual({
         lef: 'a',
         rig: 'b',
      })
   })
   it('Parses double quotes', () => {
      expect(parseRule('- "a": "b"')).toEqual({
         lef: 'a',
         rig: 'b',
      })
   })
   it('Parses single quotes', () => {
      expect(parseRule("- 'a': 'b'")).toEqual({
         lef: 'a',
         rig: 'b',
      })
   })
   it('Allows mixing quote styles', () => {
      expect(parseRule("- 'a': b")).toEqual({
         lef: 'a',
         rig: 'b',
      })
   })
   it('Allows quoteless to contain spaces', () => {
      expect(parseRule('- a z: b y')).toEqual({
         lef: 'a z',
         rig: 'b y',
      })
   })
   it('Understands comments', () => {
      expect(parseRule('- a: b # comment')).toEqual({
         lef: 'a',
         rig: 'b',
      })
   })
   it('Yields useful error messages', () => {
      var { err } = parseRule('- *a*: b*') as Err
      expect(err.toLowerCase()).toContain('asterisk')

      var { err } = parseRule('- a: b ') as Err
      expect(err.toLowerCase()).toContain('trailing space')

      var { err } = parseRule('- : b') as Err
      expect(err.toLowerCase()).toContain('cannot parse key side')

      var { err } = parseRule('- a:') as Err
      expect(err.toLowerCase()).toContain('cannot parse value side')

      var { err } = parseRule('- ::') as Err
      expect(err.toLowerCase()).toContain('colon')
   })
})
