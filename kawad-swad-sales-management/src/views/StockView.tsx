import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { StockTxnType } from '../types';

export const StockView: React.FC = () => {
  const {
    currentUser,
    users,
    products,
    companyStockSummary,
    salesmanStockSummary,
    stockTransactions,
    recordStockMovement,
    recordOpeningStockBatch,
  } = useStore();

  const isManager = currentUser?.role === 'OWNER' || currentUser?.role === 'PA';
  const activeProducts = products.filter((p) => p.active);
  const activeSalesmen = users.filter((u) => u.role === 'SALESMAN' && u.active);

  const [txnType, setTxnType] = useState<StockTxnType>('COMPANY_RECEIPT');
  const [productId, setProductId] = useState(activeProducts[0]?.product_id || '');
  const [salesmanId, setSalesmanId] = useState(activeSalesmen[0]?.user_id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState('');
  const [txnDate, setTxnDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submitKey, setSubmitKey] = useState('');
  const [notice, setNotice] = useState<{ msg: string; error?: boolean } | null>(null);
  const [batchLines, setBatchLines] = useState<Array<{ product_id: string; quantity: number; key: string }>>([
    { product_id: activeProducts[0]?.product_id || '', quantity: 0, key: '' },
  ]);
  const [batchReason, setBatchReason] = useState('Factory opening count');
  const [batchDate, setBatchDate] = useState(() => new Date().toISOString().slice(0, 10));

  const needsSalesman = ['ISSUE_TO_SALESMAN', 'RETURN_FROM_SALESMAN', 'SALESMAN_ADJUSTMENT', 'ISSUED', 'RETURNED'].includes(txnType);
  const selectedProduct = products.find((p) => p.product_id === productId);
  const selectedUnit = (selectedProduct?.selling_unit || 'PACKET').toUpperCase().includes('KG') ? 'KG' : 'PACKET';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (quantity <= 0) {
      setNotice({ msg: 'Quantity must be greater than 0.', error: true });
      return;
    }

    const idempotencyKey = submitKey || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `stk-${Date.now()}`);
    setSubmitKey(idempotencyKey);

    try {
      await recordStockMovement({
        txn_type: txnType,
        product_id: productId,
        salesman_user_id: needsSalesman ? salesmanId : '',
        quantity: Number(quantity),
        unit: selectedUnit,
        notes: notes.trim(),
        reason: notes.trim(),
        txn_datetime: txnDate,
        idempotency_key: idempotencyKey,
      });

      setNotice({ msg: `Stock movement "${txnType}" recorded.` });
      setNotes('');
      setSubmitKey('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to record stock movement';
      setNotice({ msg: errorMsg, error: true });
    }
  };

  const handleBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const lines = batchLines
      .filter((line) => line.product_id && line.quantity > 0)
      .map((line) => {
        const product = products.find((p) => p.product_id === line.product_id);
        const unit = (product?.selling_unit || 'PACKET').toUpperCase().includes('KG') ? 'KG' : 'PACKET';
        const key = line.key || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `stk-${line.product_id}-${Date.now()}`);
        return { ...line, key, unit };
      });
    if (!lines.length) {
      setNotice({ msg: 'Enter a quantity for at least one product.', error: true });
      return;
    }
    setBatchLines((prev) => prev.map((line) => {
      const match = lines.find((item) => item.product_id === line.product_id && item.quantity === line.quantity);
      return match ? { ...line, key: match.key } : line;
    }));
    try {
      await recordOpeningStockBatch(lines.map((line) => ({
        product_id: line.product_id,
        quantity: line.quantity,
        unit: line.unit,
        reason: batchReason.trim(),
        txn_datetime: batchDate,
        idempotency_key: line.key,
      })));
      setNotice({ msg: 'Opening stock lines were saved one after another. Google Sheets is not an atomic batch.' });
      setBatchLines([{ product_id: activeProducts[0]?.product_id || '', quantity: 0, key: '' }]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Opening stock batch failed';
      setNotice({ msg: errorMsg, error: true });
    }
  };

  // Filter salesman stock & ledger for salesman role
  const visibleSalesmanStock = currentUser?.role === 'SALESMAN'
    ? salesmanStockSummary.filter((s) => s.salesman_user_id === currentUser.user_id)
    : salesmanStockSummary;

  const visibleTransactions = currentUser?.role === 'SALESMAN'
    ? stockTransactions.filter((t) => t.salesman_user_id === currentUser.user_id)
    : stockTransactions;

  return (
    <div>
      <h1>Company &amp; Salesman Stock</h1>

      {notice && (
        <div className={notice.error ? 'notice-error' : 'notice-success'}>
          {notice.msg}
        </div>
      )}

      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>
          Stock is calculated strictly from the immutable stock ledger. Enter an opening quantity as a
          Company receipt before issuing stock to salesmen. All quantities use the product's configured
          selling unit.
        </p>

        {isManager ? (
          <>
            <h2>Record stock movement</h2>
            <form className="inline" onSubmit={handleSubmit}>
              <label>
                Movement
                <select
                  value={txnType}
                  onChange={(e) => setTxnType(e.target.value as StockTxnType)}
                >
                  <option value="COMPANY_RECEIPT">Warehouse opening / receipt</option>
                  <option value="ISSUE_TO_SALESMAN">Issue to salesman</option>
                  <option value="RETURN_FROM_SALESMAN">Return from salesman</option>
                  <option value="POSITIVE_ADJUSTMENT">Warehouse positive adjustment</option>
                  <option value="SALESMAN_ADJUSTMENT">Salesman positive adjustment</option>
                </select>
              </label>

              <label>
                Product
                <select
                  required
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  {activeProducts.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.sku} · {p.product_name} ({p.pack_weight_g}g)
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Salesman
                <select
                  value={salesmanId}
                  onChange={(e) => setSalesmanId(e.target.value)}
                  disabled={!needsSalesman}
                  required={needsSalesman}
                >
                  {activeSalesmen.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.user_id})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Quantity ({selectedUnit})
                <input
                  type="number"
                  min={selectedUnit === 'KG' ? '0.001' : '1'}
                  step={selectedUnit === 'KG' ? '0.001' : '1'}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </label>

              <label>
                Date
                <input type="date" required value={txnDate} onChange={(e) => setTxnDate(e.target.value)} />
              </label>

              <label style={{ gridColumn: 'span 2' }}>
                Notes / reference
                <input
                  maxLength={500}
                  required={txnType === 'COMPANY_RECEIPT'}
                  placeholder="Opening count reference, challan number, or return note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>

              <div style={{ marginTop: '6px' }}>
                <button type="submit">Record movement</button>
              </div>
            </form>

            <h2 style={{ marginTop: '22px' }}>Warehouse opening stock — several products</h2>
            <p className="muted">
              Each line is saved separately. If a later line fails, earlier lines stay in the sheet.
              Submit the same lines again only after reading the error; saved lines use their own keys and are not duplicated.
            </p>
            <form onSubmit={handleBatch}>
              <label>
                Count date
                <input type="date" required value={batchDate} onChange={(e) => setBatchDate(e.target.value)} />
              </label>
              <label>
                Reason for this count
                <input required minLength={3} value={batchReason} onChange={(e) => setBatchReason(e.target.value)} />
              </label>
              {batchLines.map((line, index) => {
                const product = products.find((p) => p.product_id === line.product_id);
                const unit = (product?.selling_unit || 'PACKET').toUpperCase().includes('KG') ? 'KG' : 'PACKET';
                return (
                  <div key={`${line.key || 'new'}-${index}`} className="inline">
                    <label>
                      Product
                      <select
                        value={line.product_id}
                        onChange={(e) => {
                          const next = [...batchLines];
                          next[index] = { ...line, product_id: e.target.value };
                          setBatchLines(next);
                        }}
                      >
                        {activeProducts.map((p) => (
                          <option key={p.product_id} value={p.product_id}>
                            {p.sku} · {p.product_name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Quantity ({unit})
                      <input
                        type="number"
                        min="0"
                        step={unit === 'KG' ? '0.001' : '1'}
                        value={line.quantity}
                        onChange={(e) => {
                          const next = [...batchLines];
                          next[index] = { ...line, quantity: Number(e.target.value) };
                          setBatchLines(next);
                        }}
                      />
                    </label>
                  </div>
                );
              })}
              <div className="actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setBatchLines((prev) => [...prev, { product_id: activeProducts[0]?.product_id || '', quantity: 0, key: '' }])}
                >
                  Add product line
                </button>
                <button type="submit">Save opening quantities</button>
              </div>
            </form>
          </>
        ) : (
          <p className="muted">
            You are logged in as a Field Salesman. You can view your currently assigned stock balance and
            recent transactions below.
          </p>
        )}
      </div>

      <div className="card">
        <h2>Company Stock</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Pack Weight</th>
                <th>Available Company Stock</th>
              </tr>
            </thead>
            <tbody>
              {companyStockSummary.map((item) => (
                <tr key={item.product_id}>
                  <td>
                    <strong>{item.sku}</strong>
                  </td>
                  <td>{item.product_name}</td>
                  <td>{item.pack_weight_g}g</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: item.company_quantity > 0 ? '#176b52' : '#b42318',
                      }}
                    >
                      {item.company_quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Salesman Stock In-Hand</h2>
        {visibleSalesmanStock.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Salesman</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {visibleSalesmanStock.map((s, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{s.salesman_name}</strong>
                    </td>
                    <td>{s.sku}</td>
                    <td>{s.product_name}</td>
                    <td>
                      <span className="badge on">{s.quantity} {s.unit || ''}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">No current salesman stock balances assigned.</p>
        )}
      </div>

      <div className="card">
        <h2>Recent Stock Movements Ledger</h2>
        {visibleTransactions.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Movement</th>
                  <th>SKU</th>
                  <th>Salesman</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.slice(0, 50).map((t) => (
                  <tr key={t.stock_txn_id}>
                    <td>{new Date(t.txn_datetime).toLocaleString('en-IN')}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          background:
                            t.txn_type === 'ISSUED'
                              ? '#e0f2fe'
                              : t.txn_type === 'COMPANY_RECEIPT'
                              ? '#dcfce7'
                              : '#fef3c7',
                          color:
                            t.txn_type === 'ISSUED'
                              ? '#0369a1'
                              : t.txn_type === 'COMPANY_RECEIPT'
                              ? '#15803d'
                              : '#b45309',
                        }}
                      >
                        {t.txn_type}
                      </span>
                    </td>
                    <td>{t.sku_snapshot}</td>
                    <td>{t.salesman_user_id || '—'}</td>
                    <td>
                      <strong>{t.quantity}</strong>
                    </td>
                    <td>{t.unit}</td>
                    <td className="muted">{t.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">No stock transactions recorded yet.</p>
        )}
      </div>
    </div>
  );
};
