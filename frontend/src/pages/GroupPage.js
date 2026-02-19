import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import ExpenseList from '../components/expenses/ExpenseList';
import BalancePanel from '../components/groups/BalancePanel';
import MembersPanel from '../components/groups/MembersPanel';
import AddMemberModal from '../components/groups/AddMemberModal';
import SettleModal from '../components/settlements/SettleModal';
import { joinGroup, leaveGroup, getSocket } from '../services/socket';

const TABS = ['Expenses', 'Balances', 'Members'];

export default function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [settleDebt, setSettleDebt] = useState(null);

  const loadGroup = useCallback(async () => {
    try {
      const [groupRes, expRes, balRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/expenses/group/${id}`),
        api.get(`/groups/${id}/balances`)
      ]);
      setGroup(groupRes.data.group);
      setExpenses(expRes.data.expenses);
      setBalances(balRes.data);
    } catch (e) {
      toast.error('Failed to load group');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadGroup();
    joinGroup(id);

    const socket = getSocket();
    if (socket) {
      socket.on('expense-added', (exp) => setExpenses(prev => [exp, ...prev]));
      socket.on('expense-deleted', ({ id: expId }) => setExpenses(prev => prev.filter(e => e._id !== expId)));
      socket.on('settlement-created', () => loadGroup());
    }

    return () => {
      leaveGroup(id);
      if (socket) {
        socket.off('expense-added');
        socket.off('expense-deleted');
        socket.off('settlement-created');
      }
    };
  }, [id, loadGroup]);

  const handleExpenseAdded = (expense) => {
    setExpenses(prev => [expense, ...prev]);
    setShowAddExpense(false);
    loadGroup(); // refresh balances
    toast.success('Expense added!');
  };

  const handleExpenseDeleted = async (expId) => {
    try {
      await api.delete(`/expenses/${expId}`);
      setExpenses(prev => prev.filter(e => e._id !== expId));
      loadGroup();
      toast.success('Expense deleted');
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const handleMemberAdded = (updatedGroup) => {
    setGroup(updatedGroup);
    setShowAddMember(false);
    toast.success('Member added!');
  };

  const handleSettled = () => {
    setShowSettle(false);
    setSettleDebt(null);
    loadGroup();
    toast.success('Settlement recorded!');
  };

  const handleSettle = (debt) => {
    setSettleDebt(debt);
    setShowSettle(true);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (!group) return null;

  const myBalance = balances?.memberBalances?.find(b => b.user._id === user?._id);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => navigate('/groups')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← Back to Groups
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(108,99,255,0.4), rgba(244,114,182,0.3))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28
            }}>
              {group.icon}
            </div>
            <div>
              <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{group.name}</h1>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {group.members.length} members · {group.currency}
                </span>
                {myBalance && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: myBalance.balance >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: myBalance.balance >= 0 ? '#22c55e' : '#ef4444'
                  }}>
                    {myBalance.balance >= 0 ? `You're owed $${myBalance.balance.toFixed(2)}` : `You owe $${Math.abs(myBalance.balance).toFixed(2)}`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-ghost" onClick={() => setShowAddMember(true)} style={{ fontSize: 14 }}>
              + Add Member
            </button>
            <button className="btn-ghost" onClick={() => { setSettleDebt(null); setShowSettle(true); }} style={{ fontSize: 14 }}>
              ⇌ Settle Up
            </button>
            <button className="btn-primary" onClick={() => setShowAddExpense(true)} style={{ fontSize: 14 }}>
              + Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px', borderRadius: 9, border: 'none',
              background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Expenses' && (
        <ExpenseList
          expenses={expenses}
          currentUser={user}
          onDelete={handleExpenseDeleted}
        />
      )}
      {activeTab === 'Balances' && (
        <BalancePanel
          balances={balances}
          currentUser={user}
          groupCurrency={group.currency}
          onSettle={handleSettle}
        />
      )}
      {activeTab === 'Members' && (
        <MembersPanel
          group={group}
          currentUser={user}
          onGroupUpdate={setGroup}
        />
      )}

      {/* Modals */}
      {showAddExpense && (
        <AddExpenseModal
          group={group}
          onClose={() => setShowAddExpense(false)}
          onAdded={handleExpenseAdded}
        />
      )}
      {showAddMember && (
        <AddMemberModal
          groupId={group._id}
          onClose={() => setShowAddMember(false)}
          onAdded={handleMemberAdded}
        />
      )}
      {showSettle && (
        <SettleModal
          group={group}
          preselectedDebt={settleDebt}
          currentUser={user}
          onClose={() => { setShowSettle(false); setSettleDebt(null); }}
          onSettled={handleSettled}
        />
      )}
    </div>
  );
}
