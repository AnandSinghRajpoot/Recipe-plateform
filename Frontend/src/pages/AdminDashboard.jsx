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
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    SUSPENDED: 'bg-amber-100 text-amber-700 border-amber-200',
    BANNED: 'bg-red-100 text-red-700 border-red-200',
    DELETED: 'bg-surface-container text-on-surface-variant border-outline-variant/30',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    INVESTIGATING: 'bg-blue-100 text-blue-700 border-blue-200',
    RESOLVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    DISMISSED: 'bg-surface-container text-on-surface-variant border-outline-variant/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${colors[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-6 botanical-shadow border border-outline-variant/30">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} shadow-lg shadow-black/5`}>
      <span className="material-symbols-outlined text-white">{icon}</span>
    </div>
    <p className="text-3xl font-headline font-black text-on-surface">{value ?? '—'}</p>
    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-1">{label}</p>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [recipePage, setRecipePage] = useState(0);
  const [recipeQuery, setRecipeQuery] = useState('');
  const [hasMoreRecipes, setHasMoreRecipes] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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

  const fetchModerated = async (page = 0, append = false, query = recipeQuery) => {
    if (page === 0) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const res = await apiClient.get(`/admin/recipes?page=${page}&size=10&query=${encodeURIComponent(query)}`);
      const data = res.data.data;
      const content = data.content || [];
      
      if (append) {
        setRecipes(prev => [...prev, ...content]);
      } else {
        setRecipes(content);
      }
      
      setHasMoreRecipes(!data.last);
      setRecipePage(page);
    } catch (e) { toast.error('Failed to load recipes'); }
    finally { 
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (q) => {
    setRecipeQuery(q);
    fetchModerated(0, false, q);
  };

  useEffect(() => { 
    if (activeTab === 'recipes') {
      fetchModerated(0, false);
    } 
  }, [activeTab]);

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
      fetchModerated(0, false);
    } catch (e) { toast.error('Moderation failed'); }
  };

  const allUsers = users.filter(u => u.role === 'USER' || u.role === 'CHEF');
  const chefs = users.filter(u => u.role === 'CHEF');
  const regularUsers = users.filter(u => u.role === 'USER');

  return (
    <div className="min-h-screen bg-surface text-on-surface flex font-body">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-surface-container-low border-r border-outline-variant/30 flex flex-col">
        <div className="p-6 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl vitality-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-lg">shield_person</span>
            </div>
            <div>
              <p className="font-headline font-black text-sm text-on-surface">RecipeHub</p>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}>
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-outline-variant/30">
          <button onClick={() => { localStorage.clear(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-error hover:bg-error/5 transition-all">
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto custom-scrollbar">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-headline font-black text-on-surface">{TABS.find(t => t.id === activeTab)?.label}</h1>
        </header>

        <div className="p-8">
          {loading && activeTab === 'overview' ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in-up">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon="group" label="Total Users" value={stats.totalUsers} color="bg-blue-500" />
                    <StatCard icon="menu_book" label="Total Recipes" value={stats.totalRecipes} color="bg-primary" />
                    <StatCard icon="flag" label="Pending Reports" value={stats.pendingReports} color="bg-amber-500" />
                    <StatCard icon="block" label="Moderated Recipes" value={stats.moderatedRecipes} color="bg-red-500" />
                  </div>
                  <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 botanical-shadow">
                    <h2 className="font-headline font-black text-lg mb-4 text-on-surface">Recent Reports</h2>
                    <div className="space-y-3">
                      {reports.filter(r => r.status === 'PENDING').slice(0, 5).map(r => (
                        <div key={r.id} className="flex items-center justify-between py-3 border-b border-surface-container last:border-0">
                          <div>
                            <p className="font-bold text-sm text-on-surface">{r.reason?.substring(0, 60)}...</p>
                            <p className="text-xs text-on-surface-variant">{r.type} #{r.targetId} · by User #{r.reporter?.id}</p>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      ))}
                      {reports.filter(r => r.status === 'PENDING').length === 0 && (
                        <p className="text-on-surface-variant text-sm text-center py-4">No pending reports</p>
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
                <RecipeModerationTab 
                  recipes={recipes} 
                  onAction={setModal} 
                  onRefresh={() => fetchModerated(0, false)} 
                  hasMore={hasMoreRecipes}
                  onLoadMore={() => fetchModerated(recipePage + 1, true)}
                  loadingMore={loadingMore}
                  query={recipeQuery}
                  onSearch={handleSearch}
                />
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
    <div className="bg-white rounded-2xl border border-outline-variant/30 animate-fade-in-up botanical-shadow overflow-hidden">
      <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/50">
        <h2 className="font-headline font-black text-lg text-on-surface">{title} <span className="text-on-surface-variant font-medium">({users.length})</span></h2>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-surface border border-outline-variant/50 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 w-48 font-medium"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low/30 border-b border-outline-variant/30">
              {['User', 'Email', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.profilePhoto || generalProfilePic} className="w-9 h-9 rounded-full object-cover border border-outline-variant/30" onError={e => e.target.src = generalProfilePic} />
                    <div>
                      <p className="font-bold text-sm text-on-surface">{user.name}</p>
                      <p className="text-[10px] text-on-surface-variant font-black">#{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{user.email}</td>
                <td className="px-6 py-4"><StatusBadge status={user.status || 'ACTIVE'} /></td>
                <td className="px-6 py-4 text-xs text-on-surface-variant font-medium">{user.createdAt?.substring(0, 10)}</td>
                <td className="px-6 py-4">
                  <button onClick={() => onAction({ type: 'user', data: user })}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant text-sm font-medium">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecipeModerationTab({ recipes, onAction, onRefresh, hasMore, onLoadMore, loadingMore, query, onSearch }) {
  const [filter, setFilter] = React.useState('ALL');
  const filtered = filter === 'ALL' ? recipes
    : filter === 'MODERATED' ? recipes.filter(r => r.isModerated)
    : recipes.filter(r => !r.isModerated);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">search</span>
          <input 
            type="text"
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search recipes by title..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant/30 rounded-2xl text-sm focus:outline-none focus:border-primary/30 botanical-shadow transition-all font-medium"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {[['ALL', recipes.length], ['LIVE', recipes.filter(r => !r.isModerated).length], ['MODERATED', recipes.filter(r => r.isModerated).length]].map(([f, count]) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                filter === f ? 'vitality-gradient text-white border-transparent shadow-md' : 'bg-white text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-low'
              }`}>
              {f} ({count})
            </button>
          ))}
        </div>
        <button onClick={onRefresh} className="px-4 py-2 bg-white text-on-surface rounded-xl text-xs font-black border border-outline-variant/30 hover:bg-surface-container-low transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">refresh</span>Refresh
        </button>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-12 text-center botanical-shadow">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">check_circle</span>
          <p className="mt-3 text-on-surface-variant font-medium">No recipes in this category</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden botanical-shadow">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low/30 border-b border-outline-variant/30">
                {['Recipe', 'Author', 'Status', 'Reason', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm text-on-surface">{r.title}</p>
                    <p className="text-[10px] text-on-surface-variant font-black">#{r.id} · {r.isPublished ? 'Published' : 'Draft'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{r.user?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    {r.isModerated
                      ? <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700">Taken Down</span>
                      : <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">Live</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-xs text-error font-medium max-w-xs">{r.moderationReason || '—'}</td>
                  <td className="px-6 py-4">
                    {r.isModerated ? (
                      <button onClick={() => onAction({ type: 'recipe', data: r })}
                        className="px-3 py-1.5 bg-emerald-600/10 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white border border-emerald-500/30 transition-all">
                        Restore
                      </button>
                    ) : (
                      <button onClick={() => onAction({ type: 'recipe_takedown', data: r })}
                        className="px-3 py-1.5 bg-red-600/10 text-red-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white border border-red-500/30 transition-all">
                        Take Down
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && (
            <div className="p-8 flex justify-center bg-surface-container-low/20 border-t border-outline-variant/30">
              <button 
                onClick={onLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-white text-primary border-2 border-primary/20 rounded-2xl font-black text-sm hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-2"
              >
                {loadingMore ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-sm">expand_more</span>}
                Load More Recipes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportsTab({ reports, onUpdate }) {
  const [filter, setFilter] = useState('PENDING');
  const filtered = filter === 'ALL' ? reports : reports.filter(r => r.status === filter);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex gap-2">
        {['ALL', 'PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
              filter === s ? 'vitality-gradient text-white border-transparent shadow-md' : 'bg-white text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-low'
            }`}>
            {s}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden botanical-shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low/30 border-b border-outline-variant/30">
              {['Reporter', 'Type', 'Reason', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-primary/5 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-on-surface">{r.reporter?.name || 'Anonymous'}</p>
                  <p className="text-[10px] text-on-surface-variant font-black">ID: #{r.reporter?.id || '?'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-surface-container rounded-lg text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{r.type}</span>
                  <span className="ml-1 text-[10px] text-on-surface-variant/50 font-black">#{r.targetId}</span>
                </td>
                <td className="px-6 py-4 text-xs text-on-surface-variant font-medium max-w-xs">{r.reason?.substring(0, 80)}{r.reason?.length > 80 ? '...' : ''}</td>
                <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {r.status === 'PENDING' && (
                      <button onClick={() => onUpdate(r.id, 'INVESTIGATING')}
                        className="px-2 py-1 bg-blue-600/10 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all">
                        Investigate
                      </button>
                    )}
                    {(r.status === 'PENDING' || r.status === 'INVESTIGATING') && (
                      <>
                        <button onClick={() => onUpdate(r.id, 'RESOLVED')}
                          className="px-2 py-1 bg-emerald-600/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all">
                          Resolve
                        </button>
                        <button onClick={() => onUpdate(r.id, 'DISMISSED')}
                          className="px-2 py-1 bg-surface-container text-on-surface-variant rounded-lg text-[10px] font-black uppercase tracking-widest border border-outline-variant/30 hover:bg-surface-container-highest transition-all">
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant font-medium">No {filter !== 'ALL' ? filter.toLowerCase() : ''} reports</td></tr>
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
  const [error, setError] = useState('');

  if (!modal) return null;

  if (modal.type === 'recipe_takedown') {
    const r = modal.data;
    return (
      <div className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl border border-outline-variant/30 p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
          <h2 className="font-headline font-black text-2xl mb-1 text-error">Take Down Recipe</h2>
          <p className="text-on-surface-variant font-medium text-sm mb-6"><span className="text-on-surface font-black">{r.title}</span> will be unpublished and hidden from all users.</p>
          <div className="space-y-1 mb-6">
            <textarea
              value={moderateReason}
              onChange={e => { setModerateReason(e.target.value); setError(''); }}
              placeholder="Reason for taking down (e.g. false info, inappropriate content)..."
              rows={3}
              className={`w-full bg-surface-container-low border-2 rounded-2xl px-4 py-3 text-sm focus:outline-none resize-none text-on-surface font-bold placeholder-on-surface-variant/40 ${error ? 'border-error/50' : 'border-transparent focus:border-error/30'}`}
            />
            {error && <p className="text-[10px] font-black text-error uppercase tracking-widest ml-2">{error}</p>}
          </div>
          <div className="space-y-3">
            <button onClick={() => { if (!moderateReason.trim()) { setError('Please provide a reason for moderation'); return; } onModerate(r.id, true, moderateReason); }}
              className="w-full py-4 bg-error text-white rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-lg shadow-error/20">
              Confirm Take Down
            </button>
            <button onClick={onClose} className="w-full py-4 bg-surface-container-low text-on-surface-variant rounded-2xl font-black hover:bg-surface-container transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal.type === 'recipe') {
    const r = modal.data;
    return (
      <div className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl border border-outline-variant/30 p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
          <h2 className="font-headline font-black text-2xl mb-1 text-on-surface">Restore Recipe</h2>
          <p className="text-on-surface-variant font-medium text-sm mb-8">Restore <span className="text-on-surface font-black">{r.title}</span> to the platform.</p>
          <div className="space-y-3">
            <button onClick={() => onModerate(r.id, false, '')}
              className="w-full py-4 vitality-gradient text-white rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-lg shadow-primary/20">
              Restore Recipe
            </button>
            <button onClick={onClose} className="w-full py-4 bg-surface-container-low text-on-surface-variant rounded-2xl font-black hover:bg-surface-container transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal.type === 'user') {
    const u = modal.data;
    const suspendUntil = new Date(Date.now() + suspendDays * 86400000).toISOString();
    return (
      <div className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl border border-outline-variant/30 p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
          <div className="flex items-center gap-4 mb-8">
            <img src={u.profilePhoto || generalProfilePic} className="w-16 h-16 rounded-full object-cover border-2 border-surface-container" onError={e => e.target.src = generalProfilePic} />
            <div>
              <h2 className="font-headline font-black text-xl text-on-surface">{u.name}</h2>
              <p className="text-on-surface-variant font-medium text-sm mb-1">{u.email}</p>
              <StatusBadge status={u.status || 'ACTIVE'} />
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2 mb-2 block">Suspension Duration</label>
              <select value={suspendDays} onChange={e => setSuspendDays(Number(e.target.value))}
                className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary/30">
                {[1,3,7,14,30].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onUserStatus(u.id, 'SUSPENDED', suspendUntil)}
                className="py-3 bg-amber-100 text-amber-700 rounded-2xl font-black text-sm hover:bg-amber-200 transition-all border border-amber-200">
                Suspend
              </button>
              <button onClick={() => onUserStatus(u.id, 'BANNED', null)}
                className="py-3 bg-red-100 text-red-700 rounded-2xl font-black text-sm hover:bg-red-200 transition-all border border-red-200">
                Ban User
              </button>
            </div>
            {u.status !== 'ACTIVE' && (
              <button onClick={() => onUserStatus(u.id, 'ACTIVE', null)}
                className="w-full py-3 bg-emerald-100 text-emerald-700 rounded-2xl font-black text-sm hover:bg-emerald-200 transition-all border border-emerald-200">
                Reactivate Account
              </button>
            )}
            <button onClick={() => { if (confirm(`Delete ${u.name}? This is irreversible.`)) onDeleteUser(u.id); }}
              className="w-full py-3 text-error font-black text-sm hover:bg-error/5 rounded-2xl transition-all">
              Delete Account Permanently
            </button>
            <button onClick={onClose} className="w-full py-3 bg-surface-container-low text-on-surface-variant rounded-2xl font-black text-sm hover:bg-surface-container transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
