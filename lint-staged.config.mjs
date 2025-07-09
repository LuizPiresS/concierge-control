export default {
  '*.{js,ts}': ['eslint --fix', 'prettier --write', 'npm test -- --findRelatedTests --passWithNoTests'],
};
