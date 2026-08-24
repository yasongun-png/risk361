(() => {
  const STORAGE_KEY = 'isg-hizmet-sozlesmeleri-v1';

  /** @type {Array<Object>} */
  let records = loadRecords();

  const tableBody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');
  const reportMeta = document.getElementById('reportMeta');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('contractForm');

  document.getElementById('btnNew').addEventListener('click', () => openModal());
  document.getElementById('btnCloseModal').addEventListener('click', closeModal);
  document.getElementById('btnCancel').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
  form.addEventListener('submit', onSubmit);
  document.getElementById('btnExport').addEventListener('click', exportToExcel);

  render();

  // ---------- Persistence ----------

  function loadRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : seedRecords();
    } catch {
      return seedRecords();
    }
  }

  function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function seedRecords() {
    // Örnek kayıt: kaynak rapordaki formatı gösterir.
    return [
      {
        id: cryptoId(),
        firmaAdi: 'Bagfaş Teknik Müteahitlik',
        firmaDurumu: 'Aktif',
        sicilNo: '23312010110503230100988000',
        personelSayisi: 89,
        tehlikeSinifi: 'Tehlikeli',
        vekilAd: 'İsa CEVRİN',
        vekilUnvan: 'Bakım ve Onarım Müdürü',
        isgAd: 'Koray ŞAHBAZ',
        isgSinif: 'A Sınıfı',
        isgGerekli: 1780,
        isgAtanan: 1820,
        hekimAd: 'Celal Yavuz',
        hekimGerekli: 890,
        hekimAtanan: 900,
        dspAd: '',
        dspGerekli: 0,
        dspAtanan: 0,
        pdfIsg: true,
        pdfHekim: true,
        pdfDsp: false,
      },
    ];
  }

  function cryptoId() {
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ---------- Domain helpers ----------

  function roleStatus(gerekli, atanan, isAssigned) {
    if (!isAssigned) return { label: 'Kapsam Dışı', ok: null };
    const g = Number(gerekli) || 0;
    const a = Number(atanan) || 0;
    return { label: a >= g ? 'Uygun' : 'Yetersiz', ok: a >= g };
  }

  function computeUygunluk(rec) {
    const isg = roleStatus(rec.isgGerekli, rec.isgAtanan, !!rec.isgAd);
    const hekim = roleStatus(rec.hekimGerekli, rec.hekimAtanan, !!rec.hekimAd);
    const dsp = roleStatus(rec.dspGerekli, rec.dspAtanan, !!rec.dspAd);
    const assignedStatuses = [isg, hekim, dsp].filter((s) => s.ok !== null);
    if (assignedStatuses.length === 0) {
      return { label: 'Belirsiz', ok: null, detail: 'Atanmış personel bulunmuyor.' };
    }
    const allOk = assignedStatuses.every((s) => s.ok);
    return {
      label: allOk ? 'Uygun' : 'Yetersiz',
      ok: allOk,
      detail: allOk ? 'Atama süreleri uygun.' : 'Atama süresi yetersiz olan personel var.',
    };
  }

  function fmtMinutes(n) {
    return Number(n || 0).toLocaleString('tr-TR');
  }

  // ---------- Rendering ----------

  function render() {
    tableBody.innerHTML = '';
    emptyState.hidden = records.length > 0;

    records.forEach((rec, idx) => {
      tableBody.appendChild(buildRow(rec, idx + 1));
    });

    const now = new Date();
    reportMeta.textContent = `Rapor Tarihi: ${formatDateTime(now)}   |   Kayıt Sayısı: ${records.length}`;
  }

  function formatDateTime(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function roleCellHtml(name, sinifOrNull, gerekli, atanan, isAssigned) {
    if (!isAssigned) {
      return `<div class="cell-block"><span class="cell-title">-</span><br>
        <span class="cell-sub">Gerekli: 0 dk/ay · Atanan: 0 dk/ay</span><br>
        <span class="badge badge-off">Kapsam Dışı</span></div>`;
    }
    const status = roleStatus(gerekli, atanan, true);
    const sinifLine = sinifOrNull ? `<br><span class="cell-detail">${escapeHtml(sinifOrNull)}</span>` : '';
    return `<div class="cell-block">
        <span class="cell-name">${escapeHtml(name)}</span>${sinifLine}<br>
        <span class="cell-sub">Gerekli: ${fmtMinutes(gerekli)} dk/ay · Atanan: ${fmtMinutes(atanan)} dk/ay</span><br>
        <span class="badge ${status.ok ? 'badge-ok' : 'badge-warn'}">${status.label}</span>
      </div>`;
  }

  function buildRow(rec, no) {
    const tr = document.createElement('tr');
    const uygunluk = computeUygunluk(rec);

    const pdfList = [];
    if (rec.pdfIsg) pdfList.push('İG Uzmanı PDF');
    if (rec.pdfHekim) pdfList.push('Hekim PDF');
    if (rec.pdfDsp) pdfList.push('DSP PDF');

    tr.innerHTML = `
      <td>${no}</td>
      <td><span class="cell-title">${escapeHtml(rec.firmaAdi)}</span><br><span class="cell-sub">${escapeHtml(rec.firmaDurumu)}</span></td>
      <td class="col-sicilno">${escapeHtml(rec.sicilNo)}</td>
      <td><span class="cell-name">${escapeHtml(rec.vekilAd || '-')}</span><br><span class="cell-detail">${escapeHtml(rec.vekilUnvan || '')}</span></td>
      <td>${roleCellHtml(rec.isgAd, rec.isgSinif, rec.isgGerekli, rec.isgAtanan, !!rec.isgAd)}</td>
      <td>${roleCellHtml(rec.hekimAd, null, rec.hekimGerekli, rec.hekimAtanan, !!rec.hekimAd)}</td>
      <td>${roleCellHtml(rec.dspAd, null, rec.dspGerekli, rec.dspAtanan, !!rec.dspAd)}</td>
      <td><span class="cell-title">${escapeHtml(String(rec.personelSayisi))}</span><br><span class="cell-sub">${escapeHtml(rec.tehlikeSinifi)}</span></td>
      <td class="col-uygunluk ${uygunluk.ok === false ? 'bad' : 'ok'}">${uygunluk.label}<br><span class="cell-sub" style="font-weight:400">${uygunluk.detail || ''}</span></td>
      <td>${pdfList.length ? pdfList.join('<br>') : '<span class="cell-sub">—</span>'}</td>
      <td class="actions-cell">
        <button class="btn-icon" data-action="edit" title="Düzenle">✏️</button>
        <button class="btn-icon" data-action="delete" title="Sil">🗑️</button>
      </td>
    `;

    tr.querySelector('[data-action="edit"]').addEventListener('click', () => openModal(rec.id));
    tr.querySelector('[data-action="delete"]').addEventListener('click', () => deleteRecord(rec.id));

    return tr;
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  // ---------- CRUD ----------

  function openModal(id) {
    form.reset();
    document.getElementById('recordId').value = id || '';

    if (id) {
      const rec = records.find((r) => r.id === id);
      modalTitle.textContent = 'Sözleşmeyi Düzenle';
      fillForm(rec);
    } else {
      modalTitle.textContent = 'Yeni Sözleşme';
    }
    modalOverlay.hidden = false;
  }

  function closeModal() {
    modalOverlay.hidden = true;
  }

  function fillForm(rec) {
    document.getElementById('firmaAdi').value = rec.firmaAdi;
    document.getElementById('firmaDurumu').value = rec.firmaDurumu;
    document.getElementById('sicilNo').value = rec.sicilNo;
    document.getElementById('personelSayisi').value = rec.personelSayisi;
    document.getElementById('tehlikeSinifi').value = rec.tehlikeSinifi;
    document.getElementById('vekilAd').value = rec.vekilAd || '';
    document.getElementById('vekilUnvan').value = rec.vekilUnvan || '';
    document.getElementById('isgAd').value = rec.isgAd || '';
    document.getElementById('isgSinif').value = rec.isgSinif || '';
    document.getElementById('isgGerekli').value = rec.isgGerekli || 0;
    document.getElementById('isgAtanan').value = rec.isgAtanan || 0;
    document.getElementById('hekimAd').value = rec.hekimAd || '';
    document.getElementById('hekimGerekli').value = rec.hekimGerekli || 0;
    document.getElementById('hekimAtanan').value = rec.hekimAtanan || 0;
    document.getElementById('dspAd').value = rec.dspAd || '';
    document.getElementById('dspGerekli').value = rec.dspGerekli || 0;
    document.getElementById('dspAtanan').value = rec.dspAtanan || 0;
    document.getElementById('pdfIsg').checked = !!rec.pdfIsg;
    document.getElementById('pdfHekim').checked = !!rec.pdfHekim;
    document.getElementById('pdfDsp').checked = !!rec.pdfDsp;
  }

  function onSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('recordId').value;

    const rec = {
      id: id || cryptoId(),
      firmaAdi: document.getElementById('firmaAdi').value.trim(),
      firmaDurumu: document.getElementById('firmaDurumu').value,
      sicilNo: document.getElementById('sicilNo').value.trim(),
      personelSayisi: Number(document.getElementById('personelSayisi').value) || 0,
      tehlikeSinifi: document.getElementById('tehlikeSinifi').value,
      vekilAd: document.getElementById('vekilAd').value.trim(),
      vekilUnvan: document.getElementById('vekilUnvan').value.trim(),
      isgAd: document.getElementById('isgAd').value.trim(),
      isgSinif: document.getElementById('isgSinif').value,
      isgGerekli: Number(document.getElementById('isgGerekli').value) || 0,
      isgAtanan: Number(document.getElementById('isgAtanan').value) || 0,
      hekimAd: document.getElementById('hekimAd').value.trim(),
      hekimGerekli: Number(document.getElementById('hekimGerekli').value) || 0,
      hekimAtanan: Number(document.getElementById('hekimAtanan').value) || 0,
      dspAd: document.getElementById('dspAd').value.trim(),
      dspGerekli: Number(document.getElementById('dspGerekli').value) || 0,
      dspAtanan: Number(document.getElementById('dspAtanan').value) || 0,
      pdfIsg: document.getElementById('pdfIsg').checked,
      pdfHekim: document.getElementById('pdfHekim').checked,
      pdfDsp: document.getElementById('pdfDsp').checked,
    };

    if (id) {
      const i = records.findIndex((r) => r.id === id);
      records[i] = rec;
    } else {
      records.push(rec);
    }

    saveRecords();
    render();
    closeModal();
  }

  function deleteRecord(id) {
    if (!confirm('Bu sözleşme kaydını silmek istediğinize emin misiniz?')) return;
    records = records.filter((r) => r.id !== id);
    saveRecords();
    render();
  }

  // ---------- Excel Export ----------

  async function exportToExcel() {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Hizmet Sözleşmeleri', {
      views: [{ state: 'frozen', ySplit: 5 }],
    });

    ws.columns = [
      { key: 'no', width: 6 },
      { key: 'firma', width: 30 },
      { key: 'sicilNo', width: 33 },
      { key: 'vekil', width: 23 },
      { key: 'isg', width: 29 },
      { key: 'hekim', width: 26 },
      { key: 'dsp', width: 25 },
      { key: 'personel', width: 18 },
      { key: 'uygunluk', width: 38 },
      { key: 'pdf', width: 20 },
    ];

    const now = new Date();
    const dateStr = formatDateTime(now);
    const totalCols = 10;

    // Row 1: title
    ws.mergeCells(1, 1, 1, totalCols);
    const titleCell = ws.getCell(1, 1);
    titleCell.value = 'Hizmet Sözleşmeleri';
    titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    ws.getRow(1).height = 26.1;

    // Row 2: subtitle
    ws.mergeCells(2, 1, 2, totalCols);
    const subCell = ws.getCell(2, 1);
    subCell.value = 'Sicil bazında İSG profesyoneli atama dakikası, yasal süre hesabı ve uygunluk değerlendirmesi.';
    subCell.font = { name: 'Segoe UI', size: 9 };
    subCell.alignment = { vertical: 'top', wrapText: true };
    applyThinBorder(subCell);
    ws.getRow(2).height = 21.95;

    // Row 3: info bar
    ws.mergeCells(3, 1, 3, totalCols);
    const infoCell = ws.getCell(3, 1);
    infoCell.value = `Rapor Tarihi: ${dateStr}   |   Kayıt Sayısı: ${records.length}`;
    infoCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF1E293B' } };
    infoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    infoCell.alignment = { vertical: 'middle' };
    applyThinBorder(infoCell);
    ws.getRow(3).height = 18;

    // Row 4: spacer (left blank, matches source file)

    // Row 5: headers
    const headers = ['No', 'Sicil / Firma', 'Sicil No', 'İşveren Vekili', 'İSG Uzmanı', 'İşyeri Hekimi', 'DSP', 'Personel / Tehlike', 'Uygunluk Durumu', 'PDF Belgeler'];
    const headerRow = ws.getRow(5);
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF24364B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      applyThinBorder(cell);
    });
    headerRow.height = 20;

    // Data rows
    records.forEach((rec, idx) => {
      const r = 6 + idx;
      const row = ws.getRow(r);
      const uygunluk = computeUygunluk(rec);

      const pdfList = [];
      if (rec.pdfIsg) pdfList.push('İG Uzmanı PDF');
      if (rec.pdfHekim) pdfList.push('Hekim PDF');
      if (rec.pdfDsp) pdfList.push('DSP PDF');

      const values = [
        idx + 1,
        `${rec.firmaAdi}\n${rec.firmaDurumu}`,
        rec.sicilNo,
        `${rec.vekilAd || '-'}\n${rec.vekilUnvan || ''}`.trim(),
        roleLines(rec.isgAd, rec.isgSinif, rec.isgGerekli, rec.isgAtanan, !!rec.isgAd),
        roleLines(rec.hekimAd, null, rec.hekimGerekli, rec.hekimAtanan, !!rec.hekimAd),
        roleLines(rec.dspAd, null, rec.dspGerekli, rec.dspAtanan, !!rec.dspAd),
        `${rec.personelSayisi}\n${rec.tehlikeSinifi}`,
        `${uygunluk.label}\n${uygunluk.detail || ''}`.trim(),
        pdfList.length ? pdfList.join('\n') : '-',
      ];

      values.forEach((val, i) => {
        const cell = row.getCell(i + 1);
        cell.value = val;
        cell.font = { name: 'Segoe UI', size: 9 };
        cell.alignment = { vertical: 'top', wrapText: true };
        applyThinBorder(cell);
      });

      // Sicil No column: monospace style
      const sicilCell = row.getCell(3);
      sicilCell.font = { name: 'Consolas', size: 9 };
      sicilCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      sicilCell.numFmt = '@';

      // Uygunluk column: colored + centered
      const uygunlukCell = row.getCell(9);
      uygunlukCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      uygunlukCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: uygunluk.ok === false ? 'FF991B1B' : 'FF166534' } };
      uygunlukCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: uygunluk.ok === false ? 'FFFEE2E2' : 'FFDCFCE7' } };

      row.height = 57.95;
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ISG_Hizmet_Sozlesmeleri_Raporu_${now.toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function roleLines(name, sinif, gerekli, atanan, isAssigned) {
    if (!isAssigned) {
      return '-\nGerekli: 0 dk/ay · Atanan: 0 dk/ay\nKapsam Dışı';
    }
    const status = roleStatus(gerekli, atanan, true);
    const nameLine = sinif ? `${name}\n${sinif}` : name;
    return `${nameLine}\nGerekli: ${fmtMinutes(gerekli)} dk/ay · Atanan: ${fmtMinutes(atanan)} dk/ay\n${status.label}`;
  }

  function applyThinBorder(cell) {
    const border = { style: 'thin', color: { argb: 'FFCBD5E1' } };
    cell.border = { top: border, bottom: border, left: border, right: border };
  }
})();
