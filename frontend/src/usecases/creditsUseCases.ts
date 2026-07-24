import {
  getCreditsBalance,
  getTransactionHistory,
  listTransactions,
} from '../services/creditsService';
import type { CreditsBalance, Transaction } from '../services/creditsService';

export function fetchCreditsBalance(accessToken?: string): Promise<CreditsBalance> {
  return getCreditsBalance(accessToken);
}

export function fetchTransactions(accessToken?: string): Promise<Transaction[]> {
  return listTransactions(accessToken);
}

export function fetchTransactionHistory(
  limit?: number,
  offset?: number,
  accessToken?: string
): Promise<{ transactions: Transaction[]; total: number }> {
  return getTransactionHistory(limit, offset, accessToken);
}
