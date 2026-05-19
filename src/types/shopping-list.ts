/**
 * Types for Shopping List feature
 */

export interface ShoppingListItem {
  id: string;
  name: string;
  amount?: number;
  quantity?: number; // e.g., "2" from "2x"
  unitPrice?: number; // Calculated if amount and quantity exist
  checked: boolean;
  category?: string;
  subcategory?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  budget?: number;
  items: ShoppingListItem[];
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  // Metadata
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category?: string;
  subcategory?: string;
  currency: string;
  paymentMethod?: string;
  /** Cuenta destino del gasto al finalizar la lista (multi-cuenta, Opción B). */
  accountId?: string;

  totalEstimated?: number; // Sum of amounts
  totalChecked?: number; // Sum of checked items' amounts

  // Nuevos campos de información tributaria
  description?: string;
  voucherType?: 'boleta' | 'factura' | 'recibo' | 'ticket';
  voucherNumber?: string;
  ruc?: string;
}

export interface CreateShoppingListDto {
  name: string;
  budget?: number;
  currency?: string;
}

export interface UpdateShoppingListDto {
  name?: string;
  budget?: number;
  status?: 'active' | 'completed' | 'archived';
  items?: ShoppingListItem[];
  date?: string;
  time?: string;
  category?: string;
  subcategory?: string;
  currency?: string;
  paymentMethod?: string;
  accountId?: string;
  // Nuevos campos de información tributaria
  description?: string;
  voucherType?: 'boleta' | 'factura' | 'recibo' | 'ticket';
  voucherNumber?: string;
  ruc?: string;
}
