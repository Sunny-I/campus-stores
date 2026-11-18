# Campus Stores

Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. Work through a club’s screening, from equipment pickup to a partial return and the next morning’s handover. Open **Candidate brief** in the app for the assignment.

## Run the app

Open `index.html` in a modern browser. The app uses the checked-in scripts, styles, and icons directly and can run offline.

To serve it over local HTTP, run this from the repository folder and visit [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Use `python3` if that is the Python command on your system. When browser storage is available, one browser tab can save and resume a sample shift at the same address. Use one active tab per shift to avoid overwriting progress. **Restart sample shift** restores the fictional starting records.

## Review the prototype

In **Requests**, choose **Prepare pickup** on the Film Society request. Select the collector and the tagged units in hand, then issue them together. Each unit gets its own return slip. **View loans** takes you to that request’s outstanding slips.

Use the desk overview to open shelf stock, outstanding slips, or overdue returns. In **Loan register**, search by asset tag, slip, request, or collector. After returning the projector and speaker, use **Write handover** on the outstanding adapter. On Saturday, use **View slip** from its Desk book note to check the tag before recording the return.

The [submission walkthrough](docs/SUBMISSION_SUMMARY.md) includes the baseline evidence, exact demo steps, and the proposed observation at a real counter.

## Run the checks

From the repository folder, use Node.js 22 or newer to check the script and replay the shift through the app's event handlers.

```sh
node --check app.js
node --test tests/shift.test.cjs
```

See the [verification report](docs/VERIFICATION_REPORT.md) for coverage and browser verification limits.

## Source

- `index.html` contains the desk layout, candidate brief, and bundled icons.
- `app.js` contains the sample records and interactions.
- `styles.css` defines the desktop and mobile layouts.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).

## Submit your work

1. [Fork Campus Stores](https://github.com/virinchi-healthcare/campus-stores/fork) into your GitHub account. Complete the candidate brief and push your changes to your public fork. In your README, point reviewers to your work and explain the decision you made.
2. In your fork, open **Commits**, select the final commit you want reviewed, and copy the page URL. It should look like `https://github.com/YOUR-USERNAME/campus-stores/commit/COMMIT-SHA`.
3. [Submit your work through the Google Form](https://docs.google.com/forms/d/e/1FAIpQLScvzoh1R4WS-SkiwAVBQbMvniieJYSoOEfLMyVo5CyjOvYUgQ/viewform). Your **roll number**, **email ID**, and **final commit link from your public fork** are required. Enter your roll number and email ID in the form only.
