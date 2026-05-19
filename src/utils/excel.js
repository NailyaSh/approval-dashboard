import * as XLSX from 'xlsx';

const COMMENT_COL = 'Комментарий согласования';
const DURATION_COL = 'Продолжительность согласования';
const RESULT_COL = 'Результат согласования';

function normalizeHeader(value) {
  return String(value || '').trim();
}

export function parseXlsFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function computeFields(rows) {
  return rows.map(row => {
    const comment = normalizeHeader(row[COMMENT_COL]);
    const marker = 'Продолжительность согласования: ';
    const idx = comment.indexOf(marker);
    const duration = idx >= 0 ? comment.slice(idx + marker.length).trim() : '';
    const result = comment.startsWith('Не ') ? 'Не согласовано' : 'Согласовано';

    return {
      ...row,
      [DURATION_COL]: duration,
      [RESULT_COL]: result
    };
  });
}

export function exportToXlsx(rows, filename = 'result.xlsx') {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace(/\.xls$/i, '.xlsx');
  a.click();
  URL.revokeObjectURL(url);
}
