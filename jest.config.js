module.exports = {
  preset: 'jest-expo',

  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/node_modules/@react-native-async-storage/async-storage/jest/async-storage-mock.js',
  },
};