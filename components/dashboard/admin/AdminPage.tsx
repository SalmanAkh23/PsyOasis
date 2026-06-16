import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getSystemStats,
  getAllUsers,
  getAllPsychologists,
  getAllAppointments,
  getRecentActivity,
  assignPsychologistRole,
  updateUserRole,
  toggleUserStatus,
  deletePsychologist,
  createArticle,
  updateArticle,
  deleteArticle,
  getMonthlyBookings,
} from '../../../lib/db-admin';
import { getArticles } from '../../../lib/db';
import AdminLayout from './Layout';

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
}

function formatFee(fee: string): string {
  const num = parseInt((fee || '0').replace(/[^0-9]/g, '')) || 0;
  if (num >= 1000000) return `Rp${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `Rp${(num / 1000).toFixed(0)}k`;
  return `Rp${num}`;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'admin': return { bg: 'bg-primary-container/20 text-primary border border-primary/20', icon: 'shield' };
    case 'psychologist': return { bg: 'bg-secondary-container/30 text-secondary border border-secondary/20', icon: 'psychology' };
    default: return { bg: 'bg-surface-container-high text-on-surface border border-outline-variant/20', icon: 'person' };
  }
}

function getStatusBadge(status: string) {
  if (status === 'active') return { bg: 'bg-secondary-fixed/30 text-secondary border border-secondary/20', dot: 'bg-secondary' };
  if (status === 'pending') return { bg: 'bg-tertiary-fixed/30 text-tertiary border border-tertiary/20', dot: 'bg-tertiary' };
  return { bg: 'bg-surface-variant text-on-surface-variant border border-outline-variant/20', dot: '' };
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth() as any;
  const { secret } = router.query;
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [psychologists, setPsychologists] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [assignEmail, setAssignEmail] = useState('');
  const [assignMsg, setAssignMsg] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);

  const [articleForm, setArticleForm] = useState({ title: '', content: '', excerpt: '', category: 'article', authorName: '' });
  const [articleSaving, setArticleSaving] = useState(false);
  const [artikelItems, setArtikelItems] = useState<any[]>([]);
  const [monthlyCounts, setMonthlyCounts] = useState([0, 0, 0, 0, 0, 0]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!loading && !user) router.replace('/admin/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      router.replace('/admin/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (secret && typeof secret === 'string' && process.env.NEXT_PUBLIC_ADMIN_SECRET && secret !== process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      router.replace('/404');
    }
  }, [secret, router]);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [s, u, p, a, act, arts, monthly] = await Promise.all([
        getSystemStats(),
        getAllUsers(),
        getAllPsychologists(),
        getAllAppointments(),
        getRecentActivity(),
        getArticles().catch(() => []),
        getMonthlyBookings(),
      ]);
      setStats(s);
      setUsers(u as any[]);
      setPsychologists(p as any[]);
      setAppointments(a as any[]);
      setActivities(act as any[]);
      setArticles(arts as any[]);
      setMonthlyCounts(monthly.monthlyCounts);
      setMonthlyRevenue(monthly.monthlyRevenue);
    } catch (err) {
      console.error('Admin data error:', err);
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin' && secret) loadData();
  }, [user, secret, loadData]);

  useEffect(() => {
    setArtikelItems(articles);
  }, [articles]);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignMsg('');
    setAssignLoading(true);
    try {
      await assignPsychologistRole(assignEmail);
      setAssignMsg(`Success! Role assigned to ${assignEmail}`);
      setAssignEmail('');
      loadData();
    } catch (err: any) {
      setAssignMsg(err.message || 'Failed to assign role');
    }
    setAssignLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = await toggleUserStatus(userId, currentStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  const handleDeletePsychologist = async (id: string) => {
    if (!window.confirm('Remove psychologist role from this user?')) return;
    try {
      await deletePsychologist(id);
      loadData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setArticleSaving(true);
    try {
      await createArticle({ ...articleForm, authorName: articleForm.authorName || user?.displayName || 'Admin' });
      setArticleForm({ title: '', content: '', excerpt: '', category: 'article', authorName: '' });
      loadData();
      alert('Article created successfully!');
    } catch (err) {
      console.error('Article create error:', err);
    }
    setArticleSaving(false);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await deleteArticle(id);
      loadData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading || !user || !secret) return null;
  if (user.role !== 'admin') return null;

  const basePath = `/admin/${secret}`;
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    const matchSearch = !q || (u.displayName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });
  const pageSize = 10;
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const pagedUsers = filteredUsers.slice((userPage - 1) * pageSize, userPage * pageSize);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUserManagement();
      case 'psikolog': return renderPsychologistManagement();
      case 'appointments': return renderAppointments();
      case 'content': return renderContentCMS();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  const goTo = (section: string) => {
    setActiveSection(section);
    const url = section === 'dashboard' ? basePath : `${basePath}/${section}`;
    window.history.pushState(null, '', url);
  };

  function renderDashboard() {
    const totalMonthly = monthlyCounts.reduce((a: number, b: number) => a + b, 0);
    const sessionGrowth = totalMonthly > 0 && monthlyCounts.slice(0, 3).reduce((a: number, b: number) => a + b, 0) > 0
      ? `${((monthlyCounts.slice(3).reduce((a: number, b: number) => a + b, 0) / monthlyCounts.slice(0, 3).reduce((a: number, b: number) => a + b, 0) - 1) * 100).toFixed(0)}%`
      : null;
    const revenueGrowth = monthlyRevenue.slice(3).reduce((a: number, b: number) => a + b, 0) > 0 && monthlyRevenue.slice(0, 3).reduce((a: number, b: number) => a + b, 0) > 0
      ? `${((monthlyRevenue.slice(3).reduce((a: number, b: number) => a + b, 0) / monthlyRevenue.slice(0, 3).reduce((a: number, b: number) => a + b, 0) - 1) * 100).toFixed(0)}%`
      : null;

    const statCards = [
      { icon: 'group', label: 'Total Users', value: dataLoading ? '-' : (stats.totalUsers || 0).toLocaleString(), growth: null, color: 'border-l-primary', iconBg: 'bg-primary-fixed/30 text-primary' },
      { icon: 'psychology', label: 'Active Psychologists', value: dataLoading ? '-' : (stats.activePsikolog || 0), growth: null, color: 'border-l-secondary', iconBg: 'bg-secondary-fixed/30 text-secondary' },
      { icon: 'forum', label: 'Ongoing Sessions (This Month)', value: dataLoading ? '-' : (stats.ongoingSessions || 0), growth: sessionGrowth ? `+${sessionGrowth}` : null, color: 'border-l-tertiary', iconBg: 'bg-tertiary-fixed/30 text-tertiary' },
      { icon: 'payments', label: 'Total Revenue (This Month)', value: dataLoading ? '-' : `Rp${(stats.totalRevenue || 0).toLocaleString('id-ID')}`, growth: revenueGrowth ? `+${revenueGrowth}` : null, color: 'border-l-primary-container', iconBg: 'bg-primary-container/10 text-primary-container' },
    ];

    return (
      <>
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-1">Dashboard Admin</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">System Overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
          {statCards.map((card, i) => (
            <div key={i} className={`bg-surface-container-lowest rounded-xl p-stack-md shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between h-32 ${card.color} border-l-4`}>
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                  <span className="material-symbols-outlined fill">{card.icon}</span>
                </div>
                {!dataLoading && (
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-secondary">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    {card.growth}
                  </span>
                )}
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">{card.label}</p>
                <p className="font-headline-md text-headline-md text-on-surface">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter">
          <div className="lg:col-span-3 grid grid-rows-[auto_1fr] gap-gutter">
            <div className="bg-surface-container-lowest rounded-xl p-stack-md shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex items-center justify-between">
              <div>
                <h3 className="font-label-md text-label-md text-primary font-bold mb-1">Quick Actions</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Rapid system administration tasks.</p>
              </div>
              <button
                onClick={() => goTo('users')}
                className="bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-lg transition-all duration-200 active:scale-[0.98] flex items-center gap-2 hover:bg-primary-container shadow-sm"
              >
                <span className="material-symbols-outlined">person_add</span>
                Assign Clinician Role
              </button>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-stack-md shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col h-full min-h-[300px]">
              <div className="flex justify-between items-center mb-stack-md">
                <h3 className="font-label-md text-label-md text-primary font-bold">System Health</h3>
                <div className="flex gap-3">
                  <span className="font-caption text-caption px-3 py-1.5 bg-primary-fixed/30 text-primary rounded-md font-semibold cursor-pointer">Traffic</span>
                  <span className="font-caption text-caption px-3 py-1.5 text-on-surface-variant rounded-md cursor-pointer hover:bg-surface-container-low">Sessions</span>
                </div>
              </div>
              <div className="flex-1 relative rounded-lg bg-surface-bright border border-outline-variant/20 overflow-hidden flex items-end px-4 pt-8 gap-2">
                {dataLoading ? (
                  <div className="w-full flex items-center justify-center text-on-surface-variant h-full">Loading...</div>
                ) : (
                  monthlyCounts.map((h: number, i: number) => {
                    const maxVal = Math.max(...monthlyCounts, 1);
                    const pct = (h / maxVal) * 100;
                    return (
                      <div
                        key={i}
                        className={`w-full rounded-t-sm relative group cursor-pointer transition-all duration-200 hover:opacity-80 ${
                          i === monthlyCounts.length - 1 ? 'bg-primary' : 'bg-primary-fixed/40 hover:bg-primary-fixed'
                        }`}
                        style={{ height: `${Math.max(pct, 1)}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 font-caption text-caption bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded transition-opacity whitespace-nowrap">
                          {h}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-stack-md shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col h-full">
            <div className="flex justify-between items-center mb-stack-md border-b border-outline-variant/20 pb-3">
              <h3 className="font-label-md text-label-md text-primary font-bold">Recent Activity</h3>
              <button onClick={loadData} className="text-primary hover:bg-surface-container-low p-1.5 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-lg">refresh</span>
              </button>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 flex-1">
              {dataLoading ? (
                <div className="text-on-surface-variant text-sm py-4 text-center">Loading...</div>
              ) : activities.length === 0 ? (
                <div className="text-on-surface-variant text-sm py-4 text-center">No recent activity</div>
              ) : (
                activities.slice(0, 6).map((act, i) => (
                  <div key={`${act.id}-${i}`} className="flex gap-3 items-start relative before:absolute before:left-[11px] before:top-6 before:bottom-[-20px] before:w-[2px] before:bg-outline-variant/20 last:before:hidden">
                    <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center shrink-0 z-10 border-2 border-surface-container-lowest">
                      <div className={`w-2 h-2 rounded-full ${act.color || 'bg-primary'}`}></div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-label-sm text-label-sm text-on-surface truncate">{act.title}</p>
                      <p className="font-caption text-caption text-on-surface-variant">{act.description} • {formatTimeAgo(act.time)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderUserManagement() {
    return (
      <>
        <header className="flex justify-between items-end">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Manajemen Pengguna</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Manage users, roles, and permissions.</p>
          </div>
        </header>

        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="flex items-start gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined fill">badge</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-primary mb-1">Assign Clinician Role</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Promote an existing user to a Psychologist role. They will gain access to the clinical dashboard and appointment management features.
              </p>
            </div>
          </div>
          <form onSubmit={handleAssignRole} className="flex flex-col sm:flex-row gap-4 items-end mt-6 relative z-10 max-w-3xl">
            <div className="flex-1 w-full">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2" htmlFor="clinician-email">User Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">mail</span>
                <input
                  id="clinician-email"
                  type="email"
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="doctor.name@example.com"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={assignLoading}
              className="w-full sm:w-auto px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">person_add</span>
              {assignLoading ? 'Assigning...' : 'Assign Role'}
            </button>
          </form>
          {assignMsg && (
            <div className={`mt-4 p-3 rounded-lg font-label-sm text-label-sm relative z-10 ${
              assignMsg.includes('Success') ? 'bg-secondary-container/30 text-secondary border border-secondary/20' : 'bg-error-container/30 text-on-error-container border border-error/20'
            }`}>
              {assignMsg}
            </div>
          )}
        </section>

        <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/20 flex flex-col">
          <div className="p-6 border-b border-outline-variant/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Direktori Pengguna</h3>
              <span className="bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-md font-caption text-caption">{users.length} Total</span>
            </div>
            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant/30 rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="Search name or email..."
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setUserPage(1); }}
                className="bg-surface border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2.5 font-label-md text-label-md focus:ring-2 focus:ring-primary/30 outline-none"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="psychologist">Psychologist</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-outline-variant/20">
                  <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                  <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                  <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Current Role</th>
                  <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {dataLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Loading users...</td></tr>
                ) : pagedUsers.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">No users found</td></tr>
                ) : (
                  pagedUsers.map((u) => {
                    const initials = getInitials(u.displayName);
                    const roleBadge = getRoleBadge(u.role || 'user');
                    const statusBadge = getStatusBadge(u.status || 'active');
                    const isAdmin = u.role === 'admin';
                    return (
                      <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary font-bold text-lg">{initials}</div>
                            <div>
                              <p className="font-label-md text-label-md text-on-surface font-semibold">{u.displayName}</p>
                              <p className="font-caption text-caption text-on-surface-variant">{u.createdAt ? `Joined ${formatTimeAgo(u.createdAt)}` : ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{u.email}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-caption text-caption ${roleBadge.bg}`}>
                            <span className="material-symbols-outlined text-[14px]">{roleBadge.icon}</span>
                            {(u.role || 'user').charAt(0).toUpperCase() + (u.role || 'user').slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption ${statusBadge.bg}`}>
                            {statusBadge.dot && <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>}
                            {(u.status || 'active').charAt(0).toUpperCase() + (u.status || 'active').slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-1">
                            {!isAdmin && (
                              <>
                                <button
                                  onClick={() => handleRoleChange(u.id, u.role === 'psychologist' ? 'user' : 'psychologist')}
                                  className="p-2 text-outline hover:text-primary hover:bg-primary-fixed/20 rounded-lg transition-colors"
                                  title="Toggle Psychologist Role"
                                >
                                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(u.id, u.status || 'active')}
                                  className="p-2 text-outline hover:text-primary hover:bg-primary-fixed/20 rounded-lg transition-colors"
                                  title="Toggle Status"
                                >
                                  <span className="material-symbols-outlined text-lg">{u.status === 'active' ? 'block' : 'check_circle'}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest rounded-b-xl">
            <span className="font-caption text-caption text-on-surface-variant">
              Showing {((userPage - 1) * pageSize) + 1} to {Math.min(userPage * pageSize, filteredUsers.length)} of {filteredUsers.length} entries
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setUserPage(p => Math.max(1, p - 1))}
                disabled={userPage <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (userPage <= 3) {
                  pageNum = i + 1;
                } else if (userPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = userPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setUserPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-label-sm transition-colors ${
                      userPage === pageNum ? 'bg-primary text-on-primary' : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setUserPage(p => Math.min(totalPages, p + 1))}
                disabled={userPage >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  function renderPsychologistManagement() {
    return (
      <>
        <header className="flex justify-between items-end">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Psychologist Management</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Manage registered psychologists.</p>
          </div>
        </header>

        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/20 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">Name</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">Email</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">Assigned</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {dataLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Loading...</td></tr>
              ) : psychologists.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">No psychologists assigned yet. Use User Management to assign roles.</td></tr>
              ) : (
                psychologists.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/40 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-fixed/30 flex items-center justify-center text-secondary font-bold text-lg">
                          {getInitials(p.name || p.displayName || 'Unknown')}
                        </div>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">{p.name || p.displayName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{p.email || '-'}</td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{p.assignedAt ? new Date(p.assignedAt).toLocaleDateString() : '-'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption border ${
                        p.status === 'active' ? 'bg-secondary-fixed/30 text-secondary border-secondary/20' : 'bg-surface-variant text-on-surface-variant border-outline-variant/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-secondary' : 'bg-outline'}`}></span>
                        {(p.status || 'active').charAt(0).toUpperCase() + (p.status || 'active').slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeletePsychologist(p.id)}
                        className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
                        title="Remove Psychologist Role"
                      >
                        <span className="material-symbols-outlined text-lg">person_remove</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  function renderAppointments() {
    return (
      <>
        <header className="flex justify-between items-end">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Appointments</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">View all platform appointments.</p>
          </div>
        </header>

        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/20 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">Patient</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">Psychologist</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">Date</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {dataLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Loading...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">No appointments yet</td></tr>
              ) : (
                appointments.slice(0, 50).map((a: any) => (
                  <tr key={a.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-4 px-6 font-label-md text-label-md text-on-surface">{a.userName || 'Unknown'}</td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{a.psychologistName || 'N/A'}</td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{a.date || '-'} {a.time || ''}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-lg font-caption text-caption font-semibold ${
                        a.status === 'selesai' || a.status === 'completed' ? 'bg-secondary-fixed/30 text-secondary border border-secondary/20' :
                        a.status === 'dikonfirmasi' || a.status === 'confirmed' ? 'bg-primary-fixed/30 text-primary border border-primary/20' :
                        a.status === 'dibatalkan' || a.status === 'cancelled' ? 'bg-error-container/30 text-on-error-container border border-error/20' :
                        'bg-surface-variant text-on-surface-variant border border-outline-variant/20'
                      }`}>
                        {a.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{a.fee ? formatFee(a.fee) : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  function renderContentCMS() {

    return (
      <>
        <header className="flex justify-between items-end">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Content CMS</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Manage articles and platform content.</p>
          </div>
        </header>

        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/20">
          <h3 className="font-headline-md text-headline-md text-primary mb-4">Create New Article</h3>
          <form onSubmit={handleCreateArticle} className="space-y-4 max-w-3xl">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Title</label>
              <input
                type="text"
                value={articleForm.title}
                onChange={(e) => setArticleForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Category</label>
                <select
                  value={articleForm.category}
                  onChange={(e) => setArticleForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                >
                  <option value="article">Article</option>
                  <option value="tips">Tips</option>
                  <option value="news">News</option>
                  <option value="research">Research</option>
                </select>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Author</label>
                <input
                  type="text"
                  value={articleForm.authorName}
                  onChange={(e) => setArticleForm(f => ({ ...f, authorName: e.target.value }))}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder={user?.displayName || 'Admin'}
                />
              </div>
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Excerpt</label>
              <textarea
                value={articleForm.excerpt}
                onChange={(e) => setArticleForm(f => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Content (HTML)</label>
              <textarea
                value={articleForm.content}
                onChange={(e) => setArticleForm(f => ({ ...f, content: e.target.value }))}
                rows={6}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none font-mono text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={articleSaving}
              className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {articleSaving ? 'Publishing...' : 'Publish Article'}
            </button>
          </form>
        </section>

        <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/20 overflow-x-auto">
          <div className="p-6 border-b border-outline-variant/20">
            <h3 className="font-headline-md text-headline-md text-on-surface">Published Articles ({artikelItems.length})</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">Title</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">Category</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">Date</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {artikelItems.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">No articles published yet</td></tr>
              ) : (
                artikelItems.map((a: any) => (
                  <tr key={a.id} className="hover:bg-surface-container-low/40 transition-colors group">
                    <td className="py-4 px-6 font-label-md text-label-md text-on-surface">{a.title}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-surface-container-high text-on-surface rounded-md font-caption text-caption border border-outline-variant/20">{a.category}</span>
                    </td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteArticle(a.id)}
                        className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
                        title="Delete Article"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <header className="flex justify-between items-end">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">System Settings</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Platform configuration.</p>
          </div>
        </header>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/20 space-y-6 max-w-2xl">
          <div>
            <h3 className="font-label-md text-label-md text-primary font-bold mb-4">Platform Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2.5 border-b border-outline-variant/10">
                <span className="font-body-md text-body-md text-on-surface-variant">Total Users</span>
                <span className="font-label-md text-label-md text-on-surface font-bold">{stats.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-outline-variant/10">
                <span className="font-body-md text-body-md text-on-surface-variant">Total Psychologists</span>
                <span className="font-label-md text-label-md text-on-surface font-bold">{stats.activePsikolog || 0}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-outline-variant/10">
                <span className="font-body-md text-body-md text-on-surface-variant">Total Appointments</span>
                <span className="font-label-md text-label-md text-on-surface font-bold">{stats.totalBookings || 0}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-outline-variant/10">
                <span className="font-body-md text-body-md text-on-surface-variant">Total Revenue</span>
                <span className="font-label-md text-label-md text-on-surface font-bold">Rp{(stats.totalRevenue || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20">
            <h3 className="font-label-md text-label-md text-primary font-bold mb-4">Admin Access</h3>
            <div className="bg-surface-container-low rounded-lg p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">Admin Portal URL</p>
              <code className="font-mono text-sm bg-inverse-surface text-inverse-on-surface px-3 py-2 rounded block break-all">
                {typeof window !== 'undefined' ? window.location.origin + '/admin/' + secret : '/admin/' + secret}
              </code>
              <p className="font-caption text-caption text-on-surface-variant mt-2">Keep this URL secret. Share only with authorized admins.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <AdminLayout
      title={activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
      secret={secret as string}
      onNavigate={goTo}
      activeSection={activeSection}
    >
      {renderSection()}

      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined.fill {
          font-variation-settings: 'FILL' 1;
        }
      `}</style>
    </AdminLayout>
  );
}
