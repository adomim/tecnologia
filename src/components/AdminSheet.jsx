import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AdminSheet = ({ products, watermark }) => {
  const [rows, setRows] = useState(Array(50).fill().map(() => ({ 
    prodId: '', 
    qty: 0, 
    kilos: 0, 
    costs: 0, 
    total: 0, 
    income: 0 
  })));
  const [shift, setShift] = useState('Mañana');
  const [loading, setLoading] = useState(false);

  const updateRow = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;

    if (field === 'prodId' || field === 'kilos' || field === 'costs') {
      const selectedProd = products.find(p => p.id === newRows[index].prodId);
      if (selectedProd) {
        const price = selectedProd.hasDiscount ? selectedProd.price - selectedProd.discount : selectedProd.price;
        newRows[index].total = newRows[index].kilos * price;
        newRows[index].income = newRows[index].total - newRows[index].costs;
      }
    }
    setRows(newRows);
  };

  const saveDailySales = async () => {
    const validRows = rows.filter(r => r.prodId && r.total > 0);
    if (validRows.length === 0) return alert('No hay ventas registradas');

    setLoading(true);
    try {
      await addDoc(collection(db, 'sales'), {
        shift,
        date: serverTimestamp(),
        rows: validRows,
        totalDay: validRows.reduce((a, b) => a + b.total, 0),
        incomeDay: validRows.reduce((a, b) => a + b.income, 0)
      });
      alert('Planilla guardada con éxito');
      setRows(Array(50).fill().map(() => ({ prodId: '', qty: 0, kilos: 0, costs: 0, total: 0, income: 0 })));
    } catch (error) {
      console.error("Error saving sales:", error);
      alert('Error al guardar la planilla');
    }
    setLoading(false);
  };

  return (
    <div className="glass animate-up" style={{ padding: '30px', position: 'relative' }}>
      {watermark && <img src="/berryslr_logo.png" className="watermark" alt="watermark" />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className="gradient-text">Planilla de Control</h2>
          <p style={{ color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <select 
            className="btn-ghost" 
            value={shift} 
            onChange={(e) => setShift(e.target.value)}
            style={{ padding: '8px 20px', borderRadius: '12px' }}
          >
            <option value="Mañana">Turno Mañana</option>
            <option value="Tarde">Turno Tarde</option>
          </select>
          <button className="btn btn-primary" onClick={saveDailySales} disabled={loading}>
            {loading ? 'Guardando...' : 'Finalizar Turno'}
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Kilos</th>
              <th>Costos ($)</th>
              <th>Total ($)</th>
              <th>Ingreso ($)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                <td>
                  <select 
                    value={row.prodId} 
                    onChange={(e) => updateRow(i, 'prodId', e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#fff' }}
                  >
                    <option value="">Seleccionar...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </td>
                <td><input type="number" value={row.qty} onChange={(e) => updateRow(i, 'qty', parseInt(e.target.value))} /></td>
                <td><input type="number" value={row.kilos} onChange={(e) => updateRow(i, 'kilos', parseFloat(e.target.value))} /></td>
                <td><input type="number" value={row.costs} onChange={(e) => updateRow(i, 'costs', parseFloat(e.target.value))} /></td>
                <td style={{ fontWeight: 600 }}>${row.total.toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: 'var(--success)' }}>${row.income.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSheet;
