import { useState, useMemo, useEffect } from 'react';
import { useAuth, useDatabase } from '../../../contexts';

function ManageReports() {
  const { user } = useAuth();
  const { getAllComplaints, updateComplaintStatus } = useDatabase();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const priorities = ['High', 'Medium', 'Low', 'Urgent'];

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
      <div className="reports-header">
        <h2>Manage Reports</h2>
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-controls">
          <div className="entries-control">
            <label>Show entries:</label>
            <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="sort-control">
            <label>Sort by:</label>
            <select value={selectedSortOption} onChange={handleSortChange}>
              <option value="date-newest">Date (Newest First)</option>
              <option value="date-oldest">Date (Oldest First)</option>
              <option value="issue-asc">Issue (A-Z)</option>
              <option value="issue-desc">Issue (Z-A)</option>
              <option value="status-pending">Status (Pending First)</option>
              <option value="status-progress">Status (In Progress First)</option>
              <option value="status-resolved">Status (Resolved First)</option>
            </select>
          </div>
        </div>

        <table className="reports-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('regNumber')} className="sortable">
                Reg. No. {getSortIcon('regNumber')}
              </th>
              <th onClick={() => handleSort('userName')} className="sortable">
                User {getSortIcon('userName')}
              </th>
              <th onClick={() => handleSort('description')} className="sortable">
                Issue {getSortIcon('description')}
              </th>
              <th onClick={() => handleSort('department')} className="sortable">
                Department {getSortIcon('department')}
              </th>
              <th onClick={() => handleSort('priority')} className="sortable">
                Priority {getSortIcon('priority')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {getSortIcon('status')}
              </th>
              <th onClick={() => handleSort('dateSubmitted')} className="sortable">
                Date {getSortIcon('dateSubmitted')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedComplaints.map(complaint => (
              <tr key={complaint.id}>
                <td>{complaint.regNumber}</td>
                <td>{complaint.userName}</td>
                <td className="issue-cell">
                  <div className="issue-content">
                    <strong>{complaint.title}</strong>
                    <p>{complaint.description}</p>
                    <small>{complaint.mainCategory} → {complaint.subCategory1} → {complaint.specificIssue}</small>
                    <small>{complaint.city}, {complaint.location}</small>
                    {complaint.attachmentsMeta && complaint.attachmentsMeta.length > 0 && (
                      <div className="attachments-preview">
                        <small><strong>Attachments:</strong></small>
                        <ul>
                          {complaint.attachmentsMeta.map((att, index) => (
                            <li key={index}>
                              <a href={att.url} target="_blank" rel="noopener noreferrer">{att.name}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </td>
                <td>{complaint.department}</td>
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
                      <span>Updating...</span>
                    ) : (
                      <>
                        {complaint.status !== 'Resolved' && (
                          <button
                            onClick={() => handleStatusUpdate(complaint.id, 'Resolved')}
                            className="resolve-btn"
                          >
                            Resolve
                          </button>
                        )}
                        {complaint.status !== 'In Progress' && (
                          <button
                            onClick={() => handleStatusUpdate(complaint.id, 'In Progress')}
                            className="progress-btn"
                          >
                            In Progress
                          </button>
                        )}
                        {complaint.status !== 'Pending' && (
                          <button
                            onClick={() => handleStatusUpdate(complaint.id, 'Pending')}
                            className="pending-btn"
                          >
                            Pending
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
          <div className="no-results">No reports found matching your criteria.</div>
        )}

        <div className="pagination">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredComplaints.length)} of {filteredComplaints.length} entries
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
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
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageReports;
