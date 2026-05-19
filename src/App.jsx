import React, { useMemo, useState } from 'react';
import { computeFields, exportToXlsx, parseXlsFile } from './utils/excel';
import { buildDashboard } from './utils/dashboard';

export default function App() {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const dashboard = useMemo(() => buildDashboard(rows), [rows]);

  async function handleUpload(e) {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xls')) {
      setError('Нужно загрузить файл с расширением .xls');
      return;
    }

    try {
      setFileName(file.name.replace(/\.xls$/i, '.xlsx'));
      const rawRows = await parseXlsFile(file);
      const computedRows = computeFields(rawRows);
      setRows(computedRows);
    } catch (err) {
      setError('Не удалось прочитать файл. Проверь формат Excel.');
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Дашборд согласования</h1>
        <p>Загрузка .xls, расчет полей и аналитика по согласующим.</p>
      </header>

      <section className="panel">
        <input type="file" accept=".xls" onChange={handleUpload} />
        {error && <div className="error">{error}</div>}
        {rows.length > 0 && (
          <button onClick={() => exportToXlsx(rows, fileName)}>
            Скачать .xlsx
          </button>
        )}
      </section>

      {rows.length > 0 && (
        <>
          <section className="metrics">
            <div className="card">
              <div className="card-label">Документов</div>
              <div className="card-value">{rows.length}</div>
            </div>
            <div className="card">
              <div className="card-label">Согласующих</div>
              <div className="card-value">{dashboard.length}</div>
            </div>
            <div className="card">
              <div className="card-label">Согласовано</div>
              <div className="card-value">
                {rows.filter(r => r['Результат согласования'] === 'Согласовано').length}
              </div>
            </div>
            <div className="card">
              <div className="card-label">Не согласовано</div>
              <div className="card-value">
                {rows.filter(r => r['Результат согласования'] === 'Не согласовано').length}
              </div>
            </div>
          </section>

          <section className="table-wrap">
            <h2>Сводка по согласующим</h2>
            <table>
              <thead>
                <tr>
                  <th>Согласующий из группы</th>
                  <th>Количество документов</th>
                  <th>Длительность согласования</th>
                  <th>Результат согласования</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.map(item => (
                  <tr key={item.approver}>
                    <td>{item.approver}</td>
                    <td>{item.docs}</td>
                    <td>{item.avgDuration}</td>
                    <td>
                      {item.approved > 0 && item.rejected > 0
                        ? 'Смешанный'
                        : item.approved > 0
                        ? 'Согласовано'
                        : 'Не согласовано'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="table-wrap">
            <h2>Данные файла</h2>
            <table>
              <thead>
                <tr>
                  {Object.keys(rows[0]).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((row, i) => (
                  <tr key={i}>
                    {Object.keys(rows[0]).map(key => (
                      <td key={key}>{String(row[key] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
