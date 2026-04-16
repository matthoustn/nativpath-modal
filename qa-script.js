// ========== INJECT STYLES ==========
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=cancel,check_circle,collapse_content,handyman";
document.head.appendChild(link);

const style = document.createElement("style");
style.textContent = `
  .modal-minimize { position:absolute; top:5%; right:5%; width:20px; font-size:35px; cursor:pointer; color:#004175; }
  .modal-minimize:hover { color:#009bff; }
  .modal-background { width:100%; height:100vh; background-color:#1f29377e; position:absolute; top:0; left:0; }
  .modal-body {
    position:absolute; width:80%; max-height:80vh; top:50%; left:50%; transform:translate(-50%,-50%);
    background-color:#eef8ff; border-radius:30px; padding:30px; max-width:800px;
    display:flex; flex-direction:column; justify-content:flex-start; align-items:center;
    font-family:system-ui, sans-serif;
  }
  .np-image { width:150px; }
  .divider {
    height:3px; border:none; border-radius:6px; width:100%;
    background:linear-gradient(90deg, rgba(13,8,96,1) 0%, rgba(9,9,121,1) 21%, rgba(6,84,170,1) 51%, rgba(0,255,113,1) 100%);
  }
  .modal-container { overflow:auto; width:100%; }
  #modal-icon {
    background-color:#004175; font-size:28px; border-radius:100%; width:70px; aspect-ratio:1/1;
    color:white; position:fixed; bottom:20px; right:20px; cursor:pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15); display:flex; justify-content:center; align-items:center;
  }
  #modal-icon:hover { background-color:#009bff; }
  #modal { display:none; z-index: 9000; }
  .check  { color:#00a200; font-size:1rem; }
  .cancel { color:#db0100; font-size:1rem; }
  .qa-product-script {
    background-color:#dcf0ff; padding:10px; border-radius:10px;
    display:flex; flex-direction:column; margin-bottom:10px;
  }
  .navbar {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
    align-content: center;
    margin: 10px;
    width: 100%;
  }
  button {
    background-color: #004175;
    color: white;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }
  button:hover { background-color: #009bff; }
  .row {
    width: 100%;
    display: flex;
    gap: 1;
  }
  .row:hover {
    background-color: #004175;
    color: white;
    cursor: pointer;
  }
  .column {
    flex-basis: 50%;
    flex-grow: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;
document.head.appendChild(style);

// ========== INJECT MODAL HTML ==========
const wrapper = document.createElement("div");
wrapper.innerHTML = `
  <div id="modal-icon" onclick="toggleModal()">
    <span class="material-symbols-outlined">handyman</span>
  </div>
  <div id="modal" class="modal-background">
    <section class="modal-body">
      <div id="toast" style="visibility:hidden; position:fixed; bottom:80px; left:50%; transform:translate(-50%,-50%); background:#004175; color:white; padding:8px 16px; border-radius:8px; font-size:14px; z-index:9999;">Copied!</div>
      <span class="material-symbols-outlined modal-minimize" onclick="toggleModal()">collapse_content</span>
      <img src="https://cdn.shopify.com/s/files/1/0014/0158/5725/files/NativePath_Logo.webp?v=1762959581" alt="NativePath Logo" class="np-image">
      <h3>QA Toolkit</h3>
      <div class="navbar"><button onclick="runQA()">Scripts</button><button onclick="displayTokens()">Tokens</button><button onclick="displayNpData()">np_data</button></div>
      <hr class="divider">
      <div class="modal-container"></div>
    </section>
  </div>
`;
document.body.appendChild(wrapper);

let tokenFilter = "";

// ========== HELPERS ==========
const icon = (pass) => `<span class="material-symbols-outlined ${pass ? "check" : "cancel"}">${pass ? "check_circle" : "cancel"}</span>`;
const field = (label, value) => {
  const ok = value != null && value !== "" && value !== "—";
  return `<div>${icon(ok)} <strong>${label}:</strong> ${ok ? value : "—"}</div>`;
};
const row = (columns) => `<div class="row">${columns.join("")}</div>`;
const column = (value) => `<div class="column">${value}</div>`;
const block = (rows) => `<div class="qa-product-script">${rows.join("")}</div>`;

// ========== TOGGLE ==========
window.toggleModal = function () {
  const modal = document.getElementById("modal");
  const modalIcon = document.getElementById("modal-icon");
  const isOpening = modal.style.display !== "block";

  document.body.style.overflow = isOpening ? "hidden" : "auto";
  modal.style.display = isOpening ? "block" : "none";
  modalIcon.style.display = isOpening ? "none" : "flex";

  if (isOpening) runQA();
};

// ========== QA ==========
async function runQA() {
  const container = document.querySelector(".modal-container");
  container.innerHTML = `<p>Running checks...</p>`;

  await new Promise(r => setTimeout(r, 500));

  // ── Raw material ─────────────────────────────────────────────────────────
  const scripts = [...document.scripts];
  const inline = scripts.filter(s => !s.src).map(s => s.textContent || "").join(" ");
  const imgs = [...document.images];

  // ── Panel helper ─────────────────────────────────────────────────────────
  // Blue header = all required checks pass. Red = one or more missing.
  function panel(title, rows, allPass) {
    const color = allPass ? "#004175" : "#8b0000";
    const status = allPass ? "check_circle" : "cancel";
    return `
            <div style="border:1.5px solid ${color};border-radius:12px;margin-bottom:16px;overflow:hidden;">
                <div style="background:${color};padding:8px 14px;display:flex;align-items:center;gap:8px;">
                    <span class="material-symbols-outlined" style="font-size:18px;color:white;">${status}</span>
                    <span style="color:white;font-weight:600;font-size:13px;letter-spacing:0.03em;">${title}</span>
                </div>
                <div style="padding:12px 14px;">${rows.join("")}</div>
            </div>`;
  }

  const divider = `<hr style="border:none;border-top:1px solid #cce4f7;margin:10px 0;">`;
  const subheading = (label) => `<div style="font-weight:600;font-size:12px;color:#004175;margin:8px 0 4px;text-transform:uppercase;letter-spacing:0.05em;">${label}</div>`;
  const sublabel = (label) => `<div style="font-size:11px;font-weight:600;color:#555;margin-bottom:4px;">${label}</div>`;

  // =========================================================================
  // LEGACY SYSTEM
  // Detects raw pasted inline code — old manual footer standard
  // All checks via inline script scanning
  // =========================================================================

  // Klaviyo SDK
  const leg_hasKlaviyoSDK = scripts.some(s => s.src?.includes("klaviyo.com") && s.src.includes("TPg5j8"));

  // Klaviyo events — klaviyo.push(["track" must be present alongside event name
  const leg_hasViewedSales = inline.includes('klaviyo.push(["track"') && inline.includes('"Viewed Sales Page"');
  const leg_hasViewedCO = inline.includes('klaviyo.push(["track"') && inline.includes('"Viewed Checkout Page"');

  // Klaviyo manual product fields — const declarations in pasted footer
  const leg_prid = inline.match(/const\s+prid\s*=\s*["']([^"']+)["']/)?.[1] || null;
  const leg_cat = inline.match(/const\s+product_category\s*=\s*["']([^"']+)["']/)?.[1] || null;
  const leg_subcat = inline.match(/const\s+product_category_sub\s*=\s*["']([^"']+)["']/)?.[1] || null;
  const leg_notes = inline.match(/const\s+event_notes\s*=\s*["']([^"']*)['"]/)?.[1] ?? null;
  const leg_msgcopy = inline.match(/const\s+msg_copy\s*=\s*["']([^"']*)['"]/)?.[1] ?? null;

  // Attentive SDK
  const leg_hasAttentiveSDK = scripts.some(s => s.src?.includes("cdn.attn.tv/nativepath/dtag.js"));

  // Attentive productView() call
  const leg_hasProductView = inline.includes("attentive.analytics.productView(");

  // Attentive manual product fields from pasted inline call
  const leg_attBlock = inline.match(/attentive\.analytics\.productView\(\s*\{[\s\S]*?\}\s*\)/i)?.[0] || "";
  const leg_attName = leg_attBlock.match(/name:\s*['"]([^'"]{2,})['"]/i)?.[1] || null;
  const leg_attCat = leg_attBlock.match(/category:\s*['"]([^'"]+)['"]/i)?.[1] || null;
  const leg_attPrice = leg_attBlock.match(/value:\s*['"]?([\d.]+)['"]?/i)?.[1] || null;
  const leg_attCurr = leg_attBlock.match(/currency:\s*['"]([A-Z]{3})['"]/i)?.[1] || null;
  const leg_attProdId = leg_attBlock.match(/productId:\s*['"]([^'"]+)['"]/i)?.[1] || null;
  const leg_attVarId = leg_attBlock.match(/productVariantId:\s*['"]([^'"]+)['"]/i)?.[1] || null;

  // Legacy pass = SDK + both events fired
  const leg_allPass = leg_hasKlaviyoSDK && leg_hasViewedSales && leg_hasViewedCO;

  const legacyRows = [
    subheading("Klaviyo"),
    field("SDK", leg_hasKlaviyoSDK ? "Loaded" : null),
    field("Viewed Sales Page", leg_hasViewedSales ? "Found" : null),
    field("Viewed Checkout Page", leg_hasViewedCO ? "Found" : null),
    divider,
    field("Product (prid)", leg_prid),
    field("Category", leg_cat),
    field("Sub-Category", leg_subcat),
    field("Event Notes", leg_notes !== null ? (leg_notes || "—") : null),
    field("Message Copy", leg_msgcopy !== null ? (leg_msgcopy || "—") : null),
    divider,
    subheading("Attentive"),
    field("SDK", leg_hasAttentiveSDK ? "Loaded" : null),
    field("productView()", leg_hasProductView ? "Found" : null),
    divider,
    field("Product", leg_attName),
    field("Product ID", leg_attProdId),
    field("Variant ID", leg_attVarId),
    field("Category", leg_attCat),
    field("Price", leg_attPrice && leg_attCurr ? `$${leg_attPrice} ${leg_attCurr}` : leg_attPrice),
  ];

  // =========================================================================
  // NEW SYSTEM
  // Detects function-based footer via window flags set by loadKlaviyoPayload()
  // No inline string scanning — flags are only set when the function is called
  // =========================================================================

  // Klaviyo SDK — same tag
  const new_hasKlaviyoSDK = leg_hasKlaviyoSDK;

  // loadKlaviyoPayload() sets window.__klaviyoPayloadCalled = true when called
  // and stores the payload in window.__klaviyoPayload
  const new_hasKlaviyoCall = !!window.__klaviyoPayloadCalled;
  const kp = window.__klaviyoPayload || {};

  const new_ProductTitle = kp.ProductTitle || null;
  const new_ProductCat = kp.ProductCategory || null;
  const new_ProductSubCat = kp.ProductCategorySub || null;
  const new_ProductImage = kp.ProductImage || null;
  const new_ProductDiscount = kp.ProductDiscount || null;
  const new_EventNotes = kp.EventNotes ?? null;
  const new_MessageCopy = kp.MessageCopy ?? null;

  // np_data — still in flux, display whatever product fields exist
  const hasNpData = !!window.np_data;
  let np_products = [];
  let np_page_data = {};
  try {
    np_page_data = window.np_data?.promos?.[window.__page_id] || {};
    np_products = (np_page_data.promoSku || [])
      .map(sku => window.np_data?.products?.[sku])
      .filter(Boolean);
  } catch (e) { console.log(e); }

  const npProductRows = np_products.length > 0
    ? Object.entries(np_products[0]).map(([key, val]) => {
      if (key.toLowerCase().includes("image") && typeof val === "string" && val.startsWith("http")) {
        return field(key, `<img src="${val}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;vertical-align:middle;">`);
      }
      return field(key, val != null ? String(val) : null);
    })
    : [field("Products", null)];

  // Attentive
  const new_hasAttentiveSDK = leg_hasAttentiveSDK;
  const new_hasAttentiveCall = !!window.__attentivePayloadCalled;

  // New pass = SDK + klaviyo function was called
  const new_allPass = new_hasKlaviyoSDK && new_hasKlaviyoCall;

  const newRows = [
    subheading("Klaviyo"),
    field("SDK", new_hasKlaviyoSDK ? "Loaded" : null),
    field("loadKlaviyoPayload()", new_hasKlaviyoCall ? "Called" : null),
    divider,
    sublabel("Manual Payload"),
    field("ProductTitle", new_ProductTitle),
    field("ProductCategory", new_ProductCat),
    field("ProductCategorySub", new_ProductSubCat),
    field("ProductImage", new_ProductImage),
    field("ProductDiscount", new_ProductDiscount),
    field("EventNotes", new_EventNotes !== null ? (new_EventNotes || "—") : null),
    field("MessageCopy", new_MessageCopy !== null ? (new_MessageCopy || "—") : null),
    divider,
    sublabel(`np_data — ${hasNpData ? "Loaded" : "Not found"}`),
    ...npProductRows,
    divider,
    subheading("Attentive"),
    field("SDK", new_hasAttentiveSDK ? "Loaded" : null),
    field("loadAttentivePayload()", new_hasAttentiveCall ? "Called" : null),
    `<div style="font-size:11px;color:#888;margin-top:6px;">Attentive payload fields coming soon</div>`,
  ];

  // =========================================================================
  // OTHER SCRIPTS
  // =========================================================================
  const others = {
    MediaGo: scripts.some(s => /mediago\.io/i.test(s.src)) || typeof window._megoaa !== "undefined",
    Reddit: scripts.some(s => /redditstatic\.com\/ads\/pixel\.js|events\.redditmedia\.com/i.test(s.src)) || typeof window.rdt !== "undefined",
    LiveIntent: scripts.some(s => /liadm\.com/i.test(s.src)) || imgs.some(i => /px\.liadm\.com/i.test(i.src)) || typeof window.liQ !== "undefined",
    Taboola: scripts.some(s => /cdn\.taboola\.com\/libtrc/i.test(s.src)) || typeof window._tfa !== "undefined",
    iHeart: scripts.some(s => /arttrk\.com/i.test(s.src)) || imgs.some(i => /arttrk\.com\/pixel/i.test(i.src)),
    Outbrain: scripts.some(s => /amplify\.outbrain\.com\/cp\/obtp\.js/i.test(s.src)) || typeof window.obApi !== "undefined",
  };

  const othersRows = Object.entries(others).map(([name, found]) => field(name, found ? "Found" : null));
  const othersAnyPass = Object.values(others).some(Boolean);

  // =========================================================================
  // RENDER
  // =========================================================================
  container.innerHTML =
    panel("LEGACY SYSTEM", legacyRows, leg_allPass) +
    panel("NEW SYSTEM", newRows, new_allPass) +
    panel("OTHER SCRIPTS", othersRows, othersAnyPass);
}

// ========== TOKENS ==========
window.displayTokens = async function () {
  try {
    const container = document.querySelector(".modal-container");
    if (!window.tokenList) return;

    const tokenPanel = (entries) => `
            <div style="border:1.5px solid #004175;border-radius:12px;margin-bottom:16px;overflow:hidden;">
                <div style="background:#004175;padding:8px 14px;display:flex;align-items:center;gap:8px;">
                    <span class="material-symbols-outlined" style="font-size:18px;color:white;">check_circle</span>
                    <span style="color:white;font-weight:600;font-size:13px;letter-spacing:0.03em;">TOKENS</span>
                </div>
                <div style="padding:12px 14px;">
                    <input id="token-search" type="text" placeholder="Search tokens..." value="${tokenFilter}"
                        style="width:100%;padding:8px;margin-bottom:10px;border-radius:8px;border:1px solid #004175;box-sizing:border-box;font-size:14px;">
                    <div id="token-results">${entries}</div>
                </div>
            </div>`;

    const renderRows = (filter = "") => {
      const entries = Object.entries(tokenList).filter(([key, value]) =>
        key.toLowerCase().includes(filter.toLowerCase()) ||
        String(value).toLowerCase().includes(filter.toLowerCase())
      );
      return entries.map(([key, value]) => {
        if (!value) return "";
        return `<div class="row" style="padding:4px 0;border-bottom:1px solid #cce4f7;">
                    <div class="column" style="font-weight:600;font-size:13px;">${key}</div>
                    <div class="column" style="font-size:13px;color:#333;">${value}</div>
                </div>`;
      }).join("");
    };

    container.innerHTML = tokenPanel(renderRows(tokenFilter));

    document.getElementById("token-search").addEventListener("input", (e) => {
      tokenFilter = e.target.value;
      document.getElementById("token-results").innerHTML = renderRows(tokenFilter);
    });

    document.getElementById("token-results").addEventListener("click", (e) => {
      const el = e.target.closest(".row");
      if (!el) return;
      const key = el.querySelector(".column")?.innerText;
      if (!key) return;
      navigator.clipboard.writeText(key)
        .then(() => {
          el.style.color = "#00a200";
          setTimeout(() => el.style.color = "", 1500);
          const toast = document.getElementById("toast");
          toast.style.visibility = "visible";
          setTimeout(() => toast.style.visibility = "hidden", 1500);
        })
        .catch((e) => console.log("Clipboard error:", e));
    });

  } catch (e) { console.log(e, "Error fetching tokenList"); }
};

// ========== NP_DATA ==========
async function displayNpData() {
  const container = document.querySelector(".modal-container");
  if (!window.np_data) {
    container.innerHTML = `
            <div style="border:1.5px solid #8b0000;border-radius:12px;overflow:hidden;">
                <div style="background:#8b0000;padding:8px 14px;display:flex;align-items:center;gap:8px;">
                    <span class="material-symbols-outlined" style="font-size:18px;color:white;">cancel</span>
                    <span style="color:white;font-weight:600;font-size:13px;letter-spacing:0.03em;">NP_DATA</span>
                </div>
                <div style="padding:12px 14px;font-size:13px;">np_data not found</div>
            </div>`;
    return;
  }

  const npPanel = (title, rows) => `
        <div style="border:1.5px solid #004175;border-radius:12px;margin-bottom:16px;overflow:hidden;">
            <div style="background:#004175;padding:8px 14px;display:flex;align-items:center;gap:8px;">
                <span class="material-symbols-outlined" style="font-size:18px;color:white;">check_circle</span>
                <span style="color:white;font-weight:600;font-size:13px;letter-spacing:0.03em;">${title}</span>
            </div>
            <div style="padding:12px 14px;">${rows}</div>
        </div>`;

  const renderData = (data) => Object.entries(data).map(([key, value]) => `
        <div style="display:flex;padding:4px 0;border-bottom:1px solid #cce4f7;gap:8px;">
            <div style="flex-basis:40%;font-weight:600;font-size:13px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${key}</div>
            <div style="flex-basis:60%;font-size:13px;color:#333;">
                ${typeof value === "object" && value !== null
      ? `<pre style="margin:0;font-size:11px;white-space:pre-wrap;">${JSON.stringify(value, null, 2)}</pre>`
      : value}
            </div>
        </div>`).join("");

  container.innerHTML =
    npPanel("GLOBAL", renderData(np_data.global)) +
    npPanel("PRODUCTS", renderData(np_data.products)) +
    npPanel("PROMOS", renderData(np_data.promos));
}