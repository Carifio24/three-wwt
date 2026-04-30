// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
  { ignores: ['**/dist'] },
  
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.strict,
      ...typescriptEslint.configs.stylistic,
    ],
    
    
    languageOptions: {
      parser: typescriptEslint.parser, 
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: globals.browser,
    },
    
    rules: {
      "indent": ["error", 2],
      "@typescript-eslint/naming-convention": [
        "error", {
          selector: ["variable", "memberLike", "function"],
          format: ["camelCase"],
          leadingUnderscore: "allow"
        },
        {
          selector: ["variable"],
          modifiers: ["global", "const"],
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow"
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
          leadingUnderscore: "allow"
        },
        {
          selector: [
            "classProperty",
            "objectLiteralProperty",
            "typeProperty",
            "classMethod",
            "objectLiteralMethod",
            "typeMethod",
            "accessor",
            "enumMember"
          ],
          format: null,
          modifiers: ["requiresQuotes"]
        }
      ],
      "no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "error", {
          "args": "all",
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ],
      
      "@/semi": "error",
    },
    
  },
);
