import { useState, useMemo, useEffect } from 'react';
import { useAuth, useDatabase } from '../../contexts';

function DashboardHome() {
  const [sortConfig, setSortConfig] = useState({ key: 'dateSubmitted', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSortOption, setSelectedSortOption] = useState('date-newest');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { getUserComplaints, database } = useDatabase();

  useEffect(() => {
    let active = true;
    const loadUserComplaints = async (reason='initial') => {
      if (!user?.id) return;
      try {
        if (reason === 'initial') setLoading(true);
        const userComplaints = await getUserComplaints(user.id);
        if (!active) return;
        console.log(`[DashboardHome] Loaded ${userComplaints.length} complaints (reason=${reason}) for user`, user.id);
        setReports(userComplaints);
      } catch (error) {
        if (!active) return;
        console.error('Error loading user complaints:', error);
        setReports([]);
      } finally {
        if (reason === 'initial' && active) setLoading(false);
      }
    };
    loadUserComplaints('initial');
    return () => { active = false; };
  }, [getUserComplaints, user?.id]);

  // Real-time subscription so newly lodged complaints appear automatically
  useEffect(() => {
    if (!database?.supabase || !user?.id) return; 
    try {
      const channel = database.supabase
        .channel(`complaints-user-${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints', filter: `user_id=eq.${user.id}` }, (payload) => {
          console.log('[DashboardHome] Realtime payload:', payload.eventType, payload.new?.id || payload.old?.id);
          // Refresh list silently
          getUserComplaints(user.id).then(list => {
            console.log('[DashboardHome] Realtime refresh, complaints count =', list.length);
            setReports(list);
          });
        })
        .subscribe(status => {
          if (status === 'SUBSCRIBED') console.log('[DashboardHome] Realtime subscribed for user complaints');
        });
      return () => { database.supabase.removeChannel(channel); };
    } catch (e) {
      console.warn('Realtime subscription failed (user complaints):', e);
    }
  }, [database, user?.id, getUserComplaints]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'Pending').length;
    const resolved = reports.filter(r => r.status === 'Resolved').length;
    const inProgress = reports.filter(r => r.status === 'In Progress').length;
    return { total, pending, resolved, inProgress };
  }, [reports]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return '#10b981';
      case 'In Progress': return '#f59e0b';
      case 'Pending': return '#ef4444';
      default: return '#6b7280';
    }
  };

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
        key = 'status';
        direction = 'asc'; // Will be handled specially
        break;
      case 'status-progress':
        key = 'status';
        direction = 'asc'; // Will be handled specially
        break;
      case 'status-resolved':
        key = 'status';
        direction = 'asc'; // Will be handled specially
        break;
      default:
        key = 'date';
        direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  const sortedReports = useMemo(() => {
    let sortableItems = [...reports];
  if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
    if (sortConfig.key === 'dateSubmitted') {
          const aDate = new Date(a[sortConfig.key]);
          const bDate = new Date(b[sortConfig.key]);
          if (aDate < bDate) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aDate > bDate) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        } else if (sortConfig.key === 'status') {
          // Custom status sorting based on selected option
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
          if (av < bv) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (av > bv) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        } else {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableItems;
  }, [reports, sortConfig, selectedSortOption]);

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

  // Filter reports based on search term
  const filteredReports = useMemo(() => {
    if (!searchTerm) return sortedReports;
    return sortedReports.filter(report =>
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.mainCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.subCategory1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.specificIssue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedReports, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredReports.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + entriesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  return (
    <div>
      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center', border: '2px solid var(--primary)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>Total Registered</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0', color: 'var(--primary)' }}>{stats.total}</p>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center', border: '2px solid #f59e0b' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f59e0b' }}>Pending</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0', color: '#f59e0b' }}>{stats.pending}</p>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center', border: '2px solid #10b981' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#10b981' }}>Closed</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0', color: '#10b981' }}>{stats.resolved}</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '20px' }}>Your Complaints</h3>

        {/* Search, Sort and Entries Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>Show</label>
            <select
              value={entriesPerPage}
              onChange={handleEntriesChange}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '14px'
              }}
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>Sort by:</label>
            <select
              value={selectedSortOption}
              onChange={handleSortChange}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>Search:</label>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '14px',
                minWidth: '200px'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => handleSort('id')}>
                  S.No {getSortIcon('id')}
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => handleSort('regNumber')}>
                  Registration Number {getSortIcon('regNumber')}
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => handleSort('dateSubmitted')}>
                  Receiving Date {getSortIcon('dateSubmitted')}
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => handleSort('description')}>
                  Complaint Description {getSortIcon('description')}
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => handleSort('status')}>
                  Status {getSortIcon('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.map((report, index) => (
                <tr key={report.id} style={{
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: index % 2 === 0 ? 'var(--bg)' : 'var(--card-bg)',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedComplaint(report)}
                >
                  <td style={{ padding: '12px' }}>{startIndex + index + 1}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{report.regNumber}</td>
                  <td style={{ padding: '12px' }}>{new Date(report.dateSubmitted).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', maxWidth: '300px' }}>
                    <div style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer'
                    }}
                    title={report.description || report.title}>
                      {report.title || report.description}
                    </div>
                    {report.mainCategory && (
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--muted)',
                        marginTop: '2px'
                      }}>
                        {report.mainCategory} • {report.department}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor: getStatusColor(report.status),
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination and Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Showing {filteredReports.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + entriesPerPage, filteredReports.length)} of {filteredReports.length} entries
            {searchTerm && ` (filtered from ${reports.length} total entries)`}
          </div>

          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: currentPage === 1 ? 'var(--muted)' : 'var(--bg)',
                color: currentPage === 1 ? '#fff' : 'var(--fg)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: currentPage === pageNum ? 'var(--primary)' : 'var(--bg)',
                    color: currentPage === pageNum ? '#fff' : 'var(--fg)',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: currentPage === totalPages ? 'var(--muted)' : 'var(--bg)',
                color: currentPage === totalPages ? '#fff' : 'var(--fg)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Next
            </button>
          </div>
        </div>

        {filteredReports.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--muted)',
            fontSize: '16px'
          }}>
            {searchTerm ? 'No complaints found matching your search.' : 'No complaints found.'}
          </div>
        )}
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '15px'
        }}
        onClick={() => setSelectedComplaint(null)}
        >
          <div style={{
            backgroundColor: 'var(--bg)',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 20px',
              borderBottom: '1px solid var(--border)'
            }}>
              <h3 style={{ margin: '0', color: 'var(--primary)', fontSize: '18px' }}>Complaint Details</h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  padding: '0',
                  width: '25px',
                  height: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '15px 20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>{selectedComplaint.title || selectedComplaint.description}</h4>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '15px',
                    backgroundColor: getStatusColor(selectedComplaint.status),
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {selectedComplaint.status}
                </span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {/* Compact Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px', textTransform: 'uppercase', fontWeight: '600' }}>Registration</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{selectedComplaint.regNumber}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px', textTransform: 'uppercase', fontWeight: '600' }}>Report ID</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{selectedComplaint.id}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px', textTransform: 'uppercase', fontWeight: '600' }}>Department</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{selectedComplaint.department}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px', textTransform: 'uppercase', fontWeight: '600' }}>Priority</div>
                    <span
                      style={{
                        padding: '3px 6px',
                        borderRadius: '8px',
                        backgroundColor: selectedComplaint.priority === 'High' ? '#ef4444' :
                                       selectedComplaint.priority === 'Medium' ? '#f59e0b' :
                                       selectedComplaint.priority === 'Low' ? '#10b981' : '#6b7280',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    >
                      {selectedComplaint.priority}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div style={{ padding: '12px', backgroundColor: 'var(--card-bg)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '5px', textTransform: 'uppercase', fontWeight: '600' }}>Description</div>
                  <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{selectedComplaint.description || selectedComplaint.title}</div>
                </div>

                {/* Bottom Info Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px', textTransform: 'uppercase', fontWeight: '600' }}>Submitted</div>
                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{new Date(selectedComplaint.dateSubmitted).toLocaleDateString()}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px', textTransform: 'uppercase', fontWeight: '600' }}>Last Updated</div>
                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{new Date(selectedComplaint.lastUpdated || selectedComplaint.dateSubmitted).toLocaleDateString()}</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px', textTransform: 'uppercase', fontWeight: '600' }}>Assigned To</div>
                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{selectedComplaint.assignedTo || 'Unassigned'}</div>
                  </div>
                </div>

                {/* Status Timeline - Compact */}
                <div style={{ padding: '12px', backgroundColor: 'var(--card-bg)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '10px', fontWeight: '600' }}>Status Timeline</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981'
                      }}></div>
                      <span style={{ fontSize: '12px' }}>Submitted</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: selectedComplaint.status === 'In Progress' || selectedComplaint.status === 'Resolved' ? '#f59e0b' : '#e5e7eb'
                      }}></div>
                      <span style={{ fontSize: '12px' }}>In Progress</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: selectedComplaint.status === 'Resolved' ? '#10b981' : '#e5e7eb'
                      }}></div>
                      <span style={{ fontSize: '12px' }}>Resolved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardHome;
