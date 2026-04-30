import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, BOSS_EMAIL, isBoss } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import ProductCatalog from './components/ProductCatalog';
import AdminSheet from './components/AdminSheet';

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('client');
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('catalog'); // catalog, sheet, config
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, weight: '', img: '' });
  const [watermark, setWatermark] = useState(false);

  // Sync products from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
    });
    return unsub;
  }, []);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (isBoss(u)) {
        setRole('boss');
      } else {
        setRole('client');
        setView('catalog');
      }
    });
    return unsub;
  }, []);

  const handleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => signOut(auth);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return alert('Complete los datos');
    await addDoc(collection(db, 'products'), { ...newProduct, sales: 0, hasDiscount: false, discount: 0 });
    setShowAddModal(false);
    setNewProduct({ name: '', price: 0, weight: '', img: '' });
  };

  const openPicker = () => {
    // Placeholder for Google Picker API
    alert('Integrando Google Picker API para seleccionar desde Drive...');
    // Real implementation would call gapi.picker
  };

  return (
    <div className="container" style={{ position: 'relative', minHeight: '100vh', paddingBottom: '100px' }}>
      <header className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', marginBottom: '40px', position: 'sticky', top: '20px', z-index: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/berryslr_logo.png" alt="Logo" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
          <div>
            <h1 className="berry-gradient-text" style={{ fontSize: '1.5rem' }}>BerrysLr</h1>
            {role === 'boss' && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Jefe/Dueño: {user?.displayName}</span>}
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '10px' }}>
          {role === 'boss' && (
            <>
              <button className={`btn ${view === 'sheet' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('sheet')}>Planillas</button>
              <button className={`btn ${view === 'config' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('config')}>Configuración</button>
            </>
          )}
          <button className={`btn ${view === 'catalog' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('catalog')}>Catálogo</button>
          
          {!user ? (
            <button className="btn btn-primary" onClick={handleLogin}>Panel Jefe</button>
          ) : (
            <button className="btn btn-ghost" onClick={handleLogout} title="Cerrar Sesión">
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          )}
        </nav>
      </header>

      <main>
        {view === 'catalog' && <ProductCatalog products={products} onAddToCart={(p) => alert(`Añadido: ${p.name}`)} />}
        
        {role === 'boss' && view === 'sheet' && (
          <AdminSheet products={products} watermark={watermark} />
        )}

        {role === 'boss' && view === 'config' && (
          <div className="glass animate-up" style={{ padding: '40px' }}>
            <h2 className="gradient-text" style={{ marginBottom: '30px' }}>Configuración del Sistema</h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="glass" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                <h3>Preferencias de Visualización</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={watermark} onChange={(e) => setWatermark(e.target.checked)} />
                  Marca de agua de fruta en planillas
                </label>
              </div>

              <div className="glass" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                <h3>Lista de Productos</h3>
                <div style={{ marginTop: '15px' }}>
                  {products.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
                      <span>{p.name} - ${p.price}</span>
                      <button className="btn-ghost" onClick={() => openPicker()} style={{ padding: '4px 10px', fontSize: '0.7rem' }}>Cambiar Foto</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {role === 'boss' && view === 'config' && (
        <button className="fab" onClick={() => setShowAddModal(true)}>
          <i className="fa-solid fa-plus"></i>
        </button>
      )}

      {showAddModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content glass animate-up">
            <h2 style={{ marginBottom: '20px' }}>Nuevo Producto</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              <input type="text" placeholder="Nombre" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <input type="number" placeholder="Precio" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
              <input type="text" placeholder="Peso (ej: 1kg)" value={newProduct.weight} onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})} />
              <button className="btn btn-ghost" onClick={openPicker}>Seleccionar Foto desde Drive</button>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddProduct}>Guardar</button>
                <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
