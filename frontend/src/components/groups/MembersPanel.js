import React from 'react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MembersPanel({ group, currentUser, onGroupUpdate }) {
  const isAdmin = group.members.find(m => m.user._id === currentUser?._id)?.role === 'admin';

  const handleRemove = async (userId, name) => {
    if (!window.confirm(`Remove ${name} from the group?`)) return;
    try {
      const { data } = await api.delete(`/groups/${group._id}/members/${userId}`);
      onGroupUpdate(data.group);
      toast.success(`${name} removed`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {group.members.map(member => {
        const isMe = member.user._id === currentUser?._id;
        const isCreator = group.createdBy._id === member.user._id;

        return (
          <div key={member.user._id} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src={member.user.avatar}
                alt={member.user.name}
                style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--border)', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                    {member.user.name} {isMe && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>(you)</span>}
                  </span>
                  {member.role === 'admin' && (
                    <span className="badge badge-accent">Admin</span>
                  )}
                  {isCreator && !isAdmin && (
                    <span className="badge badge-info">Creator</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {member.user.email} · Joined {format(new Date(member.joinedAt), 'MMM yyyy')}
                </div>
              </div>

              {isAdmin && !isMe && !isCreator && (
                <button
                  onClick={() => handleRemove(member.user._id, member.user.name)}
                  style={{
                    padding: '6px 14px', background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8,
                    color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    fontFamily: 'DM Sans', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
