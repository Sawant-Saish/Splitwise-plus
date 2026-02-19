import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import CreateGroupModal from '../components/groups/CreateGroupModal';

const GROUP_ICONS = { trip: '✈️', home: '🏠', couple: '💑', friends: '👥', work: '💼', other: '💸' };

const GroupCard = ({ group, onClick }) => (
  <div
    className="card card-hover"
    onClick={onClick}
    style={{ padding: 24, cursor: 'pointer' }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(244,114,182,0.2))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0
      }}>
        {group.icon || GROUP_ICONS[group.category] || '💸'}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>
          {group.name}
        </div>
        {group.description && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {group.description}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Member avatars */}
          <div style={{ display: 'flex' }}>
            {group.members.slice(0, 4).map((m, i) => (
              <img
                key={m.user._id}
                src={m.user.avatar}
                alt={m.user.name}
                title={m.user.name}
                style={{
                  width: 24, height: 24, borderRadius: '50%', objectFit: 'cover',
                  border: '2px solid var(--bg-card)',
                  marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i
                }}
              />
            ))}
            {group.members.length > 4 && (
              <div style={{
                width: 24, height: 24, borderRadius: '50%', marginLeft: -8,
                background: 'var(--bg-secondary)', border: '2px solid var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', zIndex: 0
              }}>+{group.members.length - 4}</div>
            )}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            · {group.category}
          </span>
        </div>
      </div>
      <span style={{ fontSize: 20, color: 'var(--text-muted)', alignSelf: 'center' }}>›</span>
    </div>
  </div>
);

export default function GroupsListPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const loadGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data.groups);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGroups(); }, []);

  const handleGroupCreated = (group) => {
    setGroups(prev => [group, ...prev]);
    setShowCreate(false);
    toast.success(`Group "${group.name}" created!`);
    navigate(`/groups/${group._id}`);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Groups</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Manage your expense groups</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span>
          New Group
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : groups.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 20, borderStyle: 'dashed'
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>◈</div>
          <h3 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No groups yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Create your first group to start splitting expenses</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>Create Group</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {groups.map(group => (
            <GroupCard
              key={group._id}
              group={group}
              onClick={() => navigate(`/groups/${group._id}`)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={handleGroupCreated}
        />
      )}
    </div>
  );
}
