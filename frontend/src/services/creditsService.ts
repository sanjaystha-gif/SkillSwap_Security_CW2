import apiClient from './apiClient';

export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: 'earn' | 'spend' | 'refund' | 'adjustment';
  amount: number;
  description: string;
  related_entity_id?: string;
  related_entity_type?: string;
  created_at: string;
}

export interface CreditsBalance {
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  balance: CreditsBalance;
}

export async function getCreditsBalance(accessToken?: string): Promise<CreditsBalance> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  return apiClient.request<CreditsBalance>('/credits/balance', {
    method: 'GET',
    headers,
  });
}

export async function listTransactions(accessToken?: string): Promise<Transaction[]> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  const response = await apiClient.request<TransactionsResponse>('/credits/transactions', {
    method: 'GET',
    headers,
  });
  return response.transactions;
}

export async function getTransactionHistory(
  limit?: number,
  offset?: number,
  accessToken?: string
): Promise<{ transactions: Transaction[]; total: number }> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const query = params.toString();
  const url = query ? `/credits/transactions?${query}` : '/credits/transactions';

  return apiClient.request<{ transactions: Transaction[]; total: number }>(url, {
    method: 'GET',
    headers,
  });
}
