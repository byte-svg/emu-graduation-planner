(async function () {
  "use strict";
  const status = document.getElementById("status");
  const reload = document.getElementById("reload");

  async function currentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  async function update() {
    const tab = await currentTab();
    if (!tab?.url?.startsWith("https://student.emu.edu.tr/Academic/RecordSheet")) {
      status.className = "status warn";
      status.textContent = "Not Dökümü sayfası açık değil.";
      return;
    }
    try {
      const state = await chrome.tabs.sendMessage(tab.id, { type: "EMU_PLANNER_GET_STATE" });
      if (!state?.found) throw new Error("table-not-found");
      status.className = "status ok";
      const period = state.latestPeriod ? `${state.latestPeriod} dahil · ` : "";
      const warning = state.mismatches ? ` · ${state.mismatches} müfredat farkı` : "";
      status.textContent = `${period}%${state.percentage} tamamlandı · ${state.completedEcts}/${state.totalEcts} AKTS · ${state.records} satır${warning}`;
    } catch {
      status.className = "status warn";
      status.textContent = "Ders tablosu henüz bulunamadı. Sayfayı yenileyip tekrar dene.";
    }
  }

  reload.addEventListener("click", async () => {
    const tab = await currentTab();
    if (tab?.id) await chrome.tabs.reload(tab.id);
    window.close();
  });

  update();
})();
