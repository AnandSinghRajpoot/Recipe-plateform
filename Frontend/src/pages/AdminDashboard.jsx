import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';
import generalProfilePic from '../assets/general-profile-pic.png';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'users', label: 'Users', icon: 'group' },
  { id: 'chefs', label: 'Chefs', icon: 'restaurant' },
  { id: 'recipes', label: 'Recipe Moderation', icon: 'menu_book' },
  { id: 'reports', label: 'Reports', icon: 'flag' },
];

const StatusBadge = ({ status }) => {
  const colors = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    SUSPENDED: 'bg-amber-100 text-amber-700',
    BANNED: 'bg-red-100 text-red-700',
    DELETED: 'bg-gray-100 text-gray-500',
    PENDING: 'bg-amber-100 text-amber-700',
    INVESTIGATING: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-emerald-100 text-emerald-700',
    DISMISSED: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colors[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      <span className="material-symbols-outlined text-white">{icon}</span>
    </div>
    <p className="text-3xl font-black text-gray-900">{value ?? '—'}</p>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type, data }

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token || role !== 'ADMIN') { navigate('/login'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/reports'),
      ]);
      setStats(statsRes.data.data || {});
      setUsers(usersRes.data.data || []);
      setReports(reportsRes.data.data || []);
    } catch (e) { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  const fetchModerated = async () => {
    try {
      const res = await apiClient.get('/admin/recipes');
      setRecipes(res.data.data || []);
    } catch (e) { toast.error('Failed to load recipes'); }
  };

  useEffect(() => { if (activeTab === 'recipes') fetchModerated(); }, [activeTab]);

  const handleUserStatus = async (userId, status, suspendedUntil) => {
    try {
      let url = `/admin/users/${userId}/status?status=${status}`;
      if (suspendedUntil) url += `&suspendedUntil=${suspendedUntil}`;
      await apiClient.patch(url);
      toast.success(`User ${status.toLowerCase()} successfully`);
      setModal(null);
      fetchAll();
    } catch (e) { toast.error('Action failed'); }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      setModal(null);
      fetchAll();
    } catch (e) { toast.error('Delete failed'); }
  };

  const handleReportStatus = async (reportId, status) => {
    try {
      await apiClient.patch(`/admin/reports/${reportId}/status?status=${status}`);
      toast.success('Report updated');
      fetchAll();
    } catch (e) { toast.error('Update failed'); }
  };

  const handleModerate = async (recipeId, moderated, reason) => {
    try {
      await apiClient.patch(`/admin/recipes/${recipeId}/moderate?moderated=${moderated}&reason=${encodeURIComponent(reason || '')}`);
      toast.success(moderated ? 'Recipe taken down' : 'Recipe restored');
      setModal(null);
      fetchModerated();
    } catch (e) { toast.error('Moderation failed'); }
  };

  const allUsers = users.filter(u => u.role === 'USER' || u.role === 'CHEF');
  const chefs = users.filter(u => u.role === 'CHEF');
  const regularUsers = users.filter(u => u.role === 'USER');

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#161b27] border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">shield_person</span>
            </div>
            <div>
              <p className="font-black text-sm">RecipeHub</p>
              <p className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}>
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => { localStorage.clear(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all">
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-[#0f1117]/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-black">{TABS.find(t => t.id === activeTab)?.label}</h1>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-violet-600/20 text-violet-400 rounded-full text-[10px] font-black uppercase border border-violet-500/30">
              Super Admin
            </span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">person</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          {loading && activeTab === 'overview' ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon="group" label="Total Users" value={stats.totalUsers} color="bg-blue-500" />
                    <StatCard icon="menu_book" label="Total Recipes" value={stats.totalRecipes} color="bg-emerald-500" />
                    <StatCard icon="flag" label="Pending Reports" value={stats.pendingReports} color="bg-amber-500" />
                    <StatCard icon="block" label="Moderated Recipes" value={stats.moderatedRecipes} color="bg-red-500" />
                  </div>
                  <div className="bg-[#161b27] rounded-2xl border border-white/5 p-6">
                    <h2 className="font-black text-lg mb-4">Recent Reports</h2>
                    <div className="space-y-3">
                      {reports.filter(r => r.status === 'PENDING').slice(0, 5).map(r => (
                        <div key={r.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                          <div>
                            <p className="font-bold text-sm">{r.reason?.substring(0, 60)}...</p>
                            <p className="text-xs text-gray-400">{r.type} #{r.targetId} · by User #{r.reporter?.id}</p>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      ))}
                      {reports.filter(r => r.status === 'PENDING').length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-4">No pending reports</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'users' && (
                <UserTable users={regularUsers} title="Regular Users" onAction={setModal} />
              )}

              {/* CHEFS TAB */}
              {activeTab === 'chefs' && (
                <UserTable users={chefs} title="Chefs" onAction={setModal} isChef />
              )}

              {/* RECIPE MODERATION */}
              {activeTab === 'recipes' && (
                <RecipeModerationTab recipes={recipes} onAction={setModal} onRefresh={fetchModerated} />
              )}

              {/* REPORTS */}
              {activeTab === 'reports' && (
                <ReportsTab reports={reports} onUpdate={handleReportStatus} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <ActionModal
          modal={modal}
          onClose={() => setModal(null)}
          onUserStatus={handleUserStatus}
          onDeleteUser={handleDeleteUser}
          onModerate={handleModerate}
        />
      )}
    </div>
  );
}

function UserTable({ users, title, onAction, isChef }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#161b27] rounded-2xl border border-white/5">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h2 className="font-black text-lg">{title} <span className="text-gray-500">({users.length})</span></h2>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-violet-500/50 w-48"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['User', 'Email', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.profilePhoto || generalProfilePic} className="w-9 h-9 rounded-full object-cover border border-white/10" onError={e => e.target.src = generalProfilePic} />
                    <div>
                      <p className="font-bold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">#{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                <td className="px-6 py-4"><StatusBadge status={user.status || 'ACTIVE'} /></td>
                <td className="px-6 py-4 text-xs text-gray-500">{user.createdAt?.substring(0, 10)}</td>
                <td className="px-6 py-4">
                  <button onClick={() => onAction({ type: 'user', data: user })}
                    className="px-3 py-1.5 bg-violet-600/20 text-violet-400 rounded-lg text-xs font-bold hover:bg-violet-600/30 transition-colors border border-violet-500/30">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecipeModerationTab({ recipes, onAction, onRefresh }) {
  const [filter, setFilter] = React.useState('ALL');
  const filtered = filter === 'ALL' ? recipes
    : filter === 'MODERATED' ? recipes.filter(r => r.isModerated)
    : recipes.filter(r => !r.isModerated);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[['ALL', recipes.length], ['LIVE', recipes.filter(r => !r.isModerated).length], ['MODERATED', recipes.filter(r => r.isModerated).length]].map(([f, count]) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                filter === f ? 'bg-violet-600/20 text-violet-400 border-violet-500/30' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
              }`}>
              {f} ({count})
            </button>
          ))}
        </div>
        <button onClick={onRefresh} className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors border border-white/10">
          <span className="material-symbols-outlined text-sm align-middle mr-1">refresh</span>Refresh
        </button>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-[#161b27] rounded-2xl border border-white/5 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-600">check_circle</span>
          <p className="mt-3 text-gray-500">No recipes in this category</p>
        </div>
      ) : (
        <div className="bg-[#161b27] rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Recipe', 'Author', 'Status', 'Reason', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm">{r.title}</p>
                    <p className="text-xs text-gray-500">#{r.id} · {r.isPublished ? 'Published' : 'Draft'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{r.user?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    {r.isModerated
                      ? <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700">Taken Down</span>
                      : <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">Live</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-xs text-red-400 max-w-xs">{r.moderationReason || '—'}</td>
                  <td className="px-6 py-4">
                    {r.isModerated ? (
                      <button onClick={() => onAction({ type: 'recipe', data: r })}
                        className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-600/30 border border-emerald-500/30">
                        Restore
                      </button>
                    ) : (
                      <button onClick={() => onAction({ type: 'recipe_takedown', data: r })}
                        className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-600/30 border border-red-500/30">
                        Take Down
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReportsTab({ reports, onUpdate }) {
  const [filter, setFilter] = useState('PENDING');
  const filtered = filter === 'ALL' ? reports : reports.filter(r => r.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['ALL', 'PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
              filter === s ? 'bg-violet-600/20 text-violet-400 border-violet-500/30' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
            }`}>
            {s}
          </button>
        ))}
      </div>
      <div className="bg-[#161b27] rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Reporter', 'Type', 'Reason', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-6 py-4 text-sm">{r.reporter?.name || 'Anonymous'}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-bold">{r.type}</span>
                  <span className="ml-1 text-xs text-gray-500">#{r.targetId}</span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-400 max-w-xs">{r.reason?.substring(0, 80)}{r.reason?.length > 80 ? '...' : ''}</td>
                <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {r.status === 'PENDING' && (
                      <button onClick={() => onUpdate(r.id, 'INVESTIGATING')}
                        className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/30 hover:bg-blue-600/30">
                        Investigate
                      </button>
                    )}
                    {(r.status === 'PENDING' || r.status === 'INVESTIGATING') && (
                      <>
                        <button onClick={() => onUpdate(r.id, 'RESOLVED')}
                          className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/30 hover:bg-emerald-600/30">
                          Resolve
                        </button>
                        <button onClick={() => onUpdate(r.id, 'DISMISSED')}
                          className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-lg text-xs font-bold border border-gray-500/30 hover:bg-gray-600/30">
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No {filter !== 'ALL' ? filter.toLowerCase() : ''} reports</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionModal({ modal, onClose, onUserStatus, onDeleteUser, onModerate }) {
  const [suspendDays, setSuspendDays] = useState(7);
  const [moderateReason, setModerateReason] = useState('');

  if (!modal) return null;

  if (modal.type === 'recipe_takedown') {
    const r = modal.data;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#161b27] rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
          <h2 className="font-black text-lg mb-1 text-red-400">Take Down Recipe</h2>
          <p className="text-gray-400 text-sm mb-4"><span className="text-white font-bold">{r.title}</span> will be unpublished and hidden from all users.</p>
          <textarea
            value={moderateReason}
            onChange={e => setModerateReason(e.target.value)}
            placeholder="Reason for taking down (e.g. false info, inappropriate content)..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 resize-none mb-4 text-white placeholder-gray-500"
          />
          <button onClick={() => { if (!moderateReason.trim()) { alert('Please provide a reason'); return; } onModerate(r.id, true, moderateReason); }}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition-colors mb-3">
            Confirm Take Down
          </button>
          <button onClick={onClose} className="w-full py-3 bg-white/5 text-gray-300 rounded-xl font-black hover:bg-white/10 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (modal.type === 'recipe') {
    const r = modal.data;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#161b27] rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
          <h2 className="font-black text-lg mb-1">Recipe: {r.title}</h2>
          <p className="text-gray-400 text-sm mb-6">Currently taken down. Restore or keep moderated.</p>
          <button onClick={() => onModerate(r.id, false, '')}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-colors mb-3">
            Restore Recipe (Unmoderate)
          </button>
          <button onClick={onClose} className="w-full py-3 bg-white/5 text-gray-300 rounded-xl font-black hover:bg-white/10 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (modal.type === 'user') {
    const u = modal.data;
    const suspendUntil = new Date(Date.now() + suspendDays * 86400000).toISOString();
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#161b27] rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <img src={u.profilePhoto || generalProfilePic} className="w-14 h-14 rounded-full object-cover border border-white/10" onError={e => e.target.src = generalProfilePic} />
            <div>
              <h2 className="font-black text-lg">{u.name}</h2>
              <p className="text-gray-400 text-sm">{u.email}</p>
              <StatusBadge status={u.status || 'ACTIVE'} />
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400 w-28">Suspend for:</label>
              <select value={suspendDays} onChange={e => setSuspendDays(Number(e.target.value))}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none">
                {[1,3,7,14,30].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <button onClick={() => onUserStatus(u.id, 'SUSPENDED', suspendUntil)}
              className="py-2.5 bg-amber-600/20 text-amber-400 rounded-xl font-black text-sm hover:bg-amber-600/30 border border-amber-500/30">
              Suspend
            </button>
            <button onClick={() => onUserStatus(u.id, 'BANNED', null)}
              className="py-2.5 bg-red-600/20 text-red-400 rounded-xl font-black text-sm hover:bg-red-600/30 border border-red-500/30">
              Ban Permanently
            </button>
          </div>
          {u.status !== 'ACTIVE' && (
            <button onClick={() => onUserStatus(u.id, 'ACTIVE', null)}
              className="w-full py-2.5 mb-3 bg-emerald-600/20 text-emerald-400 rounded-xl font-black text-sm hover:bg-emerald-600/30 border border-emerald-500/30">
              Reactivate Account
            </button>
          )}
          <button onClick={() => { if (confirm(`Delete ${u.name}? This is irreversible.`)) onDeleteUser(u.id); }}
            className="w-full py-2.5 mb-3 bg-red-700/20 text-red-300 rounded-xl font-black text-sm hover:bg-red-700/40 border border-red-600/30">
            Delete Account
          </button>
          <button onClick={onClose} className="w-full py-2.5 bg-white/5 text-gray-300 rounded-xl font-black text-sm hover:bg-white/10">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return null;
}
