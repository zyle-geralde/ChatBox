# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Run dev server (auto-restart via nodemon): `npm run dev`
- Run production server: `npm start`
- No test suite exists (`npm test` is a placeholder that exits with an error).
- No lint/build step — this is plain CommonJS Node.js served directly, and the frontend is static HTML/CSS/JS with no bundler.
- Requires a `.env` file (gitignored) with: `PORT`, `DATABASE_URI` (MongoDB connection string), and Firebase config vars (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId`).

## Architecture

ChatBox is a monolithic real-time 1-on-1 messenger. A single Express app ([server.js](server.js)) serves a JSON API, static frontend pages, and a Socket.IO realtime channel together on one port.

**Layering** (thin MVC, no service layer — controllers call Mongoose models directly):

```
server.js                 → app bootstrap: CORS, middleware, DB connect, Socket.IO handlers, route mounting
routers/api/*.js          → one Express router per resource; maps HTTP verb → controller function
controllers/*.js          → request validation + business logic + Mongoose calls
models/*.js               → Mongoose schemas (userDB.js = user, postDb.js = post/message)
middlewares/uploadPic.js  → Multer config (memory storage) used only by the upload route
frontEndFiles/*.html      → static pages; all client-side logic is inline <script> (jQuery + vanilla JS), no build step
```

Each API resource follows the same pattern: `routers/api/X.js` requires `controllers/XController.js` and wires it to a route (mostly a single `router.route("/")` with one verb). `routers/LogInSign.js` handles serving the two HTML pages and a catch-all 404, and is mounted last (`app.use("/", ...)`) so API routes take precedence.

**Data models:**
- `user` ([models/userDB.js](models/userDB.js)): `username`, `password` (bcrypt hash), `imageSrc` (Firebase Storage URL, or the literal string `"none"`).
- `post` ([models/postDb.js](models/postDb.js)): a chat message — `post` (text), `postDate` (a pre-formatted display string, not a Date object), `sender`, `receiver`. There is no conversation/thread document; a DM history is reconstructed per request by querying posts where `(sender, receiver)` matches either direction (see [controllers/getPostcontroller.js](controllers/getPostcontroller.js)).

**Realtime layer** ([server.js](server.js), inside `io.on('connection', ...)`): an in-memory `users` object maps `username → socket.id`, populated when the client emits `"join"` with a username it read from `localStorage` — there is no server-side auth tying a socket to an authenticated identity. Events:
- `join` — registers the socket under a username.
- `private_message` — server relays `{from, message, dateRel}` to the recipient's socket (looked up in `users`) and echoes it back to the sender.
- `typing` — relays a typing notice to the recipient only.
- `disconnect` — removes the socket's entry from `users`.

This map is process-local (not shared via Redis/pubsub), so it only works with a single server instance.

**File upload flow:** client → `POST /uploadProfPic` (multipart) → Multer buffers the file in memory → [controllers/uploadProfCont.js](controllers/uploadProfCont.js) uploads it to Firebase Storage → the resulting download URL is written to the matching user's `imageSrc` field and returned to the client, which persists it in `localStorage`. The `serverImages/` directory and the commented-out `multer.diskStorage` block in [middlewares/uploadPic.js](middlewares/uploadPic.js) are leftovers from a pre-Firebase local-disk upload approach and are no longer used.

**Auth model:** there is no session/token/cookie auth. `POST /login` and `POST /signup` just validate credentials against the `user` collection (bcrypt compare/hash) and return a success payload; the frontend then trusts `localStorage.username` for all subsequent identity-bearing calls (`/getPosts`, `/postMessage`, the Socket.IO `join` event). Any request or socket event can claim any username — keep this in mind before treating client-supplied `sender`/`username` values as trustworthy when making changes.

**CORS:** allowed origins are hardcoded in an `originList` array in [server.js](server.js) (localhost variants + the deployed Render URL). Add new origins there if deploying elsewhere.
