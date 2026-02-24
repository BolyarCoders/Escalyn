import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'active' | 'pending';
  type: 'system' | 'user' | 'airline';
};

type Evidence = {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'email';
  size: string;
  uploadedAt: string;
};

const CaseDetailsPage = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<'timeline' | 'evidence' | 'details'>('timeline');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'Case Created',
      description: 'Initial claim filed for flight delay compensation under EU261',
      timestamp: 'Dec 28, 2:14 PM',
      status: 'completed',
      type: 'user',
    },
    {
      id: '2',
      title: 'Evidence Uploaded',
      description: 'Boarding pass, booking confirmation, and delay notification attached',
      timestamp: 'Dec 28, 2:18 PM',
      status: 'completed',
      type: 'user',
    },
    {
      id: '3',
      title: 'Claim Submitted',
      description: 'Formal complaint sent to British Airways customer relations',
      timestamp: 'Dec 28, 2:22 PM',
      status: 'completed',
      type: 'system',
    },
    {
      id: '4',
      title: 'Acknowledgment Received',
      description: 'BA confirmed receipt of claim. Reference: BA-2024-8847-CR',
      timestamp: 'Dec 29, 9:42 AM',
      status: 'completed',
      type: 'airline',
    },
    {
      id: '5',
      title: 'Under Review',
      description: 'Case is being evaluated by airline claims department',
      timestamp: 'Dec 30, 11:15 AM',
      status: 'active',
      type: 'airline',
    },
    {
      id: '6',
      title: 'Response Due',
      description: 'Airline has until Jan 11 to respond under EU regulations',
      timestamp: 'Expected Jan 11',
      status: 'pending',
      type: 'system',
    },
  ];

  const evidenceFiles: Evidence[] = [
    {
      id: '1',
      name: 'Boarding_Pass_BA2847.pdf',
      type: 'pdf',
      size: '248 KB',
      uploadedAt: 'Dec 28, 2:16 PM',
    },
    {
      id: '2',
      name: 'Booking_Confirmation.pdf',
      type: 'pdf',
      size: '156 KB',
      uploadedAt: 'Dec 28, 2:17 PM',
    },
    {
      id: '3',
      name: 'Delay_Notification.jpg',
      type: 'image',
      size: '892 KB',
      uploadedAt: 'Dec 28, 2:18 PM',
    },
    {
      id: '4',
      name: 'Email_Correspondence.pdf',
      type: 'email',
      size: '89 KB',
      uploadedAt: 'Dec 29, 10:05 AM',
    },
  ];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'document-text';
      case 'image':
        return 'image';
      case 'email':
        return 'mail';
      default:
        return 'document';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'user':
        return 'person';
      case 'airline':
        return 'airplane';
      case 'system':
        return 'cog';
      default:
        return 'checkmark-circle';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Background */}
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Orbs */}
      <View style={styles.orbContainer}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
      </View>

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={80}experimentalBlurMethod="dimezisBlurView" tint="dark" style={styles.headerBlur}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Case Details</Text>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </BlurView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Case Header Card */}
        <Animated.View
          style={[
            styles.caseHeader,
            {
              opacity: fadeAnim,
              transform: [{ scale: headerScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.caseHeaderGradient}
          >
            <TouchableOpacity style={styles.floatingBack}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.caseIconContainer}>
              <View style={styles.caseIconBg}>
                <Ionicons name="airplane" size={32} color="#fff" />
              </View>
            </View>

            <Text style={styles.caseType}>FLIGHT COMPENSATION</Text>
            <Text style={styles.caseTitle}>British Airways BA2847</Text>
            <Text style={styles.caseRoute}>London Heathrow → Barcelona</Text>

            <View style={styles.claimAmount}>
              <Text style={styles.claimLabel}>Claim Amount</Text>
              <Text style={styles.claimValue}>€600</Text>
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Under Review</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(102, 126, 234, 0.15)', 'rgba(102, 126, 234, 0.05)']}
              style={styles.statGradient}
            >
              <Ionicons name="time-outline" size={24} color="#667eea" />
              <Text style={styles.statValue}>4h 35m</Text>
              <Text style={styles.statLabel}>Delay Duration</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(249, 115, 22, 0.15)', 'rgba(249, 115, 22, 0.05)']}
              style={styles.statGradient}
            >
              <Ionicons name="calendar-outline" size={24} color="#f97316" />
              <Text style={styles.statValue}>14 days</Text>
              <Text style={styles.statLabel}>Time Remaining</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.15)', 'rgba(34, 197, 94, 0.05)']}
              style={styles.statGradient}
            >
              <Ionicons name="trending-up-outline" size={24} color="#22c55e" />
              <Text style={styles.statValue}>94%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'timeline' && styles.tabActive]}
              onPress={() => setActiveTab('timeline')}
            >
              <Text style={[styles.tabText, activeTab === 'timeline' && styles.tabTextActive]}>
                Timeline
              </Text>
              {activeTab === 'timeline' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'evidence' && styles.tabActive]}
              onPress={() => setActiveTab('evidence')}
            >
              <Text style={[styles.tabText, activeTab === 'evidence' && styles.tabTextActive]}>
                Evidence
              </Text>
              {activeTab === 'evidence' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'details' && styles.tabActive]}
              onPress={() => setActiveTab('details')}
            >
              <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
                Details
              </Text>
              {activeTab === 'details' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'timeline' && (
          <View style={styles.content}>
            <Text style={styles.sectionLabel}>CASE TIMELINE</Text>
            
            <View style={styles.timeline}>
              {timelineEvents.map((event, index) => (
                <View key={event.id} style={styles.timelineEvent}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        event.status === 'completed' && styles.timelineDotCompleted,
                        event.status === 'active' && styles.timelineDotActive,
                        event.status === 'pending' && styles.timelineDotPending,
                      ]}
                    >
                      <Ionicons
                        name={getEventIcon(event.type)}
                        size={16}
                        color={
                          event.status === 'completed'
                            ? '#667eea'
                            : event.status === 'active'
                            ? '#f97316'
                            : '#6b7280'
                        }
                      />
                    </View>
                    {index < timelineEvents.length - 1 && (
                      <View
                        style={[
                          styles.timelineConnector,
                          event.status === 'pending' && styles.timelineConnectorPending,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineRight}>
                    <LinearGradient
                      colors={
                        event.status === 'active'
                          ? ['rgba(249, 115, 22, 0.15)', 'rgba(249, 115, 22, 0.05)']
                          : ['rgba(102, 126, 234, 0.1)', 'rgba(102, 126, 234, 0.05)']
                      }
                      style={styles.timelineCard}
                    >
                      <View style={styles.timelineCardHeader}>
                        <Text style={styles.timelineTitle}>{event.title}</Text>
                        <Text style={styles.timelineTimestamp}>{event.timestamp}</Text>
                      </View>
                      <Text style={styles.timelineDescription}>{event.description}</Text>
                      {event.status === 'active' && (
                        <View style={styles.activeIndicator}>
                          <View style={styles.pulsingDot} />
                          <Text style={styles.activeText}>In Progress</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'evidence' && (
          <View style={styles.content}>
            <View style={styles.evidenceHeader}>
              <Text style={styles.sectionLabel}>SUPPORTING EVIDENCE</Text>
              <TouchableOpacity style={styles.uploadButton}>
                <Ionicons name="add-circle-outline" size={20} color="#667eea" />
                <Text style={styles.uploadText}>Upload</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.evidenceGrid}>
              {evidenceFiles.map((file) => (
                <TouchableOpacity key={file.id} style={styles.evidenceCard} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['rgba(102, 126, 234, 0.1)', 'rgba(102, 126, 234, 0.05)']}
                    style={styles.evidenceGradient}
                  >
                    <View style={styles.evidenceIcon}>
                      <Ionicons name={getFileIcon(file.type)} size={28} color="#667eea" />
                    </View>
                    <View style={styles.evidenceInfo}>
                      <Text style={styles.evidenceName} numberOfLines={2}>
                        {file.name}
                      </Text>
                      <View style={styles.evidenceMeta}>
                        <Text style={styles.evidenceSize}>{file.size}</Text>
                        <View style={styles.evidenceDot} />
                        <Text style={styles.evidenceDate}>{file.uploadedAt}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.evidenceAction}>
                      <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.addMoreButton}>
              <LinearGradient
                colors={['rgba(102, 126, 234, 0.15)', 'rgba(102, 126, 234, 0.05)']}
                style={styles.addMoreGradient}
              >
                <Ionicons name="cloud-upload-outline" size={24} color="#667eea" />
                <Text style={styles.addMoreText}>Add More Evidence</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'details' && (
          <View style={styles.content}>
            <Text style={styles.sectionLabel}>CASE INFORMATION</Text>

            <View style={styles.detailsCard}>
              <LinearGradient
                colors={['rgba(102, 126, 234, 0.1)', 'rgba(102, 126, 234, 0.05)']}
                style={styles.detailsGradient}
              >
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Flight Number</Text>
                  <Text style={styles.detailValue}>BA2847</Text>
                </View>
                <View style={styles.detailDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date of Flight</Text>
                  <Text style={styles.detailValue}>Dec 24, 2024</Text>
                </View>
                <View style={styles.detailDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Scheduled Departure</Text>
                  <Text style={styles.detailValue}>10:30 AM GMT</Text>
                </View>
                <View style={styles.detailDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Actual Departure</Text>
                  <Text style={styles.detailValue}>3:05 PM GMT</Text>
                </View>
                <View style={styles.detailDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reason for Delay</Text>
                  <Text style={styles.detailValue}>Technical Issues</Text>
                </View>
                <View style={styles.detailDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Booking Reference</Text>
                  <Text style={styles.detailValue}>KL8H9M</Text>
                </View>
                <View style={styles.detailDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Airline Reference</Text>
                  <Text style={styles.detailValue}>BA-2024-8847-CR</Text>
                </View>
              </LinearGradient>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 32 }]}>LEGAL BASIS</Text>
            
            <TouchableOpacity style={styles.legalCard}>
              <LinearGradient
                colors={['rgba(147, 51, 234, 0.1)', 'rgba(147, 51, 234, 0.05)']}
                style={styles.legalGradient}
              >
                <View style={styles.legalIcon}>
                  <Ionicons name="document-text-outline" size={24} color="#9333ea" />
                </View>
                <View style={styles.legalContent}>
                  <Text style={styles.legalTitle}>EU Regulation 261/2004</Text>
                  <Text style={styles.legalDescription}>
                    Delays over 3 hours on flights within EU qualify for compensation up to €600
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <BlurView intensity={80} tint="dark"experimentalBlurMethod="dimezisBlurView" style={styles.actionBarBlur}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.actionButtonText}>Contact Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryAction}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryActionGradient}
            >
              <Text style={styles.primaryActionText}>Escalate Case</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.12,
  },
  orb1: {
    width: 350,
    height: 350,
    backgroundColor: '#667eea',
    top: -50,
    right: -100,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: '#764ba2',
    bottom: 150,
    left: -80,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerAction: {
    padding: 4,
  },
  caseHeader: {
    marginBottom: 24,
    borderRadius: 32,
    overflow: 'hidden',
  },
  caseHeaderGradient: {
    padding: 32,
    alignItems: 'center',
        paddingTop:60,

  },
  floatingBack: {
    marginTop:60,
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caseIconContainer: {
    marginBottom: 20,
  },
  caseIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caseType: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  caseTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  caseRoute: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
  },
  claimAmount: {
    marginBottom: 20,
  },
  claimLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  claimValue: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f97316',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statGradient: {
    
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  tabContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
    position: 'relative',
  },
  tabActive: {
    // Active state handled by indicator
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  timeline: {
    paddingBottom: 24,
  },
  timelineEvent: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderWidth: 2,
    borderColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineDotCompleted: {
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    borderColor: '#667eea',
  },
  timelineDotActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.3)',
    borderColor: '#f97316',
  },
  timelineDotPending: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderColor: '#6b7280',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    marginTop: 4,
  },
  timelineConnectorPending: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  timelineRight: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 20,
  },
  timelineCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  timelineTimestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 8,
  },
  timelineDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(249, 115, 22, 0.2)',
    gap: 8,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f97316',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  evidenceGrid: {
    gap: 12,
  },
  evidenceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  evidenceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  evidenceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  evidenceInfo: {
    flex: 1,
  },
  evidenceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  evidenceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evidenceSize: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  evidenceDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  evidenceDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  evidenceAction: {
    padding: 4,
  },
  addMoreButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    borderStyle: 'dashed',
  },
  addMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  addMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#667eea',
  },
  detailsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  detailsGradient: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  legalCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  legalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  legalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  legalContent: {
    flex: 1,
  },
  legalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  legalDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },
  bottomSpace: {
    height: 120,
  },
  actionBar: {
    
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionBarBlur: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 34,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  primaryAction: {
    flex: 1.2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryActionGradient: {
    overflow:'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default CaseDetailsPage;