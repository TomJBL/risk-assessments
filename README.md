# JBL Designer's Risk Assessment

A browser tool for J B Langley Associates Ltd engineers. It produces a CDM 2015
Regulation 9 Designer's Risk Assessment PDF for domestic extensions, alterations
and new build houses, in the same house style as the structural calculation pack.

It runs entirely in the browser. Project details are never uploaded anywhere:
they stay in the engineer's own browser and in the project files they save.

## Using it

1. Fill in the project details (project, client, job no, revision, engineer, checker).
2. Pick the types of works. The matching risks are marked **Suggested**.
3. Press **Tick suggested risks**, then tick or untick anything else in the full list.
4. Open a ticked risk to edit its wording or change its H / M / L ratings.
5. Add a **project-specific risk** if the library doesn't cover something.
6. Press **Create PDF**. The PDF has a cover page, the Health & Safety
   section and the risk register.
7. Press **Save project file** and keep the `.json` file in the job folder. To issue
   the next revision, use **Open project file** to load it.

## Publishing on GitHub Pages

1. Create a new repository on GitHub, for example `jbl-risk-assessment`.
2. Upload every file in this folder, including the hidden `.nojekyll` file. The
   easiest way is **Add file → Upload files** and dragging the folder contents in.
3. Go to **Settings → Pages**. Under **Build and deployment**, choose
   **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
4. After a minute or two the site is live at
   `https://<your-account>.github.io/jbl-risk-assessment/`.
   Share that link with the engineers or add it to their browser favourites.

**Who can see it:** a GitHub Pages site can be opened by anyone who has the link,
including when the repository is private (private repositories need a paid GitHub
plan to use Pages). Only GitHub Enterprise Cloud can limit a Pages site to
signed-in members. The page asks search engines not to list it. The site holds only
the risk library and company details, never project data.

## Changing the risk library

All risks are in `js/risk-library.js`, one row per risk, with the format explained
at the top of that file. To edit it on GitHub, open the file, click the pencil icon,
make the change and commit. The site updates within a couple of minutes.

- To add a risk, copy a row, give it a new unique ref (for example `STR-14`) and edit it.
- Don't rename refs that are already in use, because saved project files refer to them.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `css/styles.css` | Styling (JBL teal, Arial) |
| `js/risk-library.js` | The risk library, the file to edit |
| `js/app.js` | The tool and the PDF layout |
| `js/logo.js` | JBL logo used in the PDF |
| `assets/jbl-logo.jpg` | JBL logo, also used as the browser tab icon |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

Creating a PDF needs an internet connection, because the PDF library (jsPDF) loads from cdnjs.
