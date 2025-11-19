import { getAuth } from 'firebase/auth';

const API_URL = 'http://localhost:3000/api';



export const ExpensesService = {
  async exportExpenses(month: number, year: number, format: 'json' | 'excel'): Promise<Blob> {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    
    const queryParams = new URLSearchParams({
      month: month.toString(),
      year: year.toString(),
      format,
    });

    const response = await fetch(`${API_URL}/expenses/export?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error exporting expenses');
    }

    return response.blob();
  },
};
