# Architectural Generations — Relational Structures in D3.js

An interactive, single-canvas force-directed network generated from real architect records in the Museum of Modern Art's open collection metadata. The selected architects are connected when their documented birth years are within six years of one another.

This version also includes a Firebase-backed engagement poll, added as **Fig. 03 / Engagement poll**, and a secure Firebase/OpenAI research chatbot, added as **Fig. 04 / Research agent**.

## Run locally

Because the visualization loads CSV files, serve this folder over HTTP rather than opening `index.html` directly:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

Before Firebase is configured, the page still loads and the poll or chatbot show setup messages. After Firebase is configured, votes are saved to Firebase Realtime Database and the chatbot calls OpenAI through a Firebase Function.

## Interaction and encoding

- Scroll to zoom and drag the background to pan.
- Drag any node to reposition it.
- Hover a node to open its detail pop-up and isolate its immediate cohort.
- Use **Reset view** to return to the initial framing.
- Switch between **Timeline**, which positions architects by birth year, and **Network**, which emphasizes relational proximity.
- Node color identifies the architect's broad geographic region, derived from MoMA's nationality field.
- Node size represents the number of architects in the selected birth cohort.
- Every edge means the two architects were born no more than six years apart.
- Edge weight represents birth-year proximity: architects born closer together have heavier links.

## Data provenance

The visualization is derived from the [Museum of Modern Art Collection dataset](https://github.com/MuseumofModernArt/collection), retrieved July 20, 2026. MoMA publishes this basic collection metadata under CC0. The source record supplies each selected architect's display name, nationality, birth year, death year, and museum constituent ID.

The node and edge files retain the exact field structure of the course example. The original generic fields are mapped as follows: `age` stores birth year, `department` stores MoMA's biographical nationality and lifespan, `friends` stores visible cohort degree, `relationship` describes the birth-year difference, and `strength` encodes birth-year proximity.

This is a derived generational comparison, not a claim of collaboration, influence, mentorship, or shared architectural style.

## Firebase poll setup

The poll asks:

> What should this relational atlas collect next?

It stores only anonymous aggregate vote totals for these choices:

- Archival images
- Oral histories
- Material timelines
- Fieldwork routes

The Firebase web app configuration from the Engagement components project has
already been added to `firebase-config.js`.

To finish connecting the poll:

1. Open the Firebase project from the assignment:
   `https://console.firebase.google.com/u/0/project/engagement-components-ef842/overview`
2. Open **Build > Realtime Database** and create a database if one does not already exist.
3. Use test mode briefly for class testing, or paste the rules below for a narrower prototype setup.
4. Test the page locally, then check the Realtime Database console after voting.

The poll writes to this database path:

```txt
polls/relational-atlas-next-layer/votes
```

For a class prototype, Firebase test mode can work briefly. For a shared/public page, use more limited rules. A simple starting point for this exact poll path is:

```json
{
  "rules": {
    "polls": {
      "relational-atlas-next-layer": {
        "votes": {
          ".read": true,
          "$option": {
            ".write": "$option === 'images' || $option === 'voices' || $option === 'materials' || $option === 'fieldwork'",
            ".validate": "newData.isNumber() && newData.val() >= 0"
          }
        }
      }
    }
  }
}
```

## Poll data ethics

The poll is intentionally low-stakes and stores only summed vote counts. It does not ask for names, emails, locations, or free-text responses. That matters because engagement components can become extractive when they identify people, hide what is being collected, or turn participation into surveillance.

## Firebase OpenAI agent setup

The chatbot follows the secure pattern from the course Agents examples, especially `Agents/Examples/04 Firebase Functions`: the browser calls Firebase, and Firebase calls OpenAI from server-side code. The OpenAI API key is never placed in `index.html`, `chatbot-app.js`, or any other client-side file.

The public page calls a Firebase callable function named:

```txt
chatWithAtlas
```

To finish the backend setup:

1. Install and sign in to the Firebase CLI.

   ```sh
   npm install -g firebase-tools
   firebase login
   ```

2. In Firebase Console, open **Build > Authentication > Sign-in method** and enable **Anonymous** sign-in.
3. In Firebase Console, add these authorized domains for Auth:
   - `jzhang2468.github.io`
   - `localhost`
4. Set the OpenAI API key as a Firebase Secret. Do not paste it into any website JavaScript file.

   ```sh
   firebase functions:secrets:set OPENAI_API_KEY
   ```

5. From the repository root, install function dependencies and deploy the function.

   ```sh
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

The function defaults to `gpt-4o-mini` for a lower-cost public prototype and can be changed with the `OPENAI_MODEL` environment variable. The function also uses a daily anonymous-user limit of `15`, configurable with `AGENT_DAILY_LIMIT`.

The chatbot backend writes lightweight usage metadata to these Realtime Database paths with the Admin SDK:

```txt
agentUsage/YYYY-MM-DD/{anonymousUid}
agentLogs/YYYY-MM-DD/{anonymousUid}
```

Those paths are written by the trusted Firebase Function, not by the public browser, so they do not need public write rules.

## Publish on GitHub Pages

Push every file in this folder to the same repository directory. Keep `index.html`, `app.js`, `style.css`, `geo-map.js`, `mapbox-token.js`, `firebase-config.js`, `poll-app.js`, `chatbot-app.js`, `nodes.csv`, and `edges.csv` together because the page uses relative paths. In the repository settings, enable GitHub Pages for that branch and directory. No build step is required for the static page. The Firebase Function is deployed separately with Firebase CLI.
