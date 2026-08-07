/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo/android',
  // tsconfig의 `@/*` 경로 별칭을 Jest에도 동일하게 적용(assets가 먼저 매칭돼야 함).
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
