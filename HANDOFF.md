# AI Hand-off: Request/Response Wrapper Refactor

> **Read this before touching `req`/`res` handling anywhere in this repo.**
> This file exists so any AI session (or human) picking up this work cold has full
> context: not just *what* changed, but *why*, what was deliberately rejected, and
> what's still to come. Keep it updated at the end of every migration step (see
> "Update protocol" at the bottom) — don't let it go stale.

## TL;DR current state
- **Step 1 of an incremental, multi-step refactor is implemented but NOT committed
  and NOT runtime-tested** (no local `.env` in this environment; only `node -c`
  syntax checks were run).
- Scope of step 1: **`/login` and `/signup` only.** Every other endpoint is
  untouched on purpose — do not assume they follow the new pattern.
- Full diff so far: `utils/ApiRequest.js`, `utils/ApiResponse.js`,
  `middlewares/apiWrapper.js` (new files); `server.js`, `controllers/logInController.js`,
  `controllers/signUpController.js`, `frontEndFiles/LogInSignUp.html` (modified).

---

## Decisions log (chronological — read this to avoid relitigating settled questions)

| # | Decision | Rationale | Alternatives considered / rejected |
|---|---|---|---|
| 1 | Introduce a `Request`/`Response` wrapper layer at all | User is deliberately rebuilding this app to scale up (more users, more endpoints). Every controller previously hand-rolled its own validation guard and its own inconsistent `res.status().json()` shape — see "Before" table below. This was judged **not worth it for the app's original small scope**, but **worth it once the user confirmed active scaling plans**. | Leaving it as-is (rejected once scaling was confirmed as the actual goal). |
| 2 | Service layer is *not* the first refactor step | With only ~5-6 simple controllers, extracting a service layer had low immediate payoff and would touch controllers a second time after validation/response conventions were settled. Auth (currently **no real session/token auth** — any request can claim any username) is arguably more urgent for a scaling app, but the user chose to scope this work to response/request handling only, not auth. | Service layer first (rejected — see column 2). Auth first (raised as a bigger concern, but explicitly not in scope for this task — user wants this refactor scoped narrowly). |
| 3 | Response envelope: standardize to `{success, data}` / `{success, error}`, **including updating the frontend read-sites** rather than preserving old top-level keys | Asked the user directly (AskUserQuestion) with two options: (a) backend-only, preserve each endpoint's existing inconsistent top-level keys, zero frontend risk, or (b) real consistent envelope + update the small, bounded set of frontend read-sites that reference these keys directly. **User chose (b).** | (a) backend-only / preserve-keys — rejected explicitly. |
| 4 | Roll out one controller at a time, not all six + frontend in one shot | User explicitly rejected the first full plan ("burst it up") after seeing it covered all 6 controllers + 2 HTML files. Said: *"I don't want to burst it up. I want the changes to be one step at a time."* | Migrating all controllers/routes at once in a single PR-sized change — **explicitly rejected by the user, do not revert to this.** |
| 5 | Step 1 = login + signup specifically | Smallest coherent pair (both auth-adjacent, both touch only `LogInSignUp.html`) to prove the pattern before expanding. | — |
| 6 | Commit type for this work: `[refactor]`, not `[feat]` or `[fix]` | No new user-facing functionality was added (`feat`) and nothing was actually broken for the user before this change (`fix`) — login/signup behaved correctly before, just inconsistently internally. This is a pure internal restructuring with unchanged external behavior → `refactor`. | `feat` and `fix` — both rejected as inaccurate for this change. |
| 7 | Keep this hand-off as a versioned repo file (`HANDOFF.md`), not only in Claude's memory system | Memory only auto-loads for future *Claude Code* sessions in this specific environment. A repo file also helps a human teammate or a different AI tool reading the repo cold from a fresh clone. User explicitly asked to keep and strengthen this file rather than rely on memory alone. | Memory-only (rejected — user wants a durable, portable, repo-tracked doc). |

---

## "Before" state (for context — table only reflects what login/signup looked like *before* step 1)

| Controller | validation-error key | success key(s) | error key |
|---|---|---|---|
| logIn | `Error` | `imageSrc`, `success` | `message` |
| signUp | `"400"` (literal string key) | `success` | `message` / `"Status 409"` |

(getPosts, getUsers, postMessage, uploadProfPic have their own similarly
inconsistent shapes — **still true today**, since they haven't been migrated. See
"Not yet migrated" section below for their exact current shapes.)

## New response envelope contract (currently used by `/login` and `/signup` ONLY)
- Success: `{ "success": true, "data": { ... } }`
- Failure: `{ "success": false, "error": "<message>" }`

Important nuance: the HTTP status code is what actually routes a client to
success/error handling (e.g. jQuery's `$.ajax` picks `success` vs `error` callback
based on 2xx vs non-2xx status, not by inspecting the body). The envelope shape is a
*consistency convention* layered on top of correct status codes — it does not
replace the need to set the right status code.

---

## Files added (step 1)
- **`utils/ApiRequest.js`** — wraps `req`; exposes `.body`, `.file`, and
  `.missingFields(fieldNames)` → array of missing required field names from `.body`.
- **`utils/ApiResponse.js`** — wraps `res`; exposes `.success(data={}, status=200)`
  and `.fail(message, status=400)`, both sending the envelope above.
- **`middlewares/apiWrapper.js`** — Express middleware attaching `req.api = new ApiRequest(req)`
  and `res.api = new ApiResponse(res)` on every request. Mounted **globally**, so
  it's a harmless no-op for routes that don't use it yet — future migration steps
  won't need to touch `server.js` again to adopt it.

## Files modified (step 1)
- **`server.js`** — added `app.use(require("./middlewares/apiWrapper.js"))` right
  after `app.use(express.json())`, before the routers. No other change (global error
  handler at the bottom is untouched — still sends plain text on `next(err)`, not the
  JSON envelope).
- **`controllers/logInController.js`** — validation now via
  `req.api.missingFields(["username","password"])`; all responses now via
  `res.api.success(...)` / `res.api.fail(...)`.
- **`controllers/signUpController.js`** — same mechanical change; conflict path
  (`409`) now sends `res.api.fail("Username already exists", 409)`.
- **`frontEndFiles/LogInSignUp.html`** — the only frontend file that calls `/login`
  or `/signup`. Updated 4 read-sites:
  - `data.imageSrc` → `data.data.imageSrc` (login success)
  - `xhr.responseJSON["Status 409"]` → `xhr.responseJSON.error` (signup conflict)
  - `xhr.responseJSON.message` → `xhr.responseJSON.error` (login 401)
  - `xhr.responseJSON.Error` → `xhr.responseJSON.error` (login 400, console.log only)

---

## NOT yet migrated — current (still old/inconsistent) shapes as of this writing

Do not assume these follow the new envelope. Do not touch their frontend read-sites
until the matching controller is migrated in the same step, or the app breaks.

| Controller | Route | Current validation-error shape | Current success shape | Current error shape | Frontend file/read-sites |
|---|---|---|---|---|---|
| `getPostcontroller.js` | `POST /getPosts` | `400 {"Error":"Lacking parameters"}` | `200 {"allPost":allPost}` | `500 {"message":err.message}` | `mainPage.html`: `data.allPost` |
| `getUserController.js` | `GET /getUsers` | *(no guard)* | `200 {"usersList":allUsers}` | `500 {"message":err.message}` (DB call sits **outside** the try block — pre-existing bug, unhandled if DB fails) | `mainPage.html`: `data.usersList` |
| `postMessageController.js` | `POST /postMessage` | `400 {"Error":"Lacking parameters"}` | `201 {"success":true}` | `500 {"message":err.message}` | `mainPage.html`: `xhr.responseJSON.message` (on 400) |
| `uploadProfCont.js` | `POST /uploadProfPic` | `400 {"message":"No file uploaded"}` | `200 {"message":"...", "src":downloadURL}` | `500 {"message":err.message}` — **bug: catch param is named `error`, but body references undefined `err`; this throws a ReferenceError instead of returning a clean 500** | `mainPage.html`: `data.src`, `xhr.responseJSON.message` |
| `frontendController.js` (`errorhtml`) | catch-all 404 | — | — | `res.json({"Error":"404 File not Found"})` (one branch) | not consumed by frontend JS directly |

Also still true / unrelated pre-existing issues, intentionally left alone:
- Missing `await` on `userDB.create(...)` in signup and `postDb.create(...)` in
  postMessage (fire-and-forget, result unused).
- No service layer — controllers call Mongoose models directly (see root `CLAUDE.md`).
- No real auth — any request/socket event can claim any username via
  client-supplied values (see root `CLAUDE.md`, "Auth model" section).

---

## Ongoing plan / next steps

1. User picks the next controller to migrate — **one at a time**, same pattern as
   step 1: update controller → update its matching frontend read-site(s) in the same
   step → verify manually → commit → update this file.
2. Suggested order (smallest frontend blast radius first): `getUserController.js` (1
   read-site) → `postMessageController.js` (1 read-site) → `getPostcontroller.js` (1
   read-site) → `uploadProfCont.js` (2 read-sites; fix the undefined-`err` bug as a
   natural side effect of touching that catch block).
3. After all controllers are migrated: revisit the global Express error handler in
   `server.js` to send `res.api.fail(err.message, 500)` instead of plain text, for
   full consistency.
4. Bigger, explicitly deferred items raised during planning but *not* part of this
   refactor's scope: real auth/session handling, a service layer, and data-model
   changes (e.g. no conversation/thread document — DMs are reconstructed by querying
   all posts each request; in-memory socket `users` map only works single-instance).
   These were raised as real scaling concerns but the user chose to scope this
   specific effort to request/response handling only — revisit them as separate,
   explicitly-scoped tasks, not folded into this one.

## Update protocol (for whichever AI session does the next step)
After migrating another controller, update this file:
- Move that controller's row from "NOT yet migrated" into a growing "Migrated"
  section (add one if it doesn't exist yet, following the same table shape).
- Add a new row to the Decisions log **only** if a genuinely new decision/tradeoff
  was made (not for routine mechanical repeats of the same pattern).
- Update "TL;DR current state" to reflect the new scope covered.

## How to verify (once `.env` is available)
1. `npm run dev`.
2. Sign up a new user → success toast fires; duplicate username shows "Username
   already exists" (409, reads `xhr.responseJSON.error`).
3. Log in with wrong password/unknown user → inline error label shows correct text
   (401, reads `xhr.responseJSON.error`).
4. Log in successfully → `localStorage.image` set correctly (reads
   `data.data.imageSrc`), redirects to `mainPage.html`.
5. Confirm `mainPage.html` still works end-to-end (getUsers/getPosts/postMessage/
   uploadProfPic untouched, should behave exactly as before).
6. Check Network tab: `/login` and `/signup` responses follow the new envelope;
   every other endpoint's responses look exactly as they did before this change.
