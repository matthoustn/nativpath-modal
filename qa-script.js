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
  .navbar{
    display: flex;
    justify-content: flex-start;
    gap: 10px;
    align-content: center;
    margin: 10px;
    width: 100%;
  }
  button{
    background-color: #004175;
    color: white;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }
  button:hover {
    background-color: #009bff;
  }
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
      <div id="toast" style="visibility:hidden; position:fixed; bottom:80px; left:50%; transform: translate(-50%,-50%); background:#004175; color:white; padding:8px 16px; border-radius:8px; font-size:14px; z-index:9999;">Copied!</div>      <span class="material-symbols-outlined modal-minimize" onclick="toggleModal()">collapse_content</span>
      <img src="https://cdn.shopify.com/s/files/1/0014/0158/5725/files/NativePath_Logo.webp?v=1762959581" alt="NativePath Logo" class="np-image">
      <h3>QA Toolkit</h3>
      <div class="navbar" ><button onclick="runQA()">Scripts</button><button onclick="displayTokens()">Tokens</button><button onclick="displayNpData()">np_data</button></div>
      <hr class="divider">
      <div class="modal-container"></div>
    </section>
  </div>
`;
document.body.appendChild(wrapper);

let tokenFilter = "";

  // Helpers
  const icon = (pass) => `<span class="material-symbols-outlined ${pass ? "check" : "cancel"}">${pass ? "check_circle" : "cancel"}</span>`;
  const field = (label, value) => {
    const ok = value != null && value !== "" && value !== "—";
    return `<div>${icon(ok)} <strong>${label}:</strong> ${ok ? value : "—"}</div>`;
};
  const row = (columns) => {
      return `<div class="row">${columns.join("")}</div>`
  }
  const column = (value) => {
  return `<div class="column">${value}</div>`
}
  
  const block = (rows) => `<div class="qa-product-script">${rows.join("")}</div>`;

// ========== TOGGLE + RUN QA ON OPEN ==========
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
    window.__page_id = "12345678" //Delete before upload
    let page_data = {};
    try { page_data = window.np_data?.promos[__page_id] || {}; console.log("Page ID:", window.__page_id, "NP Data:", window.np_data,"Page Data:", page_data) } catch (e) { console.log(e, "Error fetching page id") }

    await new Promise(r => setTimeout(r, 500));

    const scripts = [...document.scripts];
    const inline = scripts.filter(s => !s.src).map(s => s.textContent || "").join(" ");

    let product = {};
  try { product = window.np_data?.products[page_data.promoSku] || {}; console.log("Products:", product, "Page Data:", page_data)} catch (e) { console.log(e)}

    // Checks
    const hasKlaviyoSDK = scripts.some(s => s.src?.includes("klaviyo.com") && s.src.includes("TPg5j8"));
    const hasViewedSales = inline.includes("Viewed Sales Page");
    const hasViewedCheckout = inline.includes("Viewed Checkout Page");
    const hasKlaviyoPayloadFn = inline.includes("loadKlaviyoPayload");
    // const hasAttentiveSDK = scripts.some(s => s.src?.includes("cdn.attn.tv/nativepath/dtag.js"));
    // const hasAttentivePayload = inline.includes("loadAttentivePayload");
    // const hasAttentiveCall = inline.includes("attentive.analytics.productView");

    const imgs = [...document.images];
    const others = {
        MediaGo: scripts.some(s => /mediago\.io/i.test(s.src)) || typeof window._megoaa !== "undefined",
        Reddit: scripts.some(s => /redditstatic\.com\/ads\/pixel\.js|events\.redditmedia\.com/i.test(s.src)) || typeof window.rdt !== "undefined",
        LiveIntent: scripts.some(s => /liadm\.com/i.test(s.src)) || imgs.some(i => /px\.liadm\.com/i.test(i.src)) || typeof window.liQ !== "undefined",
        Taboola: scripts.some(s => /cdn\.taboola\.com\/libtrc/i.test(s.src)) || typeof window._tfa !== "undefined",
        iHeart: scripts.some(s => /arttrk\.com/i.test(s.src)) || imgs.some(i => /arttrk\.com\/pixel/i.test(i.src)),
        Outbrain: scripts.some(s => /amplify\.outbrain\.com\/cp\/obtp\.js/i.test(s.src)) || typeof window.obApi !== "undefined",
    };

    // Klaviyo
    const klaviyoHTML = `
    <strong>KLAVIYO ABANDON SDK</strong><br><br>
    ${block([
        field("SDK", hasKlaviyoSDK ? "Found" : null),
        field("loadKlaviyoPayload()", hasKlaviyoPayloadFn ? "Found" : null),
        field("Viewed Sales Page", hasViewedSales ? "Found" : null),
        field("Viewed Checkout Page", hasViewedCheckout ? "Found" : null),
    ])}
    ${product ? block([
        field("Product", product.productName), //Comes from Product
        field("Category", product.productCategory), //Comes from Product
        field("Sub-Category", product.productCategorySub), //Comes from Product
        field("Image", product.productImage ? `<img src="${product.productImage}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;vertical-align:middle;">` : null), //Comes from Product
        field("Retail Price", product.retailPrice ? `${product.retailPrice} ${np_data.global.currency}` : null), //Comes from Product
    ]) : block([`<div>${icon(false)} np_data.product not found</div>`])}
  `;

  //   // Attentive
  //   const attentiveHTML = `
  //   <strong>ATTENTIVE SDK</strong><br><br>
  //   ${block([
  //       field("SDK", hasAttentiveSDK ? "Found" : null),
  //       field("loadAttentivePayload()", hasAttentivePayload ? "Found" : null),
  //       field("productView() Call", hasAttentiveCall ? "Found" : null),
  //   ])}
  //   ${Object.keys(products).length
  //     ? Object.values(products).map(p => block([
  //               field("Product", p.productName),
  //               field("Product ID", p.productId),
  //               field("Variant ID", p.productVariantId),
  //               field("Category", p.productCategory),
  //               field("Price", p.retailPrice ? `${p.retailPrice.value} ${p.retailPrice.currency}` : null),
  //           ])).join("")
  //           : block([`<div>${icon(false)} np_data.global.products not found</div>`])
  //       }
  // `;
    // Other scripts
    const othersHTML = `
    <strong>OTHER SCRIPTS (EXT)</strong><br><br>
    ${block(Object.entries(others).map(([name, found]) => field(name, found ? "Found" : null)))}
  `;

  container.innerHTML = klaviyoHTML + othersHTML;//+ attentiveHTML + othersHTML;
}

window.displayTokens = async function () {
  try {
    const container = document.querySelector(".modal-container");
    if (!window.tokenList) return;

    const render = (filter = "") => {
      const entries = Object.entries(tokenList).filter(([key, value]) =>
        key.toLowerCase().includes(filter.toLowerCase()) ||
        String(value).toLowerCase().includes(filter.toLowerCase())
      );
      return block(
        entries.map(([key, value]) => value ? row([
          column(key),
          column(value)
        ]) : null).filter(Boolean)
      );
    };

    container.innerHTML = `
            <input id="token-search" type="text" placeholder="Search tokens..." value="${tokenFilter}" style="width:100%; padding:8px; margin-bottom:10px; border-radius:8px; border:1px solid #004175; box-sizing:border-box; font-size:14px;">
            <div id="token-results"></div>
        `;

    document.getElementById("token-results").innerHTML = render(tokenFilter);

    document.getElementById("token-search").addEventListener("input", (e) => {
      tokenFilter = e.target.value;
      document.getElementById("token-results").innerHTML = render(tokenFilter);
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
}

async function displayNpData() {
  const container = document.querySelector(".modal-container");
  if (!window.np_data) {
    container.innerHTML = `<p>np_data not found</p>`;
    return;
  }

  const renderSection = (label, data) => `
        <strong>${label}</strong><br><br>
        ${block(
    Object.entries(data).map(([key, value]) =>
      row([column(`<strong>${key}</strong>`), column(
        typeof value === "object" && value !== null
          ? `<pre style="margin:0; font-size:11px; white-space:pre-wrap;">${JSON.stringify(value, null, 2)}</pre>`
          : value
      )])
    )
  )}
    `;

  container.innerHTML = `
        ${renderSection("GLOBAL", np_data.global)}
        ${renderSection("PRODUCTS", np_data.products)}
        ${renderSection("PROMOS", np_data.promos)}
    `;
}