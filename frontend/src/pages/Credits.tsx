import { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, ExternalLink, RotateCcw, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchCreditsBalance, fetchTransactions } from '../usecases/creditsUseCases';
import CreditChip from '../components/CreditChip';
import type { CreditsBalance, Transaction } from '../services/creditsService';

const transactionIcons: Record<string, typeof ArrowUpRight> = {
  earn: ArrowUpRight,
  spend: ArrowDownRight,
  refund: RotateCcw,
  adjustment: ShieldCheck,
};

const transactionLabels: Record<string, string> = {
  earn: 'Earned',
  spend: 'Spent',
  refund: 'Refunded',
  adjustment: 'Adjusted',
};

const transactionStyles: Record<string, string> = {
  earn: 'text-emerald-700 bg-emerald-100',
  spend: 'text-rose-700 bg-rose-100',
  refund: 'text-sky-700 bg-sky-100',
  adjustment: 'text-slate-700 bg-slate-100',
};

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
  const sortedTransactions = useMemo(
    () => [...transactionsList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [transactionsList],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Credits account</p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-950">Your marketplace balance</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Track every credit earned, spent, and refunded while keeping bookkeeping clear for your next skill swap.
              </p>
            </div>
            <div className="hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:block">
              <p className="font-semibold text-slate-950">Quick balance</p>
              {balance ? (
                <p className="mt-3 flex items-center gap-2 text-2xl font-semibold text-slate-950">
                  <CreditChip value={balance.balance} />
                </p>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Balances refresh automatically.</p>
              )}
            </div>
          </div>

          {balanceLoading && (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">Loading balance...</div>
          )}

          {balanceError && (
            <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
              {(balanceErrorMsg as Error)?.message || 'Unable to load balance.'}
            </div>
          )}

          {balance && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-teal-200 bg-teal-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Available</p>
                <div className="mt-4 flex items-center gap-3">
                  <CreditChip value={balance.balance} />
                  <span className="text-3xl font-semibold text-teal-950">credits</span>
                </div>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Earned</p>
                <p className="mt-4 text-3xl font-semibold text-emerald-950">{balance.total_earned}</p>
              </div>
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">Spent</p>
                <p className="mt-4 text-3xl font-semibold text-rose-950">{balance.total_spent}</p>
              </div>
            </div>
          )}
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">Credit guide</p>
          <h2 className="mt-4 text-2xl font-semibold">How credits work</h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-200">
            <li>• Credits are reserved when a booking is confirmed, then released when the session is completed.</li>
            <li>• Earn credits for teaching and spend credits when you learn.</li>
            <li>• All transaction history is kept for auditing and dispute resolution.</li>
          </ul>
          <p className="mt-6 text-sm text-slate-300">
            If you have questions, visit your profile or contact support through the app.
          </p>
        </aside>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Transaction history</h2>
            <p className="mt-1 text-sm text-slate-600">
              {transactionsList.length} transaction{transactionsList.length === 1 ? '' : 's'}
            </p>
          </div>
          <Link
            to="/skills"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-950 transition hover:text-teal-700"
          >
            Browse skills
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {transactionsLoading && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-700">Loading transactions...</div>
        )}

        {transactionsError && (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700">
            {(transactionsErrorMsg as Error)?.message || 'Unable to load transactions.'}
          </div>
        )}

        {transactionsList.length === 0 && !transactionsLoading && !transactionsError && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-700">
            You have not completed any transactions yet.{' '}
            <Link to="/skills" className="font-semibold text-teal-950 hover:text-teal-700">
              Browse skills
            </Link>{' '}
            to start earning and spending credits.
          </div>
        )}

        <div className="mt-6 space-y-4">
          {sortedTransactions.map((transaction) => {
            const Icon = transactionIcons[transaction.transaction_type] ?? ShieldCheck;
            const statusLabel = transactionLabels[transaction.transaction_type] ?? 'Transaction';
            const statusStyle = transactionStyles[transaction.transaction_type] ?? transactionStyles.adjustment;
            const isNegative = transaction.transaction_type === 'spend';
            const transactionSign = isNegative ? '-' : '+';
            const transactionDate = new Date(transaction.created_at);

            return (
              <article key={transaction.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl ${statusStyle}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{statusLabel}</p>
                      <p className="mt-1 text-sm text-slate-600">{transaction.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${isNegative ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {transactionSign}
                      {transaction.amount}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {transactionDate.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      • {transactionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
