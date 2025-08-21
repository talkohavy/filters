## 🛠️ Project Awareness and Context

- **Always read the `PLANNING.md`** file at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check the TASKS.md** before starting a new task. If the task is not listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.

---

## ✅ Task Completion Guidelines

- **Mark completed tasks in the `TASKS.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASKS.md` under a "Discovered During Work" section.

---

## 🧩 Code structure and modularity

- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Use clear consistent imports** (prefer relative imports and avoid circular dependencies).

---

## 🧪 Testing and Quality Assurance

- **Always write unit tests for new code**. Use the existing test files as a reference.
- **After updating any logic**, check whether existing unit tests need to be updated. If so, update them accordingly.
- **Tests should be placed in the same directory as the code they test**, following the naming convention `*.test.ts` or `*.spec.ts`.
- Never add "Arrange" "Act" or "Assert" comments in tests.

---

## 🎨 Code Style and Practices

- Use TypeScript as the primary language.
- Prefer async/await syntax over .then()/.catch()
- Prefer writing functions using the `function` keyword, rather than using arrow functions or `const` function expressions.
- Prefer typescript over javascript.
- Prefer `Array.forEach` over `for of`.
- Prefer optional chaining (e.g., `registration?.sync`) over using logical AND (`registration && registration.sync`) inside conditional statements.
- Always destruct the "props" object inside the function body, never in the function's signature.
- All imports should be relative.
- Avoid returning the output of a function directly as the input to another function. Always store the output in a variable first before passing it to another function.
- Never return a promise. Always store the awaited result in a variable and then return that variable.
