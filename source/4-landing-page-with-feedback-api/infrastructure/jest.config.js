module.exports = {
  roots: ['<rootDir>/test', '<rootDir>/lib/surveyService/lambda/'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
