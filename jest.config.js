module.exports = {
   globals: {
      'ts-jest': {
         tsConfig: 'tsconfig.jest.json',
      },
   },
   moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'],
   transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
   },
   testMatch: ['**/*.test.ts'],
   testEnvironment: 'node',
}
