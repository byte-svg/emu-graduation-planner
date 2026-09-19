(function () {
  "use strict";

  const HOST_ID = "emu-graduation-planner-root";
  let latestState = null;
  let observedTable = null;
  let refreshTimer = null;

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function codeLabel(item) {
    return item.codes.join(" / ");
  }

  function courseList(items, emptyText, blocked = false) {
    if (!items.length) return `<p class="empty">${escapeHtml(emptyText)}</p>`;
    return `<ul>${items.slice(0, 7).map((item) => {
      const reason = blocked
        ? `<small>Ön koşul: ${escapeHtml(item.unmetPrerequisites.join(", ").replaceAll("|", " veya "))}</small>`
        : `<small>${item.semester}. dönem · ${item.ects} AKTS</small>`;
      return `<li><span><b>${escapeHtml(codeLabel(item))}</b>${escapeHtml(item.name)}</span>${reason}</li>`;
    }).join("")}</ul>`;
  }

  function styles() {
    return `
      :host { all: initial; color: #172033; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; }
      .shell { margin: 0 0 24px; border: 1px solid #dbe4f0; border-radius: 18px; background: #f7faff; box-shadow: 0 16px 42px rgba(31, 63, 104, .12); overflow: hidden; }
      .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 22px 24px 18px; background: linear-gradient(125deg, #123b6d, #245f9e); color: white; }
      .eyebrow { margin: 0 0 5px; color: #bfe1ff; font-size: 12px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
      h2 { margin: 0; color: white; font-size: 24px; line-height: 1.2; }
      .subtitle { margin: 7px 0 0; color: #d9edff; font-size: 13px; }
      .actions { display: flex; gap: 8px; }
      button { border: 1px solid rgba(255,255,255,.38); border-radius: 10px; background: rgba(255,255,255,.12); color: white; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; padding: 9px 12px; }
      button:hover { background: rgba(255,255,255,.22); }
      .body { padding: 20px 24px 22px; }
      .progress-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; font-size: 13px; color: #53657b; }
      .progress-head strong { color: #123b6d; font-size: 20px; }
      .progress { height: 11px; border-radius: 999px; background: #dfe8f3; overflow: hidden; }
      .progress > span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #2f82c9, #45b88a); }
      .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
      .metric { padding: 14px; border: 1px solid #dfe7f1; border-radius: 13px; background: white; }
      .metric span { display: block; color: #718096; font-size: 12px; margin-bottom: 5px; }
      .metric strong { color: #172033; font-size: 20px; }
      .metric small { color: #7a889a; font-size: 11px; }
      .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; }
      .card { padding: 16px; border: 1px solid #dfe7f1; border-radius: 13px; background: white; }
      h3 { margin: 0 0 11px; color: #26364b; font-size: 15px; }
      ul { display: grid; gap: 8px; list-style: none; margin: 0; padding: 0; }
      li { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding-bottom: 8px; border-bottom: 1px solid #edf1f6; font-size: 12px; }
      li:last-child { border-bottom: 0; padding-bottom: 0; }
      li span { display: grid; gap: 2px; }
      li b { color: #1f5e9e; font-size: 12px; }
      li small { max-width: 44%; color: #7a5c12; text-align: right; }
      .empty { margin: 0; color: #6f7d8d; font-size: 13px; }
      .warning { margin: 14px 0 0; padding: 11px 13px; border: 1px solid #f0d392; border-radius: 10px; background: #fff8e7; color: #71500c; font-size: 12px; line-height: 1.5; }
      .note { margin: 14px 0 0; color: #6f7d8d; font-size: 11px; line-height: 1.5; }
      .hidden .body { display: none; }
      @media (max-width: 900px) { .metrics { grid-template-columns: 1fr 1fr; } .columns { grid-template-columns: 1fr; } }
      @media (max-width: 560px) { .top { padding: 18px; } .body { padding: 16px 18px 18px; } .metrics { grid-template-columns: 1fr; } h2 { font-size: 20px; } }
    `;
  }

  function render(table) {
    const records = EmuPlanner.parseRecordTable(table);
    const tableMeta = EmuPlanner.parseTableMeta(table);
    const analysis = EmuPlanner.analyze(records, EMU_CURRICULUM_CURRENT);
    latestState = {
      found: true,
      records: records.length,
      completedEcts: analysis.completedEcts,
      totalEcts: analysis.totalEcts,
      percentage: analysis.percentage,
      passed: analysis.passed.length,
      active: analysis.active.length,
      failed: analysis.failed.length,
      latestPeriod: tableMeta.latestPeriod,
      mismatches: analysis.mismatches.length
    };

    let host = document.getElementById(HOST_ID);
    if (!host) {
      host = document.createElement("section");
      host.id = HOST_ID;
      table.parentElement.insertBefore(host, table);
      host.attachShadow({ mode: "open" });
    }

    host.shadowRoot.innerHTML = `
      <style>${styles()}</style>
      <div class="shell">
        <header class="top">
          <div>
            <p class="eyebrow">Güncel DAÜ müfredatı · cihaz üzerinde hesaplanır</p>
            <h2>DAÜ Mezuniyet Planlayıcı</h2>
            <p class="subtitle">${escapeHtml(tableMeta.latestPeriod || "Güncel dönem")} dahil ${tableMeta.periodCount} dönem sütunu ve ${records.length} ders satırı analiz edildi.</p>
          </div>
          <div class="actions"><button id="refresh" type="button">Yenile</button><button id="toggle" type="button">Daralt</button></div>
        </header>
        <div class="body">
          <div class="progress-head"><span>Mezuniyet ilerlemesi</span><strong>%${analysis.percentage}</strong></div>
          <div class="progress" role="progressbar" aria-valuenow="${analysis.percentage}" aria-valuemin="0" aria-valuemax="100"><span style="width:${analysis.percentage}%"></span></div>
          <div class="metrics">
            <div class="metric"><span>Tamamlanan AKTS</span><strong>${analysis.completedEcts}</strong> <small>/ ${analysis.totalEcts}</small></div>
            <div class="metric"><span>Zorunlu ders</span><strong>${analysis.required.completed}</strong> <small>/ ${analysis.required.total}</small></div>
            <div class="metric"><span>Alan seçmelisi</span><strong>${analysis.areaElectives.completed}</strong> <small>/ ${analysis.areaElectives.total}</small></div>
            <div class="metric"><span>Üniversite seçmelisi</span><strong>${analysis.universityElectives.completed}</strong> <small>/ ${analysis.universityElectives.total}</small></div>
          </div>
          <div class="columns">
            <section class="card"><h3>Alınabilir dersler (${analysis.eligible.length})</h3>${courseList(analysis.eligible, "Şu anda önerilecek yeni ders bulunamadı.")}</section>
            <section class="card"><h3>Ön koşulu eksik (${analysis.blocked.length})</h3>${courseList(analysis.blocked, "Ön koşulu eksik ders bulunmuyor.", true)}</section>
            <section class="card"><h3>Devam eden (${analysis.active.length})</h3>${courseList(analysis.active, "Devam eden ders görünmüyor.")}</section>
            <section class="card"><h3>Başarısız görünen (${analysis.failed.length})</h3>${courseList(analysis.failed, "Başarısız ders görünmüyor.")}</section>
          </div>
          ${analysis.mismatches.length ? `<p class="warning"><b>Müfredat farkı:</b> Portalındaki ${analysis.mismatches.length} zorunlu ders kodu güncel katalogla eşleşmiyor. Danışman kontrolü gereken dersler: ${escapeHtml(analysis.mismatches.map(codeLabel).join(", "))}</p>` : ""}
          <p class="note">Bu sonuç akademik danışmanlık yerine geçmez. Eklenti yalnızca sayfadaki not özetini okur; şifre, oturum bilgisi veya transkript verisi dışarı gönderilmez.</p>
        </div>
      </div>`;

    const shell = host.shadowRoot.querySelector(".shell");
    host.shadowRoot.getElementById("refresh").addEventListener("click", () => render(table));
    host.shadowRoot.getElementById("toggle").addEventListener("click", (event) => {
      shell.classList.toggle("hidden");
      event.currentTarget.textContent = shell.classList.contains("hidden") ? "Genişlet" : "Daralt";
    });
  }

  function attach(table) {
    if (!table) return;
    render(table);
    if (observedTable === table) return;
    observedTable = table;
    const observer = new MutationObserver(() => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => render(table), 250);
    });
    observer.observe(table, { childList: true, subtree: true, characterData: true });
  }

  function discover() {
    const table = EmuPlanner.findRecordTable(document);
    if (table) attach(table);
    else latestState = { found: false };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "EMU_PLANNER_GET_STATE") sendResponse(latestState || { found: false });
  });

  discover();
  let attempts = 0;
  const discoveryTimer = setInterval(() => {
    attempts += 1;
    if (observedTable || attempts >= 30) clearInterval(discoveryTimer);
    else discover();
  }, 1000);
})();
