# Temporal Structures in D3.js

This website uses one D3.js visualization, a modified CSV dataset, and a local copy of the D3 v7 library.

## Local Server

Because the D3 script loads `events.csv`, open the project through a local server rather than by double-clicking `index.html`.

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

The CSV follows the class example format exactly:

```text
name,start,end,category
```

The data is synthetic and represents overlapping temporal phases in a fictional waterfront climate adaptation project.
