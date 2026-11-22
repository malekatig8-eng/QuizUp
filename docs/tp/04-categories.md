# TP 4 — Categories

Do the exercises before you read the correction. This practical finishes the backend that QuizUp is running now.

## Goal

A category is its own document in the `categories` collection. A quiz stores that document's id. The JSON answer still contains the category **name**, so the website can keep using `/quiz-types?category=History`.

## What you already have

Practical 3: quizzes whose `category` field is a string. Listing `?category=Programming` compares that string.

That is enough to filter quizzes. It is a weak place to manage types:

- History does not exist until some quiz uses the word `"History"`.
- Deleting the last History quiz makes the name disappear.
- Renaming History means editing every quiz that contains the word.

A collection fixes those three. Creating History shows it before any quiz. Renaming changes one document. Deleting is a real action, and you can refuse it while quizzes still point at that id.

## Ideas you need

**`builtIn` is a yes/no flag.**

| Value | Meaning |
|---|---|
| `true` | Programming, Math, General Knowledge, or Science. The server creates these. They cannot be renamed or deleted. `createdBy` stays empty. |
| `false` | A type a logged-in user added. `createdBy` is that user. Only that user can rename or delete it. |

A new category is `builtIn: false` on purpose. If you saved it as `true`, the API would answer `Built-in types cannot be changed.`

**The quiz side of the link.** The field is still called `category`, but its type becomes an ObjectId with `ref: "Category"`. When you read a quiz for the client, you `populate("category")` so mongoose replaces the id with the category document. `toPublicQuiz` then reads `.name`. The browser keeps seeing `"Programming"`, not an id.

**Startup.** After MongoDB connects, `prepareCategories()`:

1. Creates the four built-in names if they are missing. If one of those names already exists as a custom type, it becomes built-in and loses `createdBy`.
2. Finds quizzes whose `category` is still a string (the documents from practical 3). It finds or creates a category with that name, then replaces the string with that category's id. The first quiz's author becomes `createdBy` when the category is new and not one of the four built-ins.

Use the raw collection for that second step (`mongoose.connection.collection("quizzes")`). If you load those old documents through the Quiz model, mongoose expects an ObjectId and the string `"Programming"` will not cast.

**Routes.** Mount `categoryRouter` at `/api/categories`, before the error handler.

| Request | Who | Success | Refusal |
|---|---|---|---|
| `GET /api/categories` | anyone | `200` `{ categories }` | |
| `POST /api/categories` | logged in | `201` `{ category }` | duplicate name → `409` `That type already exists.` |
| `PATCH /api/categories/:id` | the creator | `200` `{ category }` | built-in → `403` `Built-in types cannot be changed.` Other user → `403` `You can only edit your own types.` |
| `DELETE /api/categories/:id` | the creator | `204` | built-in → `403` `Built-in types cannot be deleted.` Other user → `403` `You can only delete your own types.` Quizzes still use it → `409` `Delete the quizzes in this type first.` |

Unknown id, including `not-an-id`: `404` `Type not found.`

Names are unique without caring about capitals, same collation as usernames: `{ locale: "en", strength: 2 }`. Trim the name, collapse repeated spaces, length 1 to 40. Empty: `Please enter a type name.` Too long: `Type name must be 40 characters or fewer.`

`GET` returns built-in types first, in the order Programming, Math, General Knowledge, Science, then the other names alphabetically.

The public category is `{ id, name, builtIn, authorId }`. `authorId` is `createdBy` as a string, or `null` for a built-in type.

## Exercise 1 — The category model and the four built-in types

Create `src/models/Category.ts` with `name`, `builtIn`, and optional `createdBy` (ObjectId, ref `"User"`). Unique index on `name` with the collation. Export `findCategoryByName`, `toPublicCategory`, and `prepareCategories`.

Call `await prepareCategories()` in `src/index.ts` after `mongoose.connect` and before `listen`. If it throws, print `Could not prepare quiz categories.` and exit.

**Check.** Restart the server. In Compass, database `quizup`, collection `categories`, you see four documents. Each has `builtIn: true` and no `createdBy`. Quizzes that still had a string category now store an ObjectId, and that id matches one of these documents.

## Exercise 2 — Category CRUD

Create `src/routes/categories.ts`.

`POST` body is `{ name }`. Save `builtIn: false` and `createdBy: res.locals.userId`. If `findCategoryByName` already finds it, `409`. Also catch MongoDB duplicate key `11000` and return the same `409`, for the race where two requests pass the check together.

`PATCH` order: not found, then built-in, then not the creator, then validate the new name, then reject when another category already has that name. Saving the same document with only different capitals (`history` → `History`) is allowed.

`DELETE` uses the same order, then `Quiz.countDocuments({ category: category._id })`. A count above zero is `409` with `Delete the quizzes in this type first.` Otherwise `deleteOne()` and `204`.

**Check.** Log in. `POST /api/categories` with `{ "name": "History" }` → `201`, `builtIn` is `false`, `authorId` is your user id.

- `POST` again with `{ "name": "history" }` → `409` `That type already exists.`
- `PATCH` a built-in id to `{ "name": "Code" }` → `403` `Built-in types cannot be changed.`
- Second user `PATCH` on your History → `403` `You can only edit your own types.`
- Your `PATCH` to `{ "name": "World History" }` → `200`.
- `GET /api/categories` with no token → `200`, and World History is in the list after the four built-ins.

## Exercise 3 — The quiz stores the category id

Change the quiz schema: `category` is an ObjectId ref `"Category"`, required.

`POST` and `PATCH` still receive a **name** in the JSON body (`"category": "World History"`). Look it up with `findCategoryByName`. If nothing matches, `400` and `Please choose a type.` Save `category._id`, not the name.

On every response that includes a quiz, `populate("category")` before `toPublicQuiz`. `toPublicQuiz` reads the name from the populated document. If the value is only an id, the name is `""`.

`GET /api/quizzes?category=World History` finds the category by name (capitals do not matter), then finds quizzes with that id. An unknown name returns `200` and `{ "quizzes": [] }`.

**Check.**

- `POST /api/quizzes` with `"category": "World History"` → `201`. The JSON `category` field is the string `World History`. In Compass the stored field is an ObjectId.
- `POST` with `"category": "Not A Type"` → `400` `Please choose a type.`
- `GET /api/quizzes?category=world history` → the quiz is in the list.
- `DELETE` the category while that quiz exists → `409` `Delete the quizzes in this type first.`
- Delete the quiz, then delete the category → `204`. `DELETE` again → `404` `Type not found.`

## What this is for on the website

The pages do not need a new shape. They already send a category name and read a category name. After this practical, "Add a new type" can call `POST /api/categories`, and Rename / Delete on a card you created can call `PATCH` and `DELETE`. The four original cards have `builtIn: true`, so the page does not show those buttons for them.

---

# Correction

The finished files are [backend/src/models/Category.ts](../../backend/src/models/Category.ts), [backend/src/routes/categories.ts](../../backend/src/routes/categories.ts), plus the category field in [backend/src/models/Quiz.ts](../../backend/src/models/Quiz.ts) and the lookup in [backend/src/routes/quizzes.ts](../../backend/src/routes/quizzes.ts). Startup calls `prepareCategories` from [backend/src/index.ts](../../backend/src/index.ts).

Creating a custom type always forces `builtIn` to false. The client is not allowed to choose the flag:

```ts
const category = await Category.create({
  name: parsed.data.name,
  builtIn: false,
  createdBy: res.locals.userId,
});
res.status(201).json({ category: toPublicCategory(category) });
```

`toPublicCategory` hides `createdBy` behind the name `authorId`, the same way a quiz hides `author` behind `authorId`:

```ts
return {
  id: category._id.toString(),
  name: category.name,
  builtIn: category.builtIn,
  authorId: category.createdBy ? category.createdBy.toString() : null,
};
```

Delete checks the cheap refusals before it counts quizzes. A stranger does not learn whether your type is empty.

```ts
if (category.builtIn) {
  res.status(403).json({ message: "Built-in types cannot be deleted." });
  return;
}
if (category.createdBy?.toString() !== res.locals.userId) {
  res.status(403).json({ message: "You can only delete your own types." });
  return;
}
const used = await Quiz.countDocuments({ category: category._id });
if (used > 0) {
  res.status(409).json({ message: "Delete the quizzes in this type first." });
  return;
}
```

The quiz route keeps the public contract from practical 3 (the body still contains a name) and changes only the stored value:

```ts
const category = await findCategoryByName(parsed.data.category);
if (!category) {
  res.status(400).json({ message: "Please choose a type." });
  return;
}
const quiz = await Quiz.create({
  title: parsed.data.title,
  category: category._id,
  questions: parsed.data.questions,
  author: res.locals.userId,
});
await quiz.populate("category");
```

`toPublicQuiz` can no longer copy `plain.category`, because that value is now a document (after `populate`) or an id (if you forgot `populate`). Read the name when it is there:

```ts
function categoryName(category: unknown) {
  if (category && typeof category === "object" && "name" in category && typeof category.name === "string") {
    return category.name;
  }
  return "";
}
```

The list does the lookup in the opposite direction. The query string is still a name. An unknown name is an empty list, so the page can say "No quizzes here yet" instead of an error.

```ts
const category = await findCategoryByName(categoryName);
if (!category) {
  res.json({ quizzes: [] });
  return;
}
const quizzes = await Quiz.find({ category: category._id }).sort({ createdAt: -1 }).populate("category");
```

You now have the three collections the website uses: `users`, `quizzes`, and `categories`. The score on the play screen is still calculated in the browser and is not stored. Saving past scores would be a new collection, and the current pages do not do that.
