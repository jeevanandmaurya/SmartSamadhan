import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth, useDatabase } from '../../contexts';
import { InteractiveMap } from '../../components/common';

function AdminDashboardHome() {
  const { user } = useAuth();
  const { getAllComplaints, updateComplaintStatus, database } = useDatabase();
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState({});
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMapInfo, setShowMapInfo] = useState(false);
  // Table UI state (mirror of user dashboard)
  const [sortConfig, setSortConfig] = useState({ key: 'dateSubmitted', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSortOption, setSelectedSortOption] = useState('date-newest');

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const complaints = await getAllComplaints();
      console.log('Admin Dashboard - All complaints loaded:', complaints.length);
      console.log('Admin Dashboard - Sample complaint:', complaints[0]);
      setAllComplaints(complaints);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  }, [getAllComplaints]);

  useEffect(() => { loadComplaints(); }, [loadComplaints]);

  // Real-time subscription for admins to see new complaints immediately
  useEffect(() => {
    if (!database?.supabase) return;
    try {
      const channel = database.supabase
        .channel('complaints-admin-feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, (payload) => {
          console.log('[AdminDashboardHome] Realtime complaint change:', payload.eventType, payload.new?.id || payload.old?.id);
          // Optimistically merge or reload (simpler reload for correctness)
          loadComplaints();
        })
        .subscribe(status => {
          if (status === 'SUBSCRIBED') console.log('[AdminDashboardHome] Realtime subscribed for complaints table');
        });
      return () => { database.supabase.removeChannel(channel); };
    } catch (e) {
      console.warn('Realtime subscription failed (admin complaints):', e);
    }
  }, [database, loadComplaints]);

  const analytics = useMemo(() => {
    const total = allComplaints.length;
    const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
    const pending = allComplaints.filter(c => c.status === 'Pending').length;
    const inProgress = allComplaints.filter(c => c.status === 'In Progress').length;
    return { total, resolved, pending, inProgress };
  }, [allComplaints]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return '#10b981';
      case 'In Progress': return '#f59e0b';
      case 'Pending': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Sorting and filtering helpers (adapted from user dashboard)
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSelectedSortOption(value);

    let key, direction;
    switch (value) {
      case 'date-newest':
        key = 'dateSubmitted';
        direction = 'desc';
        break;
      case 'date-oldest':
        key = 'dateSubmitted';
        direction = 'asc';
        break;
      case 'issue-asc':
        key = 'description';
        direction = 'asc';
        break;
      case 'issue-desc':
        key = 'description';
        direction = 'desc';
        break;
      case 'status-pending':
      case 'status-progress':
      case 'status-resolved':
        key = 'status';
        direction = 'asc';
        break;
      default:
        key = 'dateSubmitted';
        direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '⇅';
  };

  const handleSort = (column) => {
    setSortConfig(prev => {
      const key = column;
      const direction = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
  };

  const sortedReports = useMemo(() => {
    let sortableItems = [...allComplaints];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'dateSubmitted') {
          const aDate = new Date(a[sortConfig.key]);
          const bDate = new Date(b[sortConfig.key]);
          if (aDate < bDate) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aDate > bDate) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        } else if (sortConfig.key === 'status') {
          const statusOrder = {
            'status-pending': ['Pending', 'In Progress', 'Resolved'],
            'status-progress': ['In Progress', 'Pending', 'Resolved'],
            'status-resolved': ['Resolved', 'In Progress', 'Pending']
          };
          const order = statusOrder[selectedSortOption] || ['Pending', 'In Progress', 'Resolved'];
          const aIndex = order.indexOf(a.status);
          const bIndex = order.indexOf(b.status);
          if (aIndex < bIndex) return -1;
          if (aIndex > bIndex) return 1;
          return 0;
        } else if (sortConfig.key === 'description') {
          const av = (a.description || a.title || '').toLowerCase();
          const bv = (b.description || b.title || '').toLowerCase();
          if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
          if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        } else {
          if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
          if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }
    return sortableItems;
  }, [allComplaints, sortConfig, selectedSortOption]);

  const filteredReports = useMemo(() => {
    if (!searchTerm) return sortedReports;
    return sortedReports.filter(report =>
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.regNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.mainCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.subCategory1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.specificIssue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedReports, searchTerm]);

  const totalPages = Math.ceil(filteredReports.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + entriesPerPage);

  const handleStatusCommit = async (report) => {
    const newStatus = pendingStatus[report.id] ?? report.status;
    if (newStatus === report.status) return;
    setUpdatingId(report.id);
    // Optimistic UI update
    setAllComplaints(prev => prev.map(c => c.id === report.id ? { ...c, status: newStatus } : c));
    try {
      await updateComplaintStatus(report.id, newStatus);
    } catch (e) {
      console.error('Failed to update status, reverting', e);
      // Revert
      await loadComplaints();
    } finally {
      setUpdatingId(null);
    }
  };

  const skeletonRow = (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td colSpan={7} style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {Array.from({ length: 5 }).map((_,i)=>(
            <div key={i} style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </td>
    </tr>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Analytics Cards - Compact */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary)', fontSize: '14px' }}>Total Reports</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0' }}>{analytics.total}</p>
          </div>
          <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '14px' }}>Resolved</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0' }}>{analytics.resolved}</p>
          </div>
          <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: '14px' }}>In Progress</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0' }}>{analytics.inProgress}</p>
          </div>
          <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#ef4444', fontSize: '14px' }}>Pending</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0' }}>{analytics.pending}</p>
          </div>
        </div>

  {/* Map Full Width with Collapsible Info */}
  <div className="card" style={{ padding: '20px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Complaints Map</h3>
            <button
              onClick={() => setShowMapInfo(v => !v)}
              style={{
                padding: '6px 12px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 12
              }}
            >{showMapInfo ? 'Hide Info' : 'Show Info'}</button>
          </div>
          <InteractiveMap height="560px" />
          {showMapInfo && (
            <div style={{ marginTop: 16, display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)', fontSize: 14 }}>📊 Stats</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total</span><strong>{analytics.total}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pending</span><strong style={{ color: '#ef4444' }}>{analytics.pending}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>In Progress</span><strong style={{ color: '#f59e0b' }}>{analytics.inProgress}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Resolved</span><strong style={{ color: '#10b981' }}>{analytics.resolved}</strong></div>
                </div>
              </div>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)', fontSize: 14 }}>🎯 Legend</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ef4444' }}></div>Pending</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 14, height: 14, borderRadius: '50%', background: '#f59e0b' }}></div>In Progress</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 14, height: 14, borderRadius: '50%', background: '#10b981' }}></div>Resolved</div>
                </div>
              </div>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)', fontSize: 14 }}>⚡ Priority</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>High</span><strong style={{ color: '#ef4444' }}>{allComplaints.filter(c => c.priority === 'High' || c.priority === 'Urgent').length}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Medium</span><strong style={{ color: '#f59e0b' }}>{allComplaints.filter(c => c.priority === 'Medium').length}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Low</span><strong style={{ color: '#10b981' }}>{allComplaints.filter(c => c.priority === 'Low').length}</strong></div>
                </div>
              </div>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)', fontSize: 14 }}>🏢 Departments</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  {Object.entries(
                    allComplaints.reduce((acc, c) => { acc[c.department] = (acc[c.department] || 0) + 1; return acc; }, {})
                  ).sort(([,a],[,b]) => b - a).slice(0,5).map(([dept,count]) => (
                    <div key={dept} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{dept}</span><strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

  {/* Reports Management - Table UI like user dashboard */}
  <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: 12, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '18px', margin: 0 }}>All Reports ({filteredReports.length})</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontWeight: 'bold' }}>Show</label>
              <select value={entriesPerPage} onChange={(e)=>{ setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 6 }}>
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontWeight: 'bold' }}>Sort by:</label>
              <select value={selectedSortOption} onChange={handleSortChange} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 6, minWidth: 150 }}>
                <optgroup label="Date">
                  <option value="date-newest">Newest First</option>
                  <option value="date-oldest">Oldest First</option>
                </optgroup>
                <optgroup label="Description">
                  <option value="issue-asc">Description A-Z</option>
                  <option value="issue-desc">Description Z-A</option>
                </optgroup>
                <optgroup label="Status">
                  <option value="status-pending">Pending First</option>
                  <option value="status-progress">In Progress First</option>
                  <option value="status-resolved">Resolved First</option>
                </optgroup>
              </select>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontWeight: 'bold' }}>Search:</label>
              <input type="text" value={searchTerm} onChange={(e)=>{ setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Search" style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 6, minWidth: 200 }}/>
              <button style={{ padding: '8px 12px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>📊 Export</button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: 8, overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: 12, textAlign: 'left', cursor: 'pointer' }} onClick={()=>handleSort('id')}>S.No {getSortIcon('id')}</th>
                  <th style={{ padding: 12, textAlign: 'left', cursor: 'pointer' }} onClick={()=>handleSort('regNumber')}>Reg. No {getSortIcon('regNumber')}</th>
                  <th style={{ padding: 12, textAlign: 'left', cursor: 'pointer' }} onClick={()=>handleSort('dateSubmitted')}>Date {getSortIcon('dateSubmitted')}</th>
                  <th style={{ padding: 12, textAlign: 'left', cursor: 'pointer' }} onClick={()=>handleSort('description')}>Description {getSortIcon('description')}</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Priority</th>
                  <th style={{ padding: 12, textAlign: 'left', cursor: 'pointer' }} onClick={()=>handleSort('status')}>Status {getSortIcon('status')}</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && skeletonRow}
                {!loading && paginatedReports.map((report, index) => (
                  <tr key={report.id} style={{ borderBottom: '1px solid var(--border)', background: (startIndex + index) % 2 === 0 ? 'var(--bg)' : 'var(--card)' }}>
                    <td style={{ padding: 12 }}>{startIndex + index + 1}</td>
                    <td style={{ padding: 12, fontWeight: 600 }}>{report.regNumber}</td>
                    <td style={{ padding: 12 }}>{new Date(report.dateSubmitted).toLocaleDateString()}</td>
                    <td style={{ padding: 12, maxWidth: 360 }}>
                      <div title={report.description || report.title} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {report.title || report.description}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{report.department} • {report.userName || 'User'}</div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: '3px 8px', borderRadius: 12, background: getPriorityColor(report.priority), color: '#fff', fontSize: 11, fontWeight: 700 }}>{report.priority}</span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: '4px 8px', borderRadius: 12, background: getStatusColor(report.status), color: '#fff', fontSize: 12, fontWeight: 700 }}>{report.status}</span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <select value={pendingStatus[report.id] ?? report.status} onChange={(e)=>setPendingStatus(ps=>({ ...ps, [report.id]: e.target.value }))} disabled={updatingId === report.id} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        <button onClick={()=>handleStatusCommit(report)} disabled={updatingId === report.id} style={{ padding: '6px 10px', background: updatingId === report.id ? 'var(--muted)' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, cursor: updatingId === report.id ? 'not-allowed' : 'pointer', fontSize: 12 }}>{updatingId === report.id ? '...' : 'Update'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && paginatedReports.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination and Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>
              Showing {filteredReports.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + entriesPerPage, filteredReports.length)} of {filteredReports.length} entries
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={()=> setCurrentPage(p=>Math.max(1, p-1))} disabled={currentPage === 1} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, background: currentPage === 1 ? 'var(--muted)' : 'var(--bg)', color: currentPage === 1 ? '#fff' : 'var(--fg)' }}>Previous</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => { const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i; if (pageNum > totalPages) return null; return (
                <button key={pageNum} onClick={()=> setCurrentPage(pageNum)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, background: currentPage === pageNum ? 'var(--primary)' : 'var(--bg)', color: currentPage === pageNum ? '#fff' : 'var(--fg)' }}>{pageNum}</button>
              ); })}
              <button onClick={()=> setCurrentPage(p=>Math.min(totalPages, p+1))} disabled={currentPage === totalPages} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, background: currentPage === totalPages ? 'var(--muted)' : 'var(--bg)', color: currentPage === totalPages ? '#fff' : 'var(--fg)' }}>Next</button>
            </div>
          </div>
    </div>
  </div>
  );
}

export default AdminDashboardHome;
