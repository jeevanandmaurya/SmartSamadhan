import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useDatabase } from '../../../contexts';

function ManageReports() {
  const { t } = useTranslation('admin');
  const { user } = useAuth();
  const { getAllComplaints, updateComplaintStatus } = useDatabase();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState({ show: false, src: '', name: '' });

  // Table UI state (mirror of user dashboard)
  const [sortConfig, setSortConfig] = useState({ key: 'dateSubmitted', direction: 'desc' });
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSortOption, setSelectedSortOption] = useState('date-newest');

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const complaints = await getAllComplaints();
        setAllComplaints(complaints);
      } catch (error) {
        console.error('Error loading complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [getAllComplaints]);

  // Sorting helpers
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

  const sortedComplaints = useMemo(() => {
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

  const filteredComplaints = useMemo(() => {
    return sortedComplaints.filter(complaint => {
      const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
      const matchesDepartment = filterDepartment === 'all' || complaint.department === filterDepartment;
      const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;
      const matchesSearch = !searchTerm ||
        complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.regNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.mainCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.subCategory1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.specificIssue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.location?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesDepartment && matchesPriority && matchesSearch;
    });
  }, [sortedComplaints, filterStatus, filterDepartment, filterPriority, searchTerm]);

  const totalPages = Math.ceil(filteredComplaints.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + entriesPerPage);

  const departments = [...new Set(allComplaints.map(c => c.department))];

  // Function to translate department names
  const translateDepartment = (dept) => {
    if (!dept) return dept;

    const deptTranslations = {
      // Exact matches
      'Police': t('police'),
      'Fire': t('fire'),
      'Health': t('health'),
      'Municipal': t('municipal'),
      'Water': t('water'),
      'Electricity': t('electricity'),
      'Roads': t('roads'),
      'Sanitation': t('sanitation'),
      'Education': t('education'),
      'Revenue': t('revenue'),
      'Public Works': t('public works'),
      'Transport': t('transport'),
      'Environment': t('environment'),
      'Housing': t('housing'),
      'Urban Development': t('urban development'),
      'Rural Development': t('rural development'),
      'Social Welfare': t('social welfare'),
      'Labor': t('labor'),
      'Finance': t('finance'),
      'Administration': t('administration'),

      // Common variations
      'Police Department': t('police'),
      'Fire Department': t('fire'),
      'Health Department': t('health'),
      'Municipal Corporation': t('municipal'),
      'Water Supply': t('water'),
      'Electricity Board': t('electricity'),
      'Roads & Transport': t('roads'),
      'Roads and Transport': t('roads'),
      'Education Department': t('education'),
      'Revenue Department': t('revenue'),
      'Public Works Department': t('public works'),
      'Transport Department': t('transport'),
      'Environment Department': t('environment'),
      'Housing Department': t('housing'),
      'Urban Development Department': t('urban development'),
      'Rural Development Department': t('rural development'),
      'Social Welfare Department': t('social welfare'),
      'Labor Department': t('labor'),
      'Finance Department': t('finance'),
      'Administration Department': t('administration'),

      // Lowercase variations
      'police': t('police'),
      'fire': t('fire'),
      'health': t('health'),
      'municipal': t('municipal'),
      'water': t('water'),
      'electricity': t('electricity'),
      'roads': t('roads'),
      'sanitation': t('sanitation'),
      'education': t('education'),
      'revenue': t('revenue'),
      'public works': t('public works'),
      'transport': t('transport'),
      'environment': t('environment'),
      'housing': t('housing'),
      'urban development': t('urban development'),
      'rural development': t('rural development'),
      'social welfare': t('social welfare'),
      'labor': t('labor'),
      'finance': t('finance'),
      'administration': t('administration')
    };

    const translated = deptTranslations[dept] || dept;
    console.log('Department translation:', dept, '->', translated); // Debug log
    return translated;
  };

  const priorities = [
    { value: 'High', label: t('high') },
    { value: 'Medium', label: t('medium') },
    { value: 'Low', label: t('low') },
    { value: 'Urgent', label: t('urgent') }
  ];

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
      case 'Urgent': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      await updateComplaintStatus(complaintId, newStatus, `Status updated by ${user.fullName}`);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="manage-reports">
      <div className="reports-header" style={{ marginBottom: '8px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 4px 0' }}>{t('manageReports')}</h2>
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">{t('statusAll')}</option>
              <option value="Pending">{t('pending')}</option>
              <option value="In Progress">{t('inProgress')}</option>
              <option value="Resolved">{t('resolved')}</option>
            </select>
            <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
              <option value="all">{t('deptAll')}</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{translateDepartment(dept)}</option>
              ))}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">{t('priorityAll')}</option>
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-controls" style={{ gap: '8px' }}>
          <div className="entries-control">
            <label style={{ fontSize: '12px' }}>{t('showLabel')}</label>
            <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="sort-control">
            <label style={{ fontSize: '12px' }}>{t('sortLabel')}</label>
            <select value={selectedSortOption} onChange={handleSortChange}>
              <option value="date-newest">{t('dateNewestFirst')}</option>
              <option value="date-oldest">{t('dateOldestFirst')}</option>
              <option value="issue-asc">{t('issueAZ')}</option>
              <option value="issue-desc">{t('issueZA')}</option>
              <option value="status-pending">{t('statusPendingFirst')}</option>
              <option value="status-progress">{t('statusProgressFirst')}</option>
              <option value="status-resolved">{t('statusResolvedFirst')}</option>
            </select>
          </div>
        </div>

        <table className="reports-table" style={{ fontSize: '13px' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('regNumber')} className="sortable">
                {t('regNumber')} {getSortIcon('regNumber')}
              </th>
              <th onClick={() => handleSort('userName')} className="sortable">
                {t('user')} {getSortIcon('userName')}
              </th>
              <th onClick={() => handleSort('description')} className="sortable">
                {t('issue')} {getSortIcon('description')}
              </th>
              <th onClick={() => handleSort('department')} className="sortable">
                {t('dept')} {getSortIcon('department')}
              </th>
              <th onClick={() => handleSort('priority')} className="sortable">
                {t('prio')} {getSortIcon('priority')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                {t('status')} {getSortIcon('status')}
              </th>
              <th onClick={() => handleSort('dateSubmitted')} className="sortable">
                {t('date')} {getSortIcon('dateSubmitted')}
              </th>
              <th>{t('act')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedComplaints.map(complaint => (
              <tr key={complaint.id}>
                <td>{complaint.regNumber}</td>
                <td>{complaint.userName}</td>
                <td className="issue-cell">
                  <div className="issue-content">
                    <strong style={{ fontSize: '13px' }}>{complaint.title}</strong>
                    <p style={{ fontSize: '12px', lineHeight: 1.3 }}>{complaint.description}</p>
                    <small style={{ fontSize: '11px' }}>{complaint.mainCategory} → {complaint.subCategory1} → {complaint.specificIssue}</small>
                    <small style={{ fontSize: '11px' }}>{complaint.city}, {complaint.location}</small>
                    {complaint.attachments && complaint.attachments.length > 0 && (
                      <div className="attachments-preview" style={{ marginTop: '6px' }}>
                        <small style={{ fontSize: '11px' }}><strong>Files:</strong></small>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                          {complaint.attachments.map((att, index) => {
                            const isImage = att.type && att.type.startsWith('image/');
                            return (
                              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                {isImage ? (
                                  <div
                                    onClick={() => setImagePreview({ show: true, src: att.url, name: att.name })}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '3px',
                                      border: '1px solid var(--border)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backgroundColor: 'var(--card-bg)',
                                      flexShrink: 0
                                    }}
                                  >
                                    <img
                                      src={att.url}
                                      alt={att.name}
                                      style={{
                                        width: '28px',
                                        height: '28px',
                                        objectFit: 'cover',
                                        borderRadius: '2px',
                                        display: 'block'
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '3px',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'var(--card-bg)',
                                    flexShrink: 0
                                  }}>
                                    <i className="fas fa-file" style={{ fontSize: '12px', color: 'var(--muted)' }}></i>
                                  </div>
                                )}
                                <div style={{
                                  fontSize: '9px',
                                  color: 'var(--muted)',
                                  textAlign: 'center',
                                  maxWidth: '32px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {att.name.split('.').slice(0, -1).join('.')}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td>{translateDepartment(complaint.department)}</td>
                <td>
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(complaint.priority) }}
                  >
                    {complaint.priority}
                  </span>
                </td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(complaint.status) }}
                  >
                    {complaint.status}
                  </span>
                </td>
                <td>{new Date(complaint.dateSubmitted).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    {updatingId === complaint.id ? (
                      <span>{t('updating')}</span>
                    ) : (
                      <>
                        {complaint.status !== 'Resolved' && (
                          <button
                            onClick={() => handleStatusUpdate(complaint.id, 'Resolved')}
                            className="resolve-btn"
                            style={{ fontSize: '11px', padding: '4px 6px' }}
                          >
                            {t('resolve')}
                          </button>
                        )}
                        {complaint.status !== 'In Progress' && (
                          <button
                            onClick={() => handleStatusUpdate(complaint.id, 'In Progress')}
                            className="progress-btn"
                            style={{ fontSize: '11px', padding: '4px 6px' }}
                          >
                            {t('inProgress')}
                          </button>
                        )}
                        {complaint.status !== 'Pending' && (
                          <button
                            onClick={() => handleStatusUpdate(complaint.id, 'Pending')}
                            className="pending-btn"
                            style={{ fontSize: '11px', padding: '4px 6px' }}
                          >
                            {t('pending')}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredComplaints.length === 0 && (
          <div className="no-results">{t('noReportsFound')}</div>
        )}

        <div className="pagination" style={{ fontSize: '12px' }}>
          <div className="pagination-info" style={{ fontSize: '11px' }}>
            {startIndex + 1}-{Math.min(startIndex + entriesPerPage, filteredComplaints.length)} / {filteredComplaints.length}
          </div>
          <div className="pagination-controls" style={{ gap: '4px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              {t('previous')}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'active' : ''}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              {t('next')}
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {imagePreview.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setImagePreview({ show: false, src: '', name: '' })}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '400px',
              maxHeight: '400px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setImagePreview({ show: false, src: '', name: '' })}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                zIndex: 1,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
              }}
            >
              <i className="fas fa-times"></i>
            </button>

            {/* Image */}
            <img
              src={imagePreview.src}
              alt={imagePreview.name}
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'block',
                objectFit: 'contain',
                imageRendering: 'auto'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageReports;
