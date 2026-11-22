# Files you need to know

QuizUp looks large because most of the files were generated or came with a component kit. You do not study those to rebuild a project like this. This page is the map: what each folder is for, which files hold the real behavior, and what you can ignore.

There are two programs.

| Folder | What it is | Address |
|---|---|---|
| `src/` | The website: pages, buttons, and the calls to the API | `http://localhost:8081` (8080 when that port is free) |
| `backend/` | The API: checks, accounts, quizzes, and categories in MongoDB | `http://localhost:4000` |

A click on the website ends in `src/lib/`, which sends HTTP to `backend/src/routes/`. The route uses a model in `backend/src/models/` to read or write MongoDB.

Three labels are used below.

- **Learn.** You need this file to build the same project yourself. If you delete it, a feature disappears.
- **Know.** It connects other files or starts a program. Read it once. You will rarely change it.
- **Ignore.** It does not decide how QuizUp works. Come back only if a tool asks you to.

## `src/routes/`

One file per address in the browser. These files are thin: they choose a screen. The screen itself lives in `src/components/quizup/`.

| File | Label | Role |
|---|---|---|
| `quiz-types.tsx` | Learn | The important route. No search shows the type grid. `?category=Programming` shows that type's quizzes. `?category=Programming&quiz=<id>` opens the quiz so the person can play it. |
| `login.tsx` | Know | Shows the login form. |
| `signup.tsx` | Know | The `/signup` address. The home page also shows the sign-up form. |
| `index.tsx` | Know | The address `/`. It renders the sign-up screen. |
| `create-quiz.tsx` | Know | Old address. It only redirects to `/quiz-types`. Creating a quiz is a dialog now, not this page. |
| `__root.tsx` | Know | Wraps every page: the CSS file, the "page not found" view, and the toast area. You do not put quiz rules here. |
| `README.md` | Ignore | Notes about the router tool. |

If you removed `quiz-types.tsx`, the type grid, the list, and the play screen would have no address. The other route files would still be one-line wrappers.

## `src/components/quizup/`

These are the screens you would write yourself. Every file here matters.

| File | Label | Role |
|---|---|---|
| `category-screen.tsx` | Learn | The grid of types. A card opens that type. On a type you created, Rename and Delete sit beside the card. The four built-in types do not show those buttons. |
| `quiz-list-screen.tsx` | Learn | The quizzes inside one type. A card opens the quiz. Delete is shown only when `authorId` is the logged-in user. |
| `play-quiz-screen.tsx` | Learn | One question at a time, then the score. The score is calculated on the page. It is not saved in MongoDB. |
| `create-quiz-dialog.tsx` | Learn | The popup from "Create Your Quiz": title, type (or a new type), questions, and Publish. |
| `auth-screen.tsx` | Learn | Sign up and log in. It calls the API and stores the token. The Google button is still a fake preview. |
| `header.tsx` | Learn | The top bar. "Create Your Quiz" opens the dialog. It does not navigate to another page. |
| `question-editor.tsx` | Know | One question inside the dialog: the text, four options, and which option is correct. The dialog repeats this component. |

Removing any Learn file removes that screen. `question-editor.tsx` is the form piece the dialog is built from. You need it, and you do not need to memorize it before the dialog.

## `src/components/ui/`

A ready-made kit of buttons, menus, calendars, charts, and sidebars. QuizUp's screens use two of them.

| File | Label | Role |
|---|---|---|
| `button.tsx` | Learn | The button styles (`quiz`, `quizOutline`, and the icon button). |
| `dialog.tsx` | Learn | The popup shell used by "Create Your Quiz" and "Rename type". |
| everything else | Ignore | Calendar, chart, sidebar, table, and the rest are not used by the quiz screens. |

You use `Button` and `Dialog`. You do not need to know how Radix draws a dialog to rebuild QuizUp.

## `src/lib/`

Rules and API calls. No layout. This is the frontend half of the behavior.

| File | Label | Role |
|---|---|---|
| `auth.ts` | Learn | Saves the token in the browser (`quizup_token`) and the user id. `apiFetch` is the one function every other file uses to call `http://localhost:4000`. |
| `quiz.ts` | Learn | `validateQuiz` checks the title, the four options, and the correct answer before publish. The same rules exist again on the API. This copy lets the form show the error immediately. |
| `saved-quizzes.ts` | Learn | Create, list, get, and delete quizzes through `/api/quizzes`. |
| `quiz-types.ts` | Learn | List, create, rename, and delete types through `/api/categories`. |
| `utils.ts` | Ignore | Joins CSS class names for the UI kit. |
| `error-capture.ts`, `error-page.ts`, `lovable-error-reporting.ts` | Ignore | Error pages for the hosting tool. They do not check passwords or save quizzes. |

If you removed `auth.ts`, no screen could reach the API. If you removed `saved-quizzes.ts` or `quiz-types.ts`, the screens would have buttons and nowhere to send them.

## `src/hooks/`

| File | Label | Role |
|---|---|---|
| `use-mobile.tsx` | Ignore | A helper that detects a narrow window. The quiz screens do not use it. |

## `src/test/`

| File | Label | Role |
|---|---|---|
| `quiz.test.ts` | Know | Checks `validateQuiz`. When you change the publish rules, this test tells you if you broke them. |
| `setup.ts`, `app-routing.test.tsx` | Ignore | Test setup and an old routing check. Useful later, not for learning the API. |

## Files directly in `src/`

| File | Label | Role |
|---|---|---|
| `styles.css` | Learn | The layout: type cards, quiz cards, the play screen, the create dialog. The screens use these class names. |
| `env.d.ts` | Know | Tells TypeScript that `VITE_API_URL` may exist. The address of the API is read from that variable, or it defaults to `http://localhost:4000`. |
| `routeTree.gen.ts` | Ignore | Generated from the files in `src/routes/`. Do not edit it by hand. It is rewritten when routes change. |
| `router.tsx`, `server.ts`, `start.ts` | Ignore | Wiring for the TanStack framework. The quiz features are not written here. |

## `backend/src/models/`

One file per MongoDB collection. A model is the shape of a document and the name of the collection.

| File | Label | Role |
|---|---|---|
| `User.ts` | Learn | Collection `users`: username, email, and `passwordHash`. `toPublicUser` is the part the browser is allowed to see. The hash stays on the server. |
| `Quiz.ts` | Learn | Collection `quizzes`: title, the category id, the questions inside the same document, and the author id. `toPublicQuiz` turns that into the JSON the website reads, including the category name. |
| `Category.ts` | Learn | Collection `categories`: name, `builtIn`, and who created it. Also creates the four built-in types when the API starts, and turns old quizzes that still store a category name into category ids. |

Delete a model and that collection has no shape. The routes would have nothing to save.

## `backend/src/routes/`

One file per group of addresses. A route reads the request, checks it, and calls a model.

| File | Label | Role |
|---|---|---|
| `auth.ts` | Learn | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`. Hashes the password and returns the token. |
| `quizzes.ts` | Learn | List and get are public. Create, update, and delete require the token. Only the author can update or delete. The body still sends the category name. The route stores the category id. |
| `categories.ts` | Learn | List is public. Create, rename, and delete require the token. Built-in types cannot be changed. A type that still has quizzes cannot be deleted. |

## `backend/src/middleware/`

| File | Label | Role |
|---|---|---|
| `requireAuth.ts` | Learn | Reads `Authorization: Bearer <token>`, checks the signature with `JWT_SECRET`, and stores the user id on `res.locals.userId`. Quiz and category writes use that id. They do not trust an id sent in the JSON body. |

Without this file, anyone could create a quiz as someone else.

## Files directly in `backend/src/`

| File | Label | Role |
|---|---|---|
| `index.ts` | Learn | Starts the process: reads `.env`, connects to MongoDB, prepares the four built-in categories, then listens on port 4000. |
| `app.ts` | Learn | Builds the Express app: CORS for the website, JSON bodies, the three routers, and the handler that turns a bad JSON body into status 400. |

`index.ts` is the switch. `app.ts` is the list of what the switch turns on. Routes are mounted here. A new group of addresses is a new `app.use(...)` line.

## How a click crosses the folders

Publishing a quiz is the path worth tracing once.

1. `header.tsx` opens `create-quiz-dialog.tsx`.
2. The dialog uses `question-editor.tsx` and checks the form with `quiz.ts`.
3. A new type goes through `quiz-types.ts` to `POST /api/categories`.
4. Publish goes through `saved-quizzes.ts` and `auth.ts` to `POST /api/quizzes`, with the token.
5. `app.ts` sends that path to `routes/quizzes.ts`.
6. `requireAuth.ts` sets the author. `models/Category.ts` turns the type name into an id. `models/Quiz.ts` saves the document.
7. The dialog closes. `quiz-list-screen.tsx` loads the list again.

Sign-up is shorter: `auth-screen.tsx` to `lib/auth.ts` to `routes/auth.ts` to `models/User.ts`.

## Files outside `src/` and `backend/src/`

### Need these

| File | Role |
|---|---|
| `package.json` | Starts the website with `npm run dev`. Lists the frontend libraries. |
| `backend/package.json` | Starts the API with `npm run dev` from the `backend/` folder. Lists Express, mongoose, bcrypt, and the rest. |
| `backend/.env.example` | The three names the API expects: `MONGODB_URI`, `JWT_SECRET`, `PORT`. Copy it to `backend/.env` and fill the values. The real `.env` files stay on your machine. |
| `.gitignore` | Keeps `.env` and `node_modules/` out of git. |
| `README.md` | How to install and run the website. |
| `docs/how-authentication-works.md` | A written walkthrough of sign-up and login. |
| `docs/tp/` | Four practicals that rebuild the API in order: the server, accounts, quizzes, then categories. |

The root `.env` only holds `VITE_API_URL=http://localhost:4000` so the website knows where the API is. It is not committed.

### Know they exist

| File | Role |
|---|---|
| `vite.config.ts` | Starts the website. Port 8080 is the default. If it is busy, Vite moves to 8081. The API allows both. |
| `tsconfig.json` and `backend/tsconfig.json` | TypeScript settings for each program. You do not change these to add a feature. |

### Ignore

| File or folder | Why |
|---|---|
| `node_modules/` at the root and in `backend/` | Installed libraries. Never edit them. `npm install` recreates the folder. |
| `package-lock.json` in both places | The exact library versions npm installed. You do not read it. |
| `vitest.config.ts` | How tests run. |
| `eslint.config.js` | The linter. It skips the `backend/` folder. |
| `components.json` and `.lovable/` | The tool that generated the unused UI kit. |
| `AGENTS.md` | Notes for the coding assistant, not for the running app. |
| `roadmap.md` | An old checklist from when the app was only four screens. The API work is not listed there. |

## Order to rebuild it

Use this page as the map, and the practicals as the exercises.

1. [The server](tp/01-the-server.md): `backend/src/index.ts` and `backend/src/app.ts`.
2. [Accounts](tp/02-accounts.md): `models/User.ts`, `middleware/requireAuth.ts`, `routes/auth.ts`, then `src/lib/auth.ts` and `auth-screen.tsx`.
3. [Quizzes](tp/03-quizzes.md): `models/Quiz.ts`, `routes/quizzes.ts`, then `saved-quizzes.ts` and the list and play screens.
4. [Categories](tp/04-categories.md): `models/Category.ts`, `routes/categories.ts`, then `quiz-types.ts` and the type grid.

After those four, the files marked Learn are the whole product. Everything marked Ignore can stay unread.
