import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function ReportDetailsScreen({ route, navigation }) {
  const { report } = route.params;
  const { theme } = useTheme();
  const [imagePreview, setImagePreview] = useState({ show: false, src: '', name: '' });

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>{report.title}</Text>
        <Text style={[styles.status, { color: theme.colors.textSecondary }]}>Status: {report.status}</Text>
        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>Submitted: {report.dateSubmitted}</Text>
        <Text style={[styles.category, { color: theme.colors.textSecondary }]}>Category: {report.category}</Text>
        <Text style={[styles.location, { color: theme.colors.textSecondary }]}>Location: {report.location}</Text>
        <Text style={[styles.descriptionTitle, { color: theme.colors.text }]}>Description:</Text>
        <Text style={[styles.description, { color: theme.colors.text }]}>{report.description}</Text>

        {/* Attachments Section */}
        {report.attachments && report.attachments.length > 0 && (
          <View style={styles.attachmentsSection}>
            <Text style={[styles.attachmentsTitle, { color: theme.colors.text }]}>Attachments:</Text>
            <View style={styles.attachmentsGrid}>
              {report.attachments.map((attachment, index) => {
                const isImage = attachment.type && attachment.type.startsWith('image/');
                return (
                  <View key={index} style={styles.attachmentItem}>
                    {isImage ? (
                      <TouchableOpacity
                        onPress={() => setImagePreview({ show: true, src: attachment.url, name: attachment.name })}
                        style={[styles.imageThumbnail, { borderColor: theme.colors.border }]}
                      >
                        <Image
                          source={{ uri: attachment.url }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.fileThumbnail, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                        <Text style={styles.fileIcon}>📄</Text>
                      </View>
                    )}
                    <Text style={[styles.attachmentName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {attachment.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {report.updates && report.updates.length > 0 && (
          <View style={styles.updatesSection}>
            <Text style={[styles.updatesTitle, { color: theme.colors.text }]}>Updates:</Text>
            {report.updates.map((update, index) => (
              <View key={index} style={[styles.updateItem, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.updateDate, { color: theme.colors.textSecondary }]}>{update.date}</Text>
                <Text style={[styles.updateStatus, { color: theme.colors.primary }]}>{update.status}</Text>
                <Text style={[styles.updateNote, { color: theme.colors.text }]}>{update.note}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={imagePreview.show}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImagePreview({ show: false, src: '', name: '' })}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            activeOpacity={1}
            onPress={() => setImagePreview({ show: false, src: '', name: '' })}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImagePreview({ show: false, src: '', name: '' })}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: imagePreview.src }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  card: { padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  status: { fontSize: 16, marginBottom: 5 },
  date: { fontSize: 14, marginBottom: 5 },
  category: { fontSize: 14, marginBottom: 5 },
  location: { fontSize: 14, marginBottom: 15 },
  descriptionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  attachmentsSection: { marginTop: 20 },
  attachmentsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  attachmentsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  attachmentItem: { alignItems: 'center', marginBottom: 10, width: 80 },
  imageThumbnail: { width: 60, height: 60, borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  thumbnailImage: { width: '100%', height: '100%' },
  fileThumbnail: { width: 60, height: 60, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  fileIcon: { fontSize: 24 },
  attachmentName: { fontSize: 10, textAlign: 'center', marginTop: 4, width: '100%' },
  updatesSection: { marginTop: 20 },
  updatesTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  updateItem: { padding: 10, marginBottom: 10, borderRadius: 5 },
  updateDate: { fontSize: 12 },
  updateStatus: { fontSize: 14, fontWeight: 'bold' },
  updateNote: { fontSize: 14, marginTop: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center' },
  modalCloseArea: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', padding: 20 },
  closeButton: { position: 'absolute', top: 40, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  closeButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  fullImage: { width: Dimensions.get('window').width - 40, height: Dimensions.get('window').height - 120, maxWidth: 400, maxHeight: 400 }
});
