(() => {
  const storageKey = "campus-stores.shift.v1";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const saturday = 24 * 60;
  const deadlines = {
    "Fri 8 pm": 20 * 60,
    "Sat 9 am": saturday + 9 * 60,
    "Sat 10 am": saturday + 10 * 60,
    "Sat noon": saturday + 12 * 60,
  };
  const dueTimes = Object.keys(deadlines);
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      minute: 15 * 60 + 45,
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening at four. Open the approved request and choose Prepare pickup to issue the kit.",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      minute: 19 * 60 + 30,
      title: "The kit comes back in pieces",
      text: "Kabir brought back the projector and speaker. Leela will bring the adapter tomorrow at nine. Record the two returns, then choose Write handover on the adapter’s outstanding slip.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      minute: saturday + 9 * 60,
      title: "Morning shift",
      text: "Leela has arrived with an adapter. Open the linked slip from the Desk book or look up the tag in the Loan register. Compare the asset tag before recording the return.",
    },
  ];
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const original = () => ({
    version: 1,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    onlyOpen: true,
    overdueOnly: false,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  let selectedLoanNum = null;
  let preparingPickup = false;
  let loanQuery = "";
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const getLoan = (num, loans = s.loans) => {
    if (!Number.isInteger(num)) return;
    const matches = loans.filter((loan) => loan.num === num);
    return matches.length === 1 ? matches[0] : undefined;
  };
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const stockStatus = (asset) => asset.repair ? "In repair" : out(asset.id) ? "On loan" : "On shelf";
  const isAvailable = (asset) => stockStatus(asset) === "On shelf";
  const openTypeLoan = (requestId, type) =>
    s.loans.find((loan) =>
      !loan.back && loan.req === requestId && getAsset(loan.asset).type === type,
    );
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list, selected = "") =>
    list
      .map(([v, t]) => `<option value="${esc(v)}"${v === selected ? " selected" : ""}>${esc(t)}</option>`)
      .join("");
  const optionPairs = (values) => values.map((value) => [value, value]);
  function selectField(label, name, options, { selected = "", optional = false } = {}) {
    const placeholder = optional ? "Leave for later" : "Select…";
    return `<label><span>${esc(label)}</span><select name="${esc(name)}"${optional ? "" : " required"}>
      <option value="">${placeholder}</option>${opts(options, selected)}
    </select></label>`;
  }
  const btn = (label, act, val = "", style = "", ariaLabel = "") => {
    const accessibleName = ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : "";
    return `<button type="button" data-action="${act}" data-val="${esc(val)}" class="${style}"${accessibleName}>${esc(label)}</button>`;
  };
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, good = false) =>
    '<span class="tag' + (good ? " good" : "") + '">' + esc(t) + "</span>";
  const slipId = (loan) => `L-${loan.num}`;
  const slipTitle = (loan) => `${slipId(loan)} · ${loan.asset}`;
  const slipStatus = (loan) =>
    badge(loan.back ? "Returned" : "Outstanding", loan.back);
  const isOverdue = (loan) => !loan.back && shifts[s.phase].minute > deadlines[loan.due];
  const overdueBadge = '<span class="tag overdue">Overdue</span>';
  const assetDescription = (loan) => {
    const asset = getAsset(loan.asset);
    return `${asset.type} · ${asset.model}`;
  };
  function pickupLines(request) {
    return request.items.map((type) => {
      const loan = openTypeLoan(request.id, type);
      const available = loan ? [] : assets.filter((asset) => asset.type === type && isAvailable(asset));
      return { type, loan, available };
    });
  }
  function pickupStatus(lines) {
    const remaining = lines.filter((line) => !line.loan);
    if (!remaining.length) return badge("All items on loan");
    const ready = remaining.filter((line) => line.available.length).length;
    return badge(`${ready} of ${remaining.length} ready to issue`, ready === remaining.length);
  }
  function pickupButton(request) {
    return btn("Prepare pickup", "prepare-pickup", request.id, "primary", `Prepare pickup for ${request.club}`);
  }
  function pickupForm(request, lines) {
    const units = lines.map(({ type, loan, available }, index) => {
      if (loan) return `<div class="pickup-unavailable"><strong>${esc(type)}</strong><small>On loan as ${esc(slipTitle(loan))}</small></div>`;
      if (!available.length) return `<div class="pickup-unavailable"><strong>${esc(type)}</strong><small>No unit on the shelf</small></div>`;
      const choices = available.map((asset) => [asset.id, `${asset.id} · ${asset.model} · Shelf ${asset.bin}`]);
      return selectField(type, `asset-${index}`, choices, { optional: true });
    }).join("");
    return `<form data-pickup class="record pickup-form">
      <small>${esc(request.id)} · ${esc(request.club)}</small>
      <h3 data-pickup-heading tabindex="-1">Prepare pickup for ${esc(request.event)}</h3>
      <p>${esc(request.note)}</p>
      <div class="form">
        ${selectField("Collected by", "who", optionPairs(people))}
        ${selectField("Return by", "due", optionPairs(dueTimes), { selected: request.due })}
      </div>
      <fieldset class="pickup-items"><legend>Units to issue</legend><div class="form">${units}</div></fieldset>
      <p class="form-error" role="alert" data-pickup-error></p>
      <div class="buttons"><button type="submit" class="primary">Issue selected units</button>${btn("Cancel", "cancel-pickup")}</div>
    </form>`;
  }
  function requestPage() {
    const html = head(
      "Approved requests",
      `Student Activities Office · ${requests.length} approved forms`,
    );
    const request = getReq(s.selected);
    if (!request) {
      const cards = requests.map((r) => {
        const lines = pickupLines(r);
        const prepare = lines.some((line) => line.available.length) ? pickupButton(r) : "";
        return `<article class="request-card">
          <div>
            <small class="request-reference">${esc(r.id)} · ${esc(r.club)}</small>
            <h3>${esc(r.event)}</h3>
            <div class="request-meta">
              ${pickupStatus(lines)}
              <small>Due ${esc(r.due)}</small>
            </div>
          </div>
          <div class="request-actions">
            ${btn("View form", "request", r.id, "", `View form for ${r.club}`)}${prepare}
          </div>
        </article>`;
      }).join("");
      return html + `<div class="request-grid">${cards}</div>`;
    }

    const lines = pickupLines(request);
    if (preparingPickup) return html + pickupForm(request, lines);
    const prepare = lines.some((line) => line.available.length) ? pickupButton(request) : "";
    const viewLoans = lines.some((line) => line.loan) ? btn("View loans", "request-loans", request.id) : "";
    const equipment = lines.map(({ type, loan, available }) => {
      const status = loan ? `On loan as ${slipTitle(loan)}` : `${available.length} on shelf`;
      return `<li>${esc(type)} <small>${esc(status)}</small></li>`;
    }).join("");
    return html + `<article class="record">
      <small>${esc(request.id)} · Approved</small><h3 data-request-heading tabindex="-1">${esc(request.event)}</h3>
      <p>${esc(request.club)} · Filed by ${esc(request.owner)}</p>
      <p><b>Return by</b> ${esc(request.due)}</p>
      <p><b>Approved equipment</b></p><ul>${equipment}</ul>
      <p>${esc(request.note)}</p>
      <div class="buttons">${prepare}${viewLoans}${btn("Back to list", "close")}</div>
    </article>`;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    const shown = assets.map((asset) => ({ asset, status: stockStatus(asset) }))
      .filter(({ status }) => s.filter === "All items" || s.filter === status);
    if (!shown.length) return html + '<p class="empty-state">No units match this availability filter.</p>';
    for (const { asset, status } of shown) {
      html += row(
        `${asset.id} · ${asset.type}`,
        `${asset.model} · ${asset.bin === "Workshop" ? asset.bin : `Shelf ${asset.bin}`}`,
        badge(status, status === "On shelf"),
      );
    }
    return html;
  }
  function register() {
    const selectedLoan = getLoan(selectedLoanNum);
    if (selectedLoan) return slipDetails(selectedLoan);

    let html = head(
      "Loan register",
      "One slip per physical unit",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) {
      const available = assets.filter(isAvailable);
      return (
        html +
        '<form data-issue><div class="form">' +
        selectField(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
        ) +
        selectField(
          "Unit leaving the desk",
          "asset",
          available.map((a) => [a.id, a.id + " · " + a.type]),
        ) +
        selectField("Collected by", "who", optionPairs(people)) +
        selectField("Return by", "due", optionPairs(dueTimes)) +
        '</div><button type="submit" class="primary">Save issue slip</button></form>'
      );
    }
    const scope = s.overdueOnly ? 2 : s.onlyOpen ? 0 : 1;
    const scopeButtons = ["Outstanding", "All slips", "Overdue"].map((label, index) =>
      `<button type="button" data-action="scope" data-val="${index}" aria-pressed="${scope === index}">${label}</button>`,
    ).join("");
    return html + `<div class="register-tools">
      <label class="loan-search"><span>Find a slip</span><input data-loan-query type="search"
        value="${esc(loanQuery)}" placeholder="Asset tag, slip, request or collector" aria-controls="loan-results"
        autocomplete="off" spellcheck="false" /></label>
      <div class="buttons" role="group" aria-label="Filter loan slips">${scopeButtons}</div>
    </div>
    <p class="loan-count" role="status" data-loan-count tabindex="-1"></p>
    <div id="loan-results" data-loan-results></div>`;
  }
  function loanRows(loans) {
    if (!loans.length) {
      const message = loanQuery.trim()
        ? "No slips match this search."
        : s.overdueOnly ? "No overdue slips at this desk time." : "No outstanding slips.";
      return `<p class="empty-state">${message}</p>`;
    }
    return loans.map((l) => {
      const request = getReq(l.req);
      let controls;
      if (l.back) controls = badge("Returned");
      else if (!getLoan(l.num)) controls = badge("Duplicate slip number");
      else
        controls = `<div class="slip-actions">
          ${isOverdue(l) ? overdueBadge : ""}
          ${btn(
            "Record return",
            "return",
            l.num,
            "",
            `Record return for ${l.asset} on ${slipId(l)}`,
          )}
          ${btn(
            "Write handover",
            "write-handover",
            l.num,
            "",
            `Write handover for ${l.asset} on ${slipId(l)}`,
          )}
        </div>`;
      return row(
        slipTitle(l),
        `${request.id} · ${request.club} · ${getAsset(l.asset).type} · ${l.who} · Due ${l.due}`,
        controls,
      );
    }).join("");
  }
  function paintLoanResults() {
    const results = q("[data-loan-results]");
    if (!results) return;

    const words = loanQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const loans = s.loans.filter((loan) => {
      if (s.overdueOnly ? !isOverdue(loan) : s.onlyOpen && loan.back) return false;
      if (!words.length) return true;
      const request = getReq(loan.req);
      const text = [slipId(loan), loan.asset, assetDescription(loan), request.id, request.club, request.event, loan.who]
        .join(" ").toLowerCase();
      return words.every((word) => text.includes(word));
    }).reverse();
    results.innerHTML = loanRows(loans);
    q("[data-loan-count]").textContent = `${loans.length} ${loans.length === 1 ? "slip" : "slips"} shown`;
  }
  function slipDetails(loan) {
    const request = getReq(loan.req);
    const returnHint = loan.back
      ? ""
      : `<p>Match the physical asset tag to <strong>${esc(loan.asset)}</strong> before recording the return.</p>`;
    return (
      head("Loan register", "One slip per physical unit") +
      `<article class="record">
         <div class="slip-heading">
           <h3 data-slip-heading tabindex="-1">${esc(slipTitle(loan))}</h3>
           ${slipStatus(loan)}
           ${isOverdue(loan) ? overdueBadge : ""}
         </div>
         <p>${esc(assetDescription(loan))}</p>
         <p>${esc(request.id)} · ${esc(request.club)} · ${esc(request.event)}</p>
         <p>Collected by ${esc(loan.who)} · Due ${esc(loan.due)}</p>
         ${returnHint}
         <div class="buttons">
           ${loan.back ? "" : btn("Record return", "return", loan.num, "primary")}
           ${btn("Back to Desk book", "back-to-desk-book")}
         </div>
       </article>`
    );
  }
  function handoverForm(loan) {
    const target = loan
      ? `<h3 id="handover-target">Write handover for ${esc(slipTitle(loan))}</h3>
         <p>${esc(assetDescription(loan))} · ${esc(loan.req)}</p>`
      : "";
    const submit = loan
      ? '<button type="submit" class="primary">Save linked handover</button>'
      : '<button type="submit">Add handover note</button>';
    const controls = loan
      ? `<div class="buttons">${submit}${btn("Cancel", "cancel-handover")}</div>`
      : submit;
    return `<form data-note${loan ? ' class="record"' : ""}>
      ${target}
      <div class="form">
        <label class="full">
          <span>Note for the next shift</span>
          <textarea name="note" rows="2" maxlength="400" required${loan ? ' aria-describedby="handover-target"' : ""}></textarea>
        </label>
      </div>
      ${controls}
    </form>`;
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const selectedLoan = getLoan(selectedLoanNum);
    if (selectedLoan) html += handoverForm(selectedLoan);

    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([
        shifts[n.phase].time,
        "Counter handover",
        n.text,
        getLoan(n.loanNum),
      ]);
    for (const [t, author, body, loan] of entries.reverse()) {
      const heading = loan
        ? `<div class="slip-heading">
             <h3 data-linked-note-heading tabindex="-1">Handover for ${esc(slipTitle(loan))}</h3>
             ${slipStatus(loan)}
           </div>
           <p>${esc(assetDescription(loan))} · ${esc(loan.req)}</p>`
        : `<h3>${esc(author)}</h3>`;
      const link = loan
        ? `<div class="buttons">${btn(
            `View slip ${slipId(loan)}`,
            "view-slip",
            loan.num,
            "",
            `View slip ${slipId(loan)} for ${loan.asset}`,
          )}</div>`
        : "";
      html += `<article class="record"><small>${esc(t)}</small>${heading}<p class="handover-note">${esc(body)}</p>${link}</article>`;
    }
    return selectedLoan ? html : html + handoverForm();
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paintOverview() {
    const outstanding = s.loans.filter((loan) => !loan.back);
    const overdue = outstanding.filter(isOverdue).length;
    const cards = [
      { key: "on-shelf", label: "Units on shelf", icon: "package", count: assets.filter(isAvailable).length },
      { key: "outstanding", label: "Outstanding", icon: "book-open", count: outstanding.length },
      { key: "overdue", label: "Overdue", icon: "clipboard-list", count: overdue },
    ];
    q("[data-overview]").innerHTML = cards.map(({ key, label, icon, count }) => `
      <button type="button" class="overview-card${key === "overdue" && count ? " has-overdue" : ""}"
        data-action="overview" data-val="${key}">
        <span class="overview-icon" aria-hidden="true"><svg class="store-icon"><use href="#icon-${icon}"></use></svg></span>
        <span class="overview-content"><strong>${count}</strong><span>${label}</span></span>
        <span class="overview-arrow" aria-hidden="true">→</span>
      </button>`).join("");
  }
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    paintOverview();
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    paintLoanResults();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
  }
  function commit(msg, focus) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
    if (focus) q(focus)?.focus();
  }
  function openTab(tab) {
    s.tab = tab;
    s.editing = false;
    selectedLoanNum = null;
    preparingPickup = false;
  }
  function showOpenLoans(query, overdue = false) {
    openTab("Loan register");
    loanQuery = query;
    s.onlyOpen = true;
    s.overdueOnly = overdue;
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    let focus;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        selectedLoanNum = null;
        preparingPickup = false;
        loanQuery = "";
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        if (!Object.hasOwn(screens, v)) return;
        openTab(v);
        focus = `[data-action="tab"][data-val="${v}"]`;
        break;
      case "overview":
        if (v === "on-shelf") {
          openTab("Inventory");
          s.filter = "On shelf";
          focus = "[data-filter]";
        } else if (v === "outstanding" || v === "overdue") {
          showOpenLoans("", v === "overdue");
          focus = "[data-loan-count]";
        } else return;
        break;
      case "close":
        focus = `[data-action="request"][data-val="${s.selected}"]`;
        s.selected = "";
        preparingPickup = false;
        break;
      case "request":
        if (!getReq(v)) return;
        s.selected = v;
        preparingPickup = false;
        focus = "[data-request-heading]";
        break;
      case "prepare-pickup": {
        const request = getReq(v);
        if (!request || !pickupLines(request).some((line) => line.available.length)) return;
        s.selected = request.id;
        preparingPickup = true;
        focus = "[data-pickup-heading]";
        break;
      }
      case "cancel-pickup":
        preparingPickup = false;
        focus = "[data-request-heading]";
        break;
      case "request-loans":
        if (!getReq(v)) return;
        showOpenLoans(v);
        focus = "[data-loan-count]";
        break;
      case "new":
        s.editing = true;
        break;
      case "cancel":
        s.editing = false;
        break;
      case "scope":
        s.onlyOpen = v !== "1";
        s.overdueOnly = v === "2";
        focus = `[data-action="scope"][data-val="${v}"]`;
        break;
      case "write-handover": {
        const loan = getLoan(Number(v));
        if (!loan || loan.back) return;
        selectedLoanNum = loan.num;
        s.tab = "Desk book";
        s.editing = false;
        focus = "[data-note] textarea";
        break;
      }
      case "cancel-handover":
        s.tab = "Loan register";
        focus = `[data-action="write-handover"][data-val="${selectedLoanNum}"]`;
        selectedLoanNum = null;
        break;
      case "view-slip": {
        const loan = getLoan(Number(v));
        if (!loan) return;
        selectedLoanNum = loan.num;
        s.tab = "Loan register";
        s.editing = false;
        focus = "[data-slip-heading]";
        break;
      }
      case "back-to-desk-book":
        s.tab = "Desk book";
        focus = `[data-action="view-slip"][data-val="${selectedLoanNum}"]`;
        selectedLoanNum = null;
        break;
      case "return": {
        const l = getLoan(Number(v));
        if (!l || l.back) return;
        l.back = true;
        s.notice = l.asset + " returned to stock. Slip L-" + l.num + " closed.";
        if (s.tab === "Loan register" && selectedLoanNum === l.num)
          focus = "[data-slip-heading]";
        else if (s.tab === "Loan register") focus = "[data-loan-count]";
        break;
      }
    }
    commit(undefined, focus);
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });
  root.addEventListener("input", (e) => {
    if (!e.target.matches("[data-loan-query]")) return;
    loanQuery = e.target.value;
    paintLoanResults();
  });
  function addLoans(requestId, assetIds, who, due) {
    const firstNum = Math.max(...s.loans.map((loan) => loan.num)) + 1;
    const loans = assetIds.map((asset, index) => ({
      num: firstNum + index, req: requestId, asset, who, due, back: false,
    }));
    s.loans.push(...loans);
    return loans;
  }
  function savePickup(form) {
    const request = getReq(s.selected);
    if (!preparingPickup || !request) return;

    const who = form.get("who");
    const due = form.get("due");
    const picks = request.items
      .map((type, index) => ({ type, assetId: form.get(`asset-${index}`) }))
      .filter((pick) => pick.assetId);
    let error;
    if (!people.includes(who) || !dueTimes.includes(due)) {
      error = "Choose a collector and a return time.";
    } else if (!picks.length) {
      error = "Choose at least one unit to issue.";
    } else if (!picks.every(({ type, assetId }) => {
      const asset = getAsset(assetId);
      return asset && asset.type === type && isAvailable(asset) && !openTypeLoan(request.id, type);
    })) {
      error = "One of the selected units is unavailable or outside the approval. Check the kit and try again.";
    }
    if (error) {
      q("[data-pickup-error]").textContent = error;
      return;
    }

    const loans = addLoans(request.id, picks.map((pick) => pick.assetId), who, due);
    preparingPickup = false;
    const issued = loans.map(slipId).join(", ");
    commit(`Issued to ${who} on ${issued}.`, "[data-request-heading]");
  }
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-pickup]")) {
      savePickup(form);
      return;
    }
    if (f.matches("[data-note]")) {
      const text = String(form.get("note") ?? "").trim();
      if (!text) {
        q("[data-status]").textContent = "Enter a note for the next shift.";
        return;
      }
      const loan = getLoan(selectedLoanNum);
      if (selectedLoanNum !== null && (!loan || loan.back)) {
        q("[data-status]").textContent =
          "This slip is no longer outstanding. Cancel and choose an outstanding slip.";
        return;
      }
      const note = { phase: s.phase, text };
      if (loan) note.loanNum = loan.num;
      s.notes.push(note);
      selectedLoanNum = null;
      commit(
        loan ? `Handover saved for ${slipId(loan)}.` : "Handover note saved.",
        loan ? "[data-linked-note-heading]" : undefined,
      );
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || !isAvailable(unit) || !people.includes(who) || !dueTimes.includes(due))
      return;
    if (!r.items.includes(unit.type)) {
      q("[data-status]").textContent =
        "This equipment type is outside the approved request. Choose an approved unit.";
      return;
    }
    if (openTypeLoan(req, unit.type)) {
      q("[data-status]").textContent =
        "The approved quantity of this equipment type is already on loan.";
      return;
    }
    const [loan] = addLoans(req, [asset], who, due);
    s.editing = false;
    commit(`Issued ${asset} to ${who} on slip ${slipId(loan)}.`);
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 1 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l && getReq(l.req) && getAsset(l.asset) && Number.isInteger(l.num),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      overdueOnly: d.overdueOnly === true,
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map(({ phase, text, loanNum }) => {
        const note = { phase, text };
        if (getLoan(loanNum, d.loans)) note.loanNum = loanNum;
        return note;
      }),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
