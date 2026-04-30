const app = {
    state: {
        role: 'client', // 'client' or 'boss'
        products: [
            { id: 1, name: 'Arándanos', weight: '1kg', price: 2000, discount: 0, hasDiscount: false, sales: 0, img: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&q=80&w=400' },
            { id: 2, name: 'Mix Tucumano', weight: '1kg', price: 2500, discount: 0, hasDiscount: false, sales: 0, img: 'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&q=80&w=400' },
            { id: 3, name: 'Mix Patagónico', weight: '1kg', price: 1000, discount: 0, hasDiscount: false, sales: 0, img: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=400' },
            { id: 4, name: 'Frambuesa', weight: '1kg', price: 6000, discount: 0, hasDiscount: false, sales: 0, img: 'https://images.unsplash.com/photo-1544070078-a21227131844?auto=format&fit=crop&q=80&w=400' },
            { id: 5, name: 'Zarzamora', weight: '1kg', price: 8000, discount: 0, hasDiscount: false, sales: 0, img: 'https://images.unsplash.com/photo-1520639804526-7f41f19890ba?auto=format&fit=crop&q=80&w=400' },
            { id: 6, name: 'Frutilla', weight: '1kg', price: 2000, discount: 0, hasDiscount: false, sales: 0, img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=400' },
            { id: 7, name: 'Ananá', weight: '1kg', price: 5009, discount: 0, hasDiscount: false, sales: 0, img: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=400' },
            { id: 8, name: 'Mango', weight: '1kg', price: 9000, discount: 0, hasDiscount: false, sales: 0, img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400' },
            { id: 9, name: 'Durazno', weight: '1kg', price: 1400, discount: 0, hasDiscount: false, sales: 0, img: 'https://images.unsplash.com/photo-1629911990142-12f689de6922?auto=format&fit=crop&q=80&w=400' },
            { id: 10, name: 'Frutilla (Pequ.)', weight: '250gr', price: 1000, discount: 0, hasDiscount: false, sales: 0, img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=400' }
        ],
        dailySales: Array(50).fill().map(() => ({ prodId: 0, qty: 0, kilos: 0, costs: 0, total: 0, income: 0 })),
        history: [],
        settings: {
            watermark: false,
            adminPass: '2819',
            logoUrl: 'berryslr_logo.png'
        }
    },

    init() {
        this.loadLocalData();
        this.setupEventListeners();
        this.renderCatalog();
        this.renderDailySheet();
        this.updateDateDisplay();
        this.updateLogoUI();
        this.switchRole('client');

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(() => console.log('SW Registered'))
                .catch(err => console.log('SW Registration Failed', err));
        }
    },

    loadLocalData() {
        const saved = localStorage.getItem('berryslr_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state = { ...this.state, ...parsed };
        }
    },

    saveLocalData() {
        localStorage.setItem('berryslr_data', JSON.stringify(this.state));
    },

    setupEventListeners() {
        // Auth Modal
        document.getElementById('btn-login').addEventListener('click', () => {
            document.getElementById('modal-auth').style.display = 'flex';
        });

        document.getElementById('btn-auth-cancel').addEventListener('click', () => {
            document.getElementById('modal-auth').style.display = 'none';
        });

        document.getElementById('btn-auth-confirm').addEventListener('click', () => {
            const pass = document.getElementById('admin-pass').value;
            if (pass === this.state.settings.adminPass) {
                this.switchRole('boss');
                document.getElementById('modal-auth').style.display = 'none';
                document.getElementById('admin-pass').value = '';
            } else {
                alert('Contraseña incorrecta');
            }
        });

        document.getElementById('btn-logout').addEventListener('click', () => {
            this.switchRole('client');
        });

        // Tabs
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
                document.querySelectorAll('.admin-tab-btn').forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-ghost');
                });

                document.getElementById(tabId).style.display = 'block';
                e.currentTarget.classList.add('btn-primary');
                e.currentTarget.classList.remove('btn-ghost');

                if (tabId === 'tab-precios') this.renderAdminProducts();
                if (tabId === 'tab-historial') this.renderHistory();
            });
        });
    },

    switchRole(role) {
        this.state.role = role;
        const indicator = document.getElementById('role-indicator');
        const loginBtn = document.getElementById('btn-login');
        const logoutBtn = document.getElementById('btn-logout');
        const catalogView = document.getElementById('view-catalog');
        const adminView = document.getElementById('view-admin');

        if (role === 'boss') {
            indicator.textContent = 'Modo Jefe';
            indicator.className = 'profile-badge badge-boss';
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'flex';
            catalogView.classList.remove('active');
            adminView.classList.add('active');
        } else {
            indicator.textContent = 'Cliente';
            indicator.className = 'profile-badge badge-client';
            loginBtn.style.display = 'flex';
            logoutBtn.style.display = 'none';
            catalogView.classList.add('active');
            adminView.classList.remove('active');
            this.renderCatalog(); // Refresh catalog price updates
        }
    },

    renderCatalog() {
        const list = document.getElementById('product-list');
        list.innerHTML = this.state.products.map(p => `
            <div class="product-card glass">
                <img src="${p.img}" alt="${p.name}" class="product-image" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(p.name)}'">
                <div class="product-info">
                    <div class="product-meta">
                        <span>${p.weight}</span>
                        <span class="activity-indicator ${this.getActivityClass(p.sales)}"></span>
                    </div>
                    <h3 class="product-name">${p.name}</h3>
                    <div class="product-price">$${this.formatNumber(p.hasDiscount ? p.price - p.discount : p.price)}</div>
                    <button class="btn btn-primary" style="width: 100%" onclick="app.addToCart(${p.id})">
                        <i class="fa-solid fa-cart-plus"></i> Añadir
                    </button>
                    ${p.hasDiscount ? `<small style="color:var(--success)">Descuento aplicado: -$${p.discount}</small>` : ''}
                </div>
            </div>
        `).join('');
    },

    getActivityClass(sales) {
        if (sales > 20) return 'indicator-green';
        if (sales > 5) return 'indicator-orange';
        return 'indicator-red';
    },

    renderDailySheet() {
        const tbody = document.getElementById('sales-rows');
        tbody.innerHTML = this.state.dailySales.map((row, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>
                    <select onchange="app.updateRow(${idx}, 'prodId', this.value)">
                        <option value="0">Seleccionar...</option>
                        ${this.state.products.map(p => `<option value="${p.id}" ${row.prodId == p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                    </select>
                </td>
                <td><input type="number" value="${row.qty}" onchange="app.updateRow(${idx}, 'qty', this.value)"></td>
                <td><input type="number" value="${row.kilos}" onchange="app.updateRow(${idx}, 'kilos', this.value)"></td>
                <td><input type="number" value="${row.costs}" onchange="app.updateRow(${idx}, 'costs', this.value)"></td>
                <td id="row-total-${idx}">$${this.formatNumber(row.total)}</td>
                <td id="row-income-${idx}" style="color: var(--success); font-weight: 700;">$${this.formatNumber(row.income)}</td>
            </tr>
        `).join('');
    },

    updateRow(idx, field, value) {
        this.state.dailySales[idx][field] = parseFloat(value) || 0;

        const row = this.state.dailySales[idx];
        const product = this.state.products.find(p => p.id == row.prodId);

        if (product) {
            const unitPrice = product.hasDiscount ? product.price - product.discount : product.price;
            row.total = row.kilos * unitPrice;
            row.income = row.total - row.costs;

            document.getElementById(`row-total-${idx}`).textContent = `$${this.formatNumber(row.total)}`;
            document.getElementById(`row-income-${idx}`).textContent = `$${this.formatNumber(row.income)}`;
        }
        this.saveLocalData();
    },

    renderAdminProducts() {
        const container = document.getElementById('admin-product-list');
        container.innerHTML = this.state.products.map(p => `
            <div class="glass" style="padding:15px; margin-bottom:10px; display:grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap:15px; align-items:end;">
                <div style="grid-column: span 5; display:flex; gap:10px; align-items:center; border-bottom: 1px solid var(--glass-border); padding-bottom:10px; margin-bottom:5px;">
                    <img src="${p.img}" style="width:40px; height:40px; border-radius:8px; object-fit:cover;" onerror="this.src='https://via.placeholder.com/40/000/fff?text=?'">
                    <strong>${p.name}</strong> (${p.weight})
                </div>
                <div>
                    <label style="font-size:0.7rem; color:var(--text-muted)">Imagen (URL)</label>
                    <input type="text" value="${p.img}" onchange="app.updateProduct(${p.id}, 'img', this.value)">
                </div>
                <div>
                    <label style="font-size:0.7rem; color:var(--text-muted)">Precio ($)</label>
                    <input type="number" value="${p.price}" onchange="app.updateProduct(${p.id}, 'price', this.value)">
                </div>
                <div>
                    <label style="font-size:0.7rem; color:var(--text-muted)">Desc. ($)</label>
                    <input type="number" value="${p.discount}" onchange="app.updateProduct(${p.id}, 'discount', this.value)">
                </div>
                <div>
                    <label style="font-size:0.7rem; color:var(--text-muted)">Activo</label>
                    <input type="checkbox" ${p.hasDiscount ? 'checked' : ''} onchange="app.updateProduct(${p.id}, 'hasDiscount', this.checked)">
                </div>
            </div>
        `).join('');
    },

    updateProduct(id, field, value) {
        const prod = this.state.products.find(p => p.id === id);
        if (prod) {
            prod[field] = (typeof value === 'boolean') ? value : parseFloat(value);
            this.saveLocalData();
            this.renderCatalog(); // Real-time update
        }
    },

    saveDailySales() {
        const date = new Date().toLocaleDateString();
        const shift = document.getElementById('shift-select').value;

        // Calculate totals for logging
        const dayTotal = this.state.dailySales.reduce((sum, r) => sum + r.total, 0);
        const dayIncome = this.state.dailySales.reduce((sum, r) => sum + r.income, 0);

        if (dayTotal === 0) {
            alert('No hay ventas para guardar');
            return;
        }

        const logEntry = {
            date,
            shift,
            total: dayTotal,
            income: dayIncome,
            rows: JSON.parse(JSON.stringify(this.state.dailySales.filter(r => r.total > 0)))
        };

        this.state.history.push(logEntry);

        // Update product activity volume
        logEntry.rows.forEach(r => {
            const p = this.state.products.find(prod => prod.id == r.prodId);
            if (p) p.sales += r.qty;
        });

        // Reset sheet
        this.state.dailySales = Array(50).fill().map(() => ({ prodId: 0, qty: 0, kilos: 0, costs: 0, total: 0, income: 0 }));
        this.saveLocalData();
        this.renderDailySheet();
        alert('Día guardado con éxito');
    },

    renderHistory() {
        const container = document.getElementById('history-container');
        if (this.state.history.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px;">No hay historial disponible.</p>';
            return;
        }
        container.innerHTML = this.state.history.map((h, idx) => `
            <div class="glass" style="padding:15px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <strong>${h.date} - ${h.shift.toUpperCase()}</strong>
                    <span style="color:var(--success)">+$${this.formatNumber(h.income)}</span>
                </div>
                <div style="font-size:0.8rem; color:var(--text-muted)">
                    Total Venta: $${this.formatNumber(h.total)} | Filas: ${h.rows.length}
                </div>
            </div>
        `).join('');
    },

    updateDateDisplay() {
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },

    updateLogoUI() {
        const logo = document.getElementById('header-logo');
        if (logo) {
            logo.src = this.state.settings.logoUrl || 'berryslr_logo.png';
            logo.onerror = () => { logo.src = 'https://via.placeholder.com/150?text=BerrysLr'; };
        }
        const configInput = document.getElementById('config-logo-url');
        if (configInput) {
            configInput.value = this.state.settings.logoUrl === 'berryslr_logo.png' ? '' : this.state.settings.logoUrl;
        }
    },

    updateLogoFromConfig() {
        const url = document.getElementById('config-logo-url').value.trim();
        this.state.settings.logoUrl = url || 'berryslr_logo.png';
        this.saveLocalData();
        this.updateLogoUI();
        alert('Logo actualizado');
    },

    updateSetting(key, value) {
        this.state.settings[key] = value;
        this.saveLocalData();
    },

    formatNumber(n) {
        return new Intl.NumberFormat('es-AR').format(n);
    },

    addToCart(id) {
        const p = this.state.products.find(prod => prod.id === id);
        alert(`¡${p.name} añadido! (Simulación de carrito)`);
    },

    resetData() {
        if (confirm('¿Estás seguro de que quieres borrar todos los datos e historial?')) {
            localStorage.removeItem('berryslr_data');
            location.reload();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
