# Naija Monopoly — Online Edition

A browser Monopoly game themed around Nigeria (states as properties, Naira currency,
"Wahala"/"Owambe" chance cards, EFCC jail, etc.) with **real online multiplayer**:
one player creates a room, gets a code, and friends join from their own devices.
Everything syncs live.

It's a single static file (`index.html`) — no server code to run — backed by a free
**Firebase Firestore** database for the room syncing. Firebase is Google's free
real-time database service; you need a free account, no credit card required for
this scale of use.

## 1. Create a free Firebase project (5 minutes)

1. Go to https://console.firebase.google.com and sign in with any Google account.
2. Click **Add project**, give it any name (e.g. `naija-monopoly`), and finish the wizard
   (you can skip Google Analytics).
3. In the left sidebar, click **Build → Firestore Database**, then **Create database**.
   Choose any region close to you, and start in **test mode** for now (we'll replace the
   rules with the ones below).
4. In the left sidebar, click the gear icon → **Project settings**. Scroll to
   **Your apps**, click the **</>** (web) icon, give the app a nickname, and click
   **Register app**. Firebase will show you a `firebaseConfig` object like this:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "naija-monopoly.firebaseapp.com",
     projectId: "naija-monopoly",
     storageBucket: "naija-monopoly.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

5. Copy that object and paste it into `index.html`, replacing the placeholder
   `firebaseConfig` near the top of the `<script>` section (look for the comment
   `STEP 1 — PASTE YOUR FIREBASE CONFIG BELOW`).

## 2. Set Firestore security rules

By default Firestore's "test mode" rules expire after 30 days. Go to
**Firestore Database → Rules** in the Firebase console and paste in the contents of
`firestore.rules` (included in this folder), then click **Publish**. These rules keep
things simple: anyone with a room code can read/write that room's document, and nothing
else is exposed. (This is fine for a casual game with friends — it is not meant to
resist a determined attacker guessing room codes, but 4-character codes plus the fact
that a room is useless once the game is over makes that a low risk for casual play.)

## 3. Put it on GitHub Pages

1. Create a new GitHub repository (public or private both work for Pages on a paid plan;
   public repos get Pages free).
2. Upload `index.html` (with your Firebase config already pasted in) to the repo — you
   can drag-and-drop it in the GitHub web UI, no command line needed.
3. Go to the repo's **Settings → Pages**, set **Source** to your default branch
   (usually `main`) and folder `/ (root)`, then save.
4. GitHub gives you a live URL like `https://yourusername.github.io/your-repo-name/`
   within a minute or two. That's the link you send your friends.

## How to play

1. One person opens the link, picks a name and token colour, and clicks **Create Room**.
   They get a 4-character room code.
2. They share that code with friends any way they like (chat, text, voice call).
3. Everyone else opens the same link, picks a name/colour, clicks **Join Room**, and
   types in the code.
4. Once at least 2 players have joined, the host clicks **Start Game**. From there it
   plays like normal Monopoly — roll, buy, pay rent, build houses, avoid EFCC Detention —
   with everyone's screen updating live as each person takes their turn.
5. Refreshing the page won't kick you out — it remembers your seat in the room (stored
   only in your own browser).

## Notes & limits

- **Free tier limits**: Firebase's free "Spark" plan comfortably handles casual games
  among friends (50k document reads/day, 20k writes/day) — you will not hit these limits
  with normal play.
- **No accounts needed** — players are identified by a random ID Firebase generates and
  stores in their own browser, tied to whichever name/colour they picked.
- **Trading between players** isn't implemented — everything else (buying, rent, houses/
  hotels, jail, tax, Wahala/Owambe cards, bankruptcy, win condition) is.
- If you want to reskin the board, colours, or card text, everything is in the single
  `index.html` file — the `spaces`, `chanceCards`, and `chestCards` arrays near the top
  of the `<script>` are the easiest places to start.
