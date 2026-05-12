import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useMenuStore } from '../store';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const { menuData, updateItem, deleteItem, addItem } = useMenuStore();
  const [editingItem, setEditingItem] = useState(null); // { catIdx, item }
  const [addingTo, setAddingTo] = useState(null); // catIdx
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', pieces: '', image: '' });
  const [activeTab, setActiveTab] = useState(0);

  if (!user || !isAdmin) {
    return (
      <div className="admin-denied">
        <h2>Zugriff verweigert</h2>
        <p>Du hast keine Berechtigung, diese Seite zu besuchen.</p>
        <button onClick={() => navigate('/')}>← Zurück</button>
      </div>
    );
  }

  const handleSaveEdit = () => {
    if (!editingItem) return;
    updateItem(editingItem.catIdx, editingItem.item.id, editingItem.item);
    toast.success('Artikel aktualisiert');
    setEditingItem(null);
  };

  const handleDelete = (catIdx, itemId, itemName) => {
    if (window.confirm(`"${itemName}" wirklich löschen?`)) {
      deleteItem(catIdx, itemId);
      toast.success('Artikel gelöscht');
    }
  };

  const handleAddItem = (catIdx) => {
    if (!newItem.name || !newItem.price) {
      toast.error('Name und Preis sind Pflichtfelder');
      return;
    }
    addItem(catIdx, {
      id: `custom-${Date.now()}`,
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      pieces: newItem.pieces,
      image: newItem.image || 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400&h=300',
      imageFallback: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400&h=300',
    });
    toast.success('Artikel hinzugefügt');
    setNewItem({ name: '', description: '', price: '', pieces: '', image: '' });
    setAddingTo(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div className="admin-user">
          <img src={user.photoURL || ''} alt="" className="admin-avatar" />
          <span>{user.displayName}</span>
          <button className="btn-back-admin" onClick={() => navigate('/')}>← Zur Website</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
          🍣 Speisekarte
        </button>
        <button className={`admin-tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
          💳 Stripe Dashboard
        </button>
      </div>

      {activeTab === 0 && (
        <div className="admin-menu-editor">
          {menuData.map((category, catIdx) => (
            <div key={catIdx} className="admin-category">
              <div className="admin-cat-header">
                <h3>{category.category}</h3>
                <button className="btn-add-new" onClick={() => setAddingTo(catIdx)}>+ Artikel hinzufügen</button>
              </div>

              {/* Add new item form */}
              {addingTo === catIdx && (
                <div className="admin-add-form">
                  <h4>Neuer Artikel</h4>
                  <div className="admin-form-grid">
                    <input placeholder="Name *" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                    <input placeholder="Preis (€) *" type="number" step="0.01" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
                    <input placeholder="Beschreibung" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                    <input placeholder="Stück (z.B. 8 stück)" value={newItem.pieces} onChange={(e) => setNewItem({ ...newItem, pieces: e.target.value })} />
                    <input placeholder="Bild-URL" value={newItem.image} onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} className="full-width" />
                  </div>
                  {newItem.image && (
                    <div className="admin-img-preview">
                      <img src={newItem.image} alt="Vorschau" />
                    </div>
                  )}
                  <div className="admin-form-actions">
                    <button className="btn-save" onClick={() => handleAddItem(catIdx)}>Speichern</button>
                    <button className="btn-cancel" onClick={() => setAddingTo(null)}>Abbrechen</button>
                  </div>
                </div>
              )}

              {/* Items table */}
              <div className="admin-items-table">
                {category.items.map((item) => (
                  <div key={item.id} className="admin-item-row">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="admin-item-img"
                      onError={(e) => { e.target.src = item.imageFallback || ''; }}
                    />
                    {editingItem?.item.id === item.id && editingItem?.catIdx === catIdx ? (
                      <div className="admin-edit-form">
                        <input
                          value={editingItem.item.name}
                          onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, name: e.target.value } })}
                          placeholder="Name"
                        />
                        <input
                          value={editingItem.item.description}
                          onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, description: e.target.value } })}
                          placeholder="Beschreibung"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={editingItem.item.price}
                          onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, price: parseFloat(e.target.value) } })}
                          placeholder="Preis"
                        />
                        <input
                          value={editingItem.item.image}
                          onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, image: e.target.value } })}
                          placeholder="Bild-URL"
                        />
                        {editingItem.item.image && (
                          <div className="admin-img-preview">
                            <img src={editingItem.item.image} alt="Vorschau" />
                          </div>
                        )}
                        <div className="admin-form-actions">
                          <button className="btn-save" onClick={handleSaveEdit}>Speichern</button>
                          <button className="btn-cancel" onClick={() => setEditingItem(null)}>Abbrechen</button>
                        </div>
                      </div>
                    ) : (
                      <div className="admin-item-info">
                        <strong>{item.name}</strong>
                        <span>{item.description}</span>
                        <span className="admin-item-price">{item.price.toFixed(2)} €</span>
                      </div>
                    )}
                    <div className="admin-item-actions">
                      <button
                        className="btn-edit"
                        onClick={() => setEditingItem({ catIdx, item: { ...item } })}
                      >
                        ✏ Bearbeiten
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(catIdx, item.id, item.name)}
                      >
                        🗑 Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 1 && (
        <div className="admin-stripe">
          <h2>Stripe Dashboard</h2>
          <p>Verwalte deine Zahlungen direkt im Stripe Dashboard:</p>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-stripe-dashboard"
          >
            Stripe Dashboard öffnen ↗
          </a>
          <div className="stripe-info">
            <h3>Stripe Integration Status</h3>
            <div className="stripe-status-item">
              <span className={import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'status-ok' : 'status-warn'}>
                {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? '✓' : '⚠'}
              </span>
              <span>Stripe Publishable Key: {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Konfiguriert' : 'Nicht konfiguriert (Demo-Modus)'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
