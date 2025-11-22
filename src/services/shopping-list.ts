/**
 * Service for Shopping List feature
 * Uses localStorage for simplicity as requested, or Firebase if preferred.
 * Given the project structure, I'll use a mock service that saves to localStorage for now, 
 * as setting up a full Firebase collection might be out of scope for a quick feature unless specified.
 * However, the user asked for "crea una vista", implying a persistent feature.
 * I'll use localStorage for now to be safe and fast, as I don't have the backend API spec for shopping lists.
 */

import type { ShoppingList, CreateShoppingListDto, UpdateShoppingListDto, ShoppingListItem } from '../types/shopping-list';

const STORAGE_KEY = 'shopping_lists';

export const ShoppingListService = {
  getLists: (): ShoppingList[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getList: (id: string): ShoppingList | undefined => {
    const lists = ShoppingListService.getLists();
    return lists.find(l => l.id === id);
  },

  createList: (data: CreateShoppingListDto): ShoppingList => {
    const lists = ShoppingListService.getLists();
    const now = new Date();
    const newList: ShoppingList = {
      id: crypto.randomUUID(),
      name: data.name,
      budget: data.budget,
      items: [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      currency: data.currency || 'PEN',
    };
    lists.push(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    return newList;
  },

  updateList: (id: string, data: UpdateShoppingListDto): ShoppingList => {
    const lists = ShoppingListService.getLists();
    const index = lists.findIndex(l => l.id === id);
    if (index === -1) throw new Error('List not found');

    const updatedList = { ...lists[index], ...data, updatedAt: new Date() };
    lists[index] = updatedList;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    return updatedList;
  },

  deleteList: (id: string): void => {
    const lists = ShoppingListService.getLists();
    const filtered = lists.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  // Item management
  addItem: (listId: string, item: Omit<ShoppingListItem, 'id' | 'checked'>): ShoppingList => {
    const list = ShoppingListService.getList(listId);
    if (!list) throw new Error('List not found');

    const newItem: ShoppingListItem = {
      id: crypto.randomUUID(),
      checked: false,
      ...item,
    };

    const updatedItems = [...list.items, newItem];
    return ShoppingListService.updateList(listId, { items: updatedItems });
  },

  updateItem: (listId: string, itemId: string, data: Partial<ShoppingListItem>): ShoppingList => {
    const list = ShoppingListService.getList(listId);
    if (!list) throw new Error('List not found');

    const updatedItems = list.items.map(item => 
      item.id === itemId ? { ...item, ...data } : item
    );
    return ShoppingListService.updateList(listId, { items: updatedItems });
  },

  deleteItem: (listId: string, itemId: string): ShoppingList => {
    const list = ShoppingListService.getList(listId);
    if (!list) throw new Error('List not found');

    const updatedItems = list.items.filter(item => item.id !== itemId);
    return ShoppingListService.updateList(listId, { items: updatedItems });
  },
};
