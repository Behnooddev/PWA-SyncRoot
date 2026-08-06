# Publishing this wiki to GitHub

The files in this folder are the source for the project's GitHub wiki.
GitHub wikis are their own git repository (`<repo>.wiki.git`), separate
from the main repo, so these pages need to be pushed there once —
they're kept here in the main repo for now so they travel with the code
and get reviewed the same way everything else does.

## One-time setup

1. Push this repo to GitHub if you haven't already, and create at least
   one wiki page through the GitHub UI (Settings → Wikis → enable, then
   the "Create the first page" button). This initializes the wiki's git
   repo — it doesn't exist until at least one page has been saved once.

2. Replace the placeholder owner in every link:

   ```bash
   cd wiki
   grep -rl "Behnooddev/syncroot" . | xargs sed -i '' 's#Behnooddev/syncroot#your-github-username/syncroot#g'
   # (drop the '' after -i on Linux/GNU sed; macOS/BSD sed needs it)
   ```

3. Clone the wiki repo (note the `.wiki.git` suffix) and copy these files
   in:

   ```bash
   git clone https://github.com/your-username/syncroot.wiki.git
   cp wiki/*.md syncroot.wiki/
   cd syncroot.wiki
   git add .
   git commit -m "Import wiki pages from main repo"
   git push
   ```

## Keeping it in sync going forward

Treat `wiki/` in the main repo as the source of truth. When a phase
changes something the wiki documents (a new endpoint, a new decision, an
updated roadmap status), update the relevant page here in the same PR —
the same discipline as keeping `README.md`/`HOWTO.md`/`CHANGELOG.md` in
sync per `handoffs/PHASE_N_HANDOFF.md`'s file-changed lists. Then re-run
the copy step above to publish.

## Page index

| File | Renders as |
| --- | --- |
| `Home.md` | the wiki's landing page |
| `_Sidebar.md` | the persistent left-nav GitHub shows on every page |
| `_Footer.md` | the persistent footer GitHub shows on every page |
| `Getting-Started.md` | `Getting-Started` |
| `Architecture.md` | `Architecture` |
| `Data-Model.md` | `Data-Model` |
| `API-Reference.md` | `API-Reference` |
| `Roadmap.md` | `Roadmap` |
| `Development-Workflow.md` | `Development-Workflow` |
| `Known-Limitations.md` | `Known-Limitations` |
| `FAQ.md` | `FAQ` |
| `Contributing.md` | `Contributing` |

GitHub wikis turn a filename like `Data-Model.md` into a page reachable
at `.../wiki/Data-Model` and titled "Data Model" (hyphens become spaces
in the displayed title only) — that's why every internal link above uses
the hyphenated form, e.g. `[Data Model](Data-Model)`.
