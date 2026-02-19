import React from 'react';

export default function BalancePanel({ balances, currentUser, groupCurrency, onSettle }) {
  if (!balances) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
      <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
    </div>
  );

  const { memberBalances, simplifiedDebts } = balances;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Net balances */}
      <div>
        <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
          Net Balances
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {memberBalances?.map(({ user, balance }) => {
            const isMe = user._id === currentUser?._id;
            const isPositive = balance > 0.01;
            const isNegative = balance < -0.01;

            return (
              <div key={user._id} className="card" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${isPositive ? '#22c55e' : isNegative ? '#ef4444' : 'var(--border)'}` }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                      {user.name} {isMe && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(you)</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {isPositive ? 'Gets back' : isNegative ? 'Owes' : 'Settled up'}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'Syne', fontWeight: 700, fontSize: 16,
                    color: isPositive ? '#22c55e' : isNegative ? '#ef4444' : 'var(--text-muted)'
                  }}>
                    {isPositive ? '+' : ''}{groupCurrency} {balance.toFixed(2)}
                  </div>
                </div>

                {/* Balance bar */}
                <div style={{ marginTop: 10, height: 4, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (Math.abs(balance) / (Math.max(...memberBalances.map(b => Math.abs(b.balance))) || 1)) * 100)}%`,
                    background: isPositive ? '#22c55e' : isNegative ? '#ef4444' : 'var(--border)',
                    borderRadius: 2, transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simplified debts */}
      {simplifiedDebts?.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
            Suggested Settlements
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans', fontWeight: 400, marginLeft: 8 }}>
              Minimized transactions
            </span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {simplifiedDebts.map((debt, i) => {
              const iAmPayer = debt.from._id === currentUser?._id;
              const iAmReceiver = debt.to._id === currentUser?._id;

              return (
                <div key={i} className="card" style={{
                  padding: '16px 20px',
                  border: (iAmPayer || iAmReceiver) ? '1px solid rgba(108,99,255,0.3)' : '1px solid var(--border)',
                  background: (iAmPayer || iAmReceiver) ? 'rgba(108,99,255,0.05)' : 'var(--bg-card)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={debt.from.avatar} alt={debt.from.name} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                        <strong style={{ color: iAmPayer ? 'var(--accent-light)' : 'var(--text-primary)' }}>
                          {iAmPayer ? 'You' : debt.from.name}
                        </strong>
                        {' → '}
                        <strong style={{ color: iAmReceiver ? '#22c55e' : 'var(--text-primary)' }}>
                          {iAmReceiver ? 'You' : debt.to.name}
                        </strong>
                      </div>
                    </div>
                    <img src={debt.to.avatar} alt={debt.to.name} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                    <div style={{ textAlign: 'right', marginLeft: 8 }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {groupCurrency} {debt.amount.toFixed(2)}
                      </div>
                      {(iAmPayer || iAmReceiver) && (
                        <button
                          onClick={() => onSettle(debt)}
                          style={{
                            padding: '5px 14px', background: 'var(--accent)', color: 'white',
                            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                            fontWeight: 600, fontFamily: 'DM Sans'
                          }}
                        >
                          Settle
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {simplifiedDebts?.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 16
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#22c55e', marginBottom: 4 }}>All settled up!</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No outstanding debts in this group.</div>
        </div>
      )}
    </div>
  );
}
