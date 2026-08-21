/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo/android',
  // tsconfig의 `@/*` 경로 별칭을 Jest에도 동일하게 적용(assets가 먼저 매칭돼야 함).
  // CSS는 `@/*`보다 먼저 잡아야 한다 — `@/global.css`가 별칭으로 새면 파싱에 실패한다.
  moduleNameMapper: {
    '\\.css$': '<rootDir>/jest/styleMock.js',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
