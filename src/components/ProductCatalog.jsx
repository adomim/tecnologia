import React from 'react';

const ProductCatalog = ({ products, onAddToCart }) => {
  const getIndicatorClass = (sales) => {
    if (sales > 50) return 'indicator-green';
    if (sales > 20) return 'indicator-orange';
    return 'indicator-red';
  };

  return (
    <div className="animate-up">
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }} className="gradient-text">Nuestra Fruta</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Seleccionada y congelada en su punto justo.</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '30px' 
      }}>
        {products.map(product => (
          <div key={product.id} className="glass glass-hover" style={{ overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={product.img || 'https://via.placeholder.com/400x300?text=BerrysLr'} 
                alt={product.name} 
                style={{ width: '100%', height: '220px', objectFit: 'cover' }}
              />
              <div style={{ 
                position: 'absolute', 
                top: '15px', 
                right: '15px', 
                padding: '6px 12px', 
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.8rem'
              }}>
                <span className={`indicator ${getIndicatorClass(product.sales || 0)}`}></span>
                {product.weight}
              </div>
            </div>

            <div style={{ padding: '25px' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>{product.name}</h3>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ${(product.hasDiscount ? product.price - product.discount : product.price).toLocaleString()}
                </span>
                {product.hasDiscount && (
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1rem' }}>
                    ${product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => onAddToCart(product)}
              >
                <i className="fa-solid fa-cart-plus"></i> Añadir al Carrito
              </button>
              
              {product.hasDiscount && (
                <div style={{ 
                  marginTop: '15px', 
                  textAlign: 'center', 
                  fontSize: '0.85rem', 
                  color: 'var(--success)',
                  fontWeight: 600
                }}>
                  ¡Oferta Especial Activada!
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog;
