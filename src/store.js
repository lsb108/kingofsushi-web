import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  couponCode: '',
  couponDiscount: 0,
  couponApplied: false,

  addItem: (item) => {
    const { items } = get();
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...items, { ...item, quantity: 1 }] });
    }
  },

  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  updateQuantity: (id, delta) => {
    const { items } = get();
    const updated = items
      .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
      .filter((i) => i.quantity > 0);
    set({ items: updated });
  },

  clearCart: () => set({ items: [], couponCode: '', couponDiscount: 0, couponApplied: false }),

  setCoupon: (code) => set({ couponCode: code }),

  applyCoupon: () => {
    const { couponCode } = get();
    const validCoupons = {
      SUSHI10: 10,
      WELCOME15: 15,
      FRIENDS20: 20,
    };
    const discount = validCoupons[couponCode.toUpperCase()];
    if (discount) {
      set({ couponDiscount: discount, couponApplied: true });
      return { success: true, discount };
    }
    return { success: false };
  },

  getSubtotal: () => {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const { couponDiscount } = get();
    return subtotal * (1 - couponDiscount / 100);
  },

  getCount: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));

export const useAuthStore = create((set) => ({
  user: null,
  isAdmin: false,
  setUser: (user) => {
    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e) => e.trim());
    const isAdmin = user ? adminEmails.includes(user.email) : false;
    set({ user, isAdmin });
  },
  logout: () => set({ user: null, isAdmin: false }),
}));

export const useMenuStore = create((set, get) => ({
  menuData: [],
  setMenuData: (data) => set({ menuData: data }),
  updateItem: (categoryIdx, itemId, updates) => {
    const { menuData } = get();
    const updated = menuData.map((cat, idx) => {
      if (idx !== categoryIdx) return cat;
      return {
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      };
    });
    set({ menuData: updated });
  },
  deleteItem: (categoryIdx, itemId) => {
    const { menuData } = get();
    const updated = menuData.map((cat, idx) => {
      if (idx !== categoryIdx) return cat;
      return { ...cat, items: cat.items.filter((item) => item.id !== itemId) };
    });
    set({ menuData: updated });
  },
  addItem: (categoryIdx, newItem) => {
    const { menuData } = get();
    const updated = menuData.map((cat, idx) => {
      if (idx !== categoryIdx) return cat;
      return { ...cat, items: [...cat.items, newItem] };
    });
    set({ menuData: updated });
  },
}));
