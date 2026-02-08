// app/case/[id].tsx - Case Detail Screen
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function CaseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const timelineEvents = [
    {
      id: '1',
      title: 'Claim Submitted',
      date: 'Jan 15, 2026',
      time: '10:30 AM',
      status: 'completed',
      description: 'Your claim was successfully submitted to Lufthansa',
    },
    {
      id: '2',
      title: 'Airline Acknowledged',
      date: 'Jan 18, 2026',
      time: '2:15 PM',
      status: 'completed',
      description: 'Lufthansa has acknowledged receipt of your claim',
    },
    {
      id: '3',
      title: 'Under Review',
      date: 'Jan 20, 2026',
      time: '9:00 AM',
      status: 'active',
      description: 'Your case is currently being reviewed by the airline',
    },
    {
      id: '4',
      title: 'Resolution Expected',
      date: 'Feb 12, 2026',
      time: 'TBD',
      status: 'pending',
      description: 'Expected response deadline based on EU regulations',
    },
  ];

  const documents = [
    { id: '1', name: 'Boarding Pass', type: 'PDF', size: '245 KB', icon: '📄' },
    { id: '2', name: 'Flight Confirmation', type: 'PDF', size: '189 KB', icon: '📄' },
    { id: '3', name: 'Delay Certificate', type: 'PDF', size: '312 KB', icon: '📄' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Case Details</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.caseHeader}>
          <View style={styles.caseIconLarge}>
            <Text style={styles.caseIconText}>✈️</Text>
          </View>
          <Text style={styles.caseTitle}>Flight Delay Compensation</Text>
          <Text style={styles.caseSubtitle}>Lufthansa LH1234 • 4h 35m delay</Text>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>In Review</Text>
          </View>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Claim Amount</Text>
          <Text style={styles.amountValue}>€600.00</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
            <Text style={styles.progressLabel}>75%</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timeline}>
            {timelineEvents.map((event, index) => (
              <View key={event.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineDot,
                      event.status === 'completed' && styles.timelineDotCompleted,
                      event.status === 'active' && styles.timelineDotActive,
                    ]}
                  />
                  {index < timelineEvents.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        event.status === 'completed' && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>{event.title}</Text>
                  <Text style={styles.timelineDate}>
                    {event.date} {event.time && `• ${event.time}`}
                  </Text>
                  <Text style={styles.timelineDescription}>{event.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <TouchableOpacity>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {documents.map((doc) => (
            <TouchableOpacity key={doc.id} style={styles.documentCard}>
              <View style={styles.documentIcon}>
                <Text style={styles.documentIconText}>{doc.icon}</Text>
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Text style={styles.documentMeta}>
                  {doc.type} • {doc.size}
                </Text>
              </View>
              <TouchableOpacity style={styles.downloadButton}>
                <Text style={styles.downloadIcon}>↓</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>What happens next?</Text>
            <View style={styles.nextStepsList}>
              <View style={styles.nextStepItem}>
                <Text style={styles.nextStepBullet}>•</Text>
                <Text style={styles.nextStepText}>
                  The airline has 30 days to respond to your claim
                </Text>
              </View>
              <View style={styles.nextStepItem}>
                <Text style={styles.nextStepBullet}>•</Text>
                <Text style={styles.nextStepText}>
                  We'll notify you immediately when there's an update
                </Text>
              </View>
              <View style={styles.nextStepItem}>
                <Text style={styles.nextStepBullet}>•</Text>
                <Text style={styles.nextStepText}>
                  If no response, we'll automatically escalate to the regulator
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Contact Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonPrimary}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonPrimaryText}>Send Follow-up</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  caseHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  caseIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  caseIconText: {
    fontSize: 40,
  },
  caseTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  caseSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  amountCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  addButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    width: 45,
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timelineDotCompleted: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  timelineDotActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 4,
    minHeight: 40,
  },
  timelineLineCompleted: {
    backgroundColor: '#6366F1',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  timelineDescription: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentIconText: {
    fontSize: 20,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadIcon: {
    fontSize: 18,
    color: '#6366F1',
  },
  nextStepsCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 16,
    padding: 20,
  },
  nextStepsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 12,
  },
  nextStepsList: {
    gap: 10,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nextStepBullet: {
    fontSize: 16,
    color: '#3B82F6',
    marginRight: 8,
    marginTop: 2,
  },
  nextStepText: {
    flex: 1,
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(19, 24, 37, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
