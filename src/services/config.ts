import { getAuth } from 'firebase/auth';

const API_URL = 'http://localhost:3000/api';

export interface Subcategory {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface CreateSubcategoryDto {
  id: string;
  nombre: string;
  descripcion?: string;
}

export type UpdateSubcategoryDto = Partial<Omit<CreateSubcategoryDto, 'id'>>;

export interface Category {
  id: string;
  nombre: string;
  icono?: string;
  color?: string;
  descripcion?: string;
  subcategorias?: Subcategory[];
}

export interface CreateCategoryDto {
  id: string;
  nombre: string;
  icono?: string;
  color?: string;
  descripcion?: string;
}

export type UpdateCategoryDto = Partial<Omit<CreateCategoryDto, 'id'>>;

export interface PaymentMethod {
  id: string;
  nombre: string;
  icono?: string;
  descripcion?: string;
}

export interface CreatePaymentMethodDto {
  id: string;
  nombre: string;
  icono?: string;
  descripcion?: string;
}

export type UpdatePaymentMethodDto = Partial<Omit<CreatePaymentMethodDto, 'id'>>;

export interface Currency {
  id: string;
  codigoISO: string;
  simbolo: string;
  nombre: string;
  icono?: string;
}

export interface CreateCurrencyDto {
  codigoISO: string;
  simbolo: string;
  nombre: string;
  icono?: string;
}

export type UpdateCurrencyDto = Partial<CreateCurrencyDto>;

export interface Shortcut {
  id: string;
  nombre: string; // max 15 chars - button label
  categoria?: string;
  subcategoria?: string;
  monto?: number;
  moneda?: string;
  metodoPago?: string;
  descripcion?: string;
  tags?: string[];
  recurrente?: boolean;
}

export interface CreateShortcutDto {
  nombre: string;
  categoria?: string;
  subcategoria?: string;
  monto?: number;
  moneda?: string;
  metodoPago?: string;
  descripcion?: string;
  tags?: string[];
  recurrente?: boolean;
}

export type UpdateShortcutDto = Partial<CreateShortcutDto>;

const getHeaders = async () => {
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const ConfigService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/categories`, { headers });
    if (!response.ok) throw new Error('Error fetching categories');
    return response.json();
  },

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creating category');
    return response.json();
  },

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error updating category');
    return response.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error deleting category');
  },

  // Subcategories
  async createSubcategory(categoryId: string, data: CreateSubcategoryDto): Promise<Subcategory> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/categories/${categoryId}/subcategories`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creating subcategory');
    return response.json();
  },

  async updateSubcategory(categoryId: string, subcategoryId: string, data: UpdateSubcategoryDto): Promise<Subcategory> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/categories/${categoryId}/subcategories/${subcategoryId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error updating subcategory');
    return response.json();
  },

  async deleteSubcategory(categoryId: string, subcategoryId: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/categories/${categoryId}/subcategories/${subcategoryId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error deleting subcategory');
  },

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/payment-methods`, { headers });
    if (!response.ok) throw new Error('Error fetching payment methods');
    return response.json();
  },

  async createPaymentMethod(data: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/payment-methods`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creating payment method');
    return response.json();
  },

  async updatePaymentMethod(id: string, data: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/payment-methods/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error updating payment method');
    return response.json();
  },

  async deletePaymentMethod(id: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/payment-methods/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error deleting payment method');
  },

  // Currencies
  async getCurrencies(): Promise<Currency[]> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/currencies`, { headers });
    if (!response.ok) throw new Error('Error fetching currencies');
    return response.json();
  },

  async createCurrency(data: CreateCurrencyDto): Promise<Currency> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/currencies`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creating currency');
    return response.json();
  },

  async updateCurrency(id: string, data: UpdateCurrencyDto): Promise<Currency> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/currencies/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error updating currency');
    return response.json();
  },

  async deleteCurrency(id: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/currencies/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error deleting currency');
  },

  // Shortcuts
  async getShortcuts(): Promise<Shortcut[]> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shortcuts`, { headers });
    if (!response.ok) throw new Error('Error fetching shortcuts');
    return response.json();
  },

  async createShortcut(data: CreateShortcutDto): Promise<Shortcut> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shortcuts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creating shortcut');
    return response.json();
  },

  async updateShortcut(id: string, data: UpdateShortcutDto): Promise<Shortcut> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shortcuts/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error updating shortcut');
    return response.json();
  },

  async deleteShortcut(id: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shortcuts/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error deleting shortcut');
  },
};
