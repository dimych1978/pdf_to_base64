import js from '@eslint/js';
import globals from 'globals';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';

export default [
  { ignores: ['dist', '*.config.js'] }, // Игнорируемые файлы
  
  // Базовые правила ESLint
  js.configs.recommended,

  // React правила
  {
    ...reactRecommended,
    rules: {
      ...reactRecommended.rules,
      'react/react-in-jsx-scope': 'off', // Для React 17+
      'react/prop-types': 'off',        // Если не используете prop-types
    }
  },

  // Хуки и обновление React
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    }
  },

  // Сортировка импортов
  {
    plugins: {
      'import': importPlugin,
    },
    rules: {
      'import/order': ['error', {
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ]
      }]
    }
  },

  // Общие правила
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    }
  }
];