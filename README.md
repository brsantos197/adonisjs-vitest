# Adonis JS + Vitest

> A boilerplate for creating AdonisJS packages

This repository automates the configuration of Vitest in AdonisJS V6 by replacing the Japa Test Runner

## Installation

- Install dependencies.
  ```sh
  npm i -D adonisjs-vitest
  ```
- Run configure script
  ```sh
  node ace configure adonisjs-vitest
  ```
  After this, some new files will be created in your project:
  ```
  ├── vitest.config.ts
  ├── tests
    └── unit
    | └── setup.ts
    ├── integration
    | └── setup.ts
    ├── e2e
    | └── setup.ts
  ```
- `vitest.config.ts` will have Vitest settings
- each `setup.ts` file will have environment settings for each test group
