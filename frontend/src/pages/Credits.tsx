import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchCreditsBalance, fetchTransactions } from '../usecases/creditsUseCases';
import type { CreditsBalance, Transaction } from '../services/creditsService';

export default function Credits(): JSX.Element {
  const auth = useAuth();

  const { data: balance, isLoading: balanceLoading, isError: balanceError, error: balanceErrorMsg } = useQuery<CreditsBalance>({
    queryKey: ['creditsBalance'],
    queryFn: () => fetchCreditsBalance(auth.accessToken ?? undefined),
    enabled: Boolean(auth.accessToken),
  });

  const { data: transactions, isLoading: transactionsLoading, isError: transactionsError, error: transactionsErrorMsg } = useQuery<Transaction[]>({
    queryKey: ['creditsTransactions'],
    queryFn: () => fetchTransactions(auth.accessToken ?? undefined),
    enabled: Boolean(auth.accessToken),
  });

  const transactionsList = useMemo(() => transactions ?? [], [transactions]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return '↑';
      case 'spend':
        return '↓';
      case 'refund':
        return '↶';
      default:
        return '⚙';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
        return 'text-green-600';
      case 'spend':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Balance Card */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <h1 className="text-3xl font-semibold text-slate-950">Credits</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          View your skill exchange credits and transaction history.
        </p>

        {balanceLoading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
            Loading balance...
          </div>
        )}

        {balanceError && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {(balanceErrorMsg as Error)?.message || 'Unable to load balance.'}
          </div>
        )}

        {balance && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Available Balance</p>
              <p className="mt-2 text-4xl font-bold text-teal-950">{balance.balance}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Total Earned</p>
              <p className="mt-2 text-4xl font-bold text-green-950">{balance.total_earned}</p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Total Spent</p>
              <p className="mt-2 text-4xl font-bold text-red-950">{balance.total_spent}</p>
            </div>
          </div>
        )}
      </section>

      {/* Transaction History */}
      <section className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-950">Transaction history</h2>
          <p className="mt-1 text-sm text-slate-600">
            {transactionsList.length} transaction{transactionsList.length === 1 ? '' : 's'}
          </p>
        </div>

        {transactionsLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
            Loading transactions...
          </div>
        )}

        {transactionsError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
            {(transactionsErrorMsg as Error)?.message || 'Unable to load transactions.'}
          </div>
        )}

        {transactionsList.length === 0 && !transactionsLoading && !transactionsError && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
            You have not completed any transactions yet.{' '}
            <Link to="/skills" className="font-semibold text-teal-950 hover:text-teal-700">
              Browse skills
            </Link>
            {' '}to get started.
          </div>
        )}

        <div className="space-y-3">
          {transactionsList.map((transaction) => (
            <article key={transaction.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-4">
                  <div className={`text-2xl ${getTransactionColor(transaction.transaction_type)}`}>
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-950 capitalize">
                      {transaction.transaction_type} credits
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">{transaction.description}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                    {transaction.transaction_type === 'spend' || transaction.transaction_type === 'refund' ? '−' : '+'}
                    {transaction.amount}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Back Link */}
      <div className="mt-8">
        <Link to="/" className="text-sm font-semibold text-teal-950 transition hover:text-teal-700">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
