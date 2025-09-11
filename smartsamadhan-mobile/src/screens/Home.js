import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useTheme } from '../contexts/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { getUserComplaints, loading, error } = useDatabase();
  const { theme } = useTheme();
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    if (user?.id) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    const userReports = await getUserComplaints(user.id);
    setReports(userReports);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, [user]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'Pending').length;
    const inProgress = reports.filter(r => r.status === 'In Progress').length;
    const resolved = reports.filter(r => r.status === 'Resolved').length;
    return { total, pending, inProgress, resolved };
  }, [reports]);

  // Filter reports based on search and status
  const filteredReports = useMemo(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.regNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }

    return filtered;
  }, [reports, searchTerm, selectedStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return theme.colors.success;
      case 'In Progress': return theme.colors.warning;
      case 'Pending': return theme.colors.danger;
      default: return theme.colors.secondary;
    }
  };

  const renderReport = ({ item }) => (
    <TouchableOpacity
      style={[styles.reportItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={() => navigation.navigate('ReportDetails', { report: item })}
    >
      <View style={styles.reportHeader}>
        <Text style={[styles.reportTitle, { color: theme.colors.text }]}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={[styles.reportDate, { color: theme.colors.textSecondary }]}>
        Submitted: {item.dateSubmitted}
      </Text>
      <Text style={[styles.reportDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      {item.category && (
        <Text style={[styles.category, { color: theme.colors.primary }]}>
          {item.category}
        </Text>
      )}
    </TouchableOpacity>
  );

  const statusFilters = ['All', 'Pending', 'In Progress', 'Resolved'];

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text }}>Loading reports...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.error, { color: theme.colors.danger }]}>Error loading reports: {error}</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={fetchReports}>
          <Text style={[styles.buttonText, { color: theme.colors.surface }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.welcome, { color: theme.colors.primary }]}>
        Welcome, {user?.fullName || user?.email}!
      </Text>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.primary },
            selectedStatus === 'All' && { backgroundColor: theme.colors.primary, borderWidth: 3, shadowOpacity: 0.2, elevation: 4 }
          ]}
          onPress={() => setSelectedStatus('All')}
        >
          <Text style={[
            styles.statNumber,
            { color: selectedStatus === 'All' ? '#fff' : theme.colors.primary }
          ]}>{stats.total}</Text>
          <Text style={[
            styles.statLabel,
            { color: selectedStatus === 'All' ? '#fff' : theme.colors.textSecondary }
          ]}>Total</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.danger },
            selectedStatus === 'Pending' && { backgroundColor: theme.colors.danger, borderWidth: 3, shadowOpacity: 0.2, elevation: 4 }
          ]}
          onPress={() => setSelectedStatus('Pending')}
        >
          <Text style={[
            styles.statNumber,
            { color: selectedStatus === 'Pending' ? '#fff' : theme.colors.danger }
          ]}>{stats.pending}</Text>
          <Text style={[
            styles.statLabel,
            { color: selectedStatus === 'Pending' ? '#fff' : theme.colors.textSecondary }
          ]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.warning },
            selectedStatus === 'In Progress' && { backgroundColor: theme.colors.warning, borderWidth: 3, shadowOpacity: 0.2, elevation: 4 }
          ]}
          onPress={() => setSelectedStatus('In Progress')}
        >
          <Text style={[
            styles.statNumber,
            { color: selectedStatus === 'In Progress' ? '#fff' : theme.colors.warning }
          ]}>{stats.inProgress}</Text>
          <Text style={[
            styles.statLabel,
            { color: selectedStatus === 'In Progress' ? '#fff' : theme.colors.textSecondary }
          ]}>In Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.success },
            selectedStatus === 'Resolved' && { backgroundColor: theme.colors.success, borderWidth: 3, shadowOpacity: 0.2, elevation: 4 }
          ]}
          onPress={() => setSelectedStatus('Resolved')}
        >
          <Text style={[
            styles.statNumber,
            { color: selectedStatus === 'Resolved' ? '#fff' : theme.colors.success }
          ]}>{stats.resolved}</Text>
          <Text style={[
            styles.statLabel,
            { color: selectedStatus === 'Resolved' ? '#fff' : theme.colors.textSecondary }
          ]}>Resolved</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Report Button in Same Line */}
      <View style={styles.controlsContainer}>
        <TextInput
          style={[styles.searchInput, {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text,
            flex: 1,
            marginRight: 10
          }]}
          placeholder="Search reports..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity
          style={[styles.reportButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('ReportIssue')}
        >
          <Text style={[styles.reportButtonText, { color: theme.colors.surface }]}>+ Report</Text>
        </TouchableOpacity>
      </View>

      {filteredReports.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
            {searchTerm || selectedStatus !== 'All' ? 'No reports match your filters' : 'No reports yet. Create your first report!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderReport}
          keyExtractor={(item) => item.id}
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },

  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 5 },
  controlsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    flex: 1,
    marginRight: 10,
    marginBottom: 0
  },
  reportButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  filterButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center'
  },
  filterText: { fontSize: 12, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginBottom: 20 },
  list: { flex: 1 },
  reportItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  reportTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  reportDate: { fontSize: 12, marginBottom: 5 },
  reportDesc: { fontSize: 14, marginTop: 5, lineHeight: 20 },
  category: { fontSize: 12, fontWeight: 'bold', marginTop: 5 },
  button: { padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16 },
  error: { textAlign: 'center', marginBottom: 10 },
  empty: { textAlign: 'center', fontSize: 16 }
});
