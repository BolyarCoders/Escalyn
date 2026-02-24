import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type DisputeCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  examples: string[];
};

type Step = {
  id: number;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const NewCasePage = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    flightNumber: '',
    departureDate: '',
    delayHours: '',
    description: '',
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep - 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const steps: Step[] = [
    { id: 1, title: 'Category', icon: 'folder-outline' },
    { id: 2, title: 'Details', icon: 'information-circle-outline' },
    { id: 3, title: 'Evidence', icon: 'document-attach-outline' },
    { id: 4, title: 'Review', icon: 'checkmark-circle-outline' },
  ];

  const categories: DisputeCategory[] = [
    {
      id: 'flight',
      title: 'Flight Delay',
      subtitle: 'Compensation for delayed or cancelled flights',
      icon: 'airplane',
      gradient: ['#667eea', '#764ba2'],
      examples: ['Delay over 3 hours', 'Flight cancellation', 'Denied boarding'],
    },
    {
      id: 'telecom',
      title: 'Telecom Dispute',
      subtitle: 'Billing errors and service issues',
      icon: 'wifi',
      gradient: ['#f093fb', '#f5576c'],
      examples: ['Incorrect charges', 'Poor service', 'Contract disputes'],
    },
    {
      id: 'ecommerce',
      title: 'E-commerce',
      subtitle: 'Product returns and refunds',
      icon: 'cart',
      gradient: ['#4facfe', '#00f2fe'],
      examples: ['Item not received', 'Wrong product', 'Defective goods'],
    },
    {
      id: 'banking',
      title: 'Banking',
      subtitle: 'Unauthorized charges and account issues',
      icon: 'card',
      gradient: ['#43e97b', '#38f9d7'],
      examples: ['Fraudulent charges', 'Account errors', 'Fee disputes'],
    },
    {
      id: 'insurance',
      title: 'Insurance',
      subtitle: 'Claim denials and coverage disputes',
      icon: 'shield-checkmark',
      gradient: ['#fa709a', '#fee140'],
      examples: ['Claim denial', 'Coverage dispute', 'Premium issues'],
    },
    {
      id: 'utility',
      title: 'Utilities',
      subtitle: 'Billing and service quality issues',
      icon: 'flash',
      gradient: ['#30cfd0', '#330867'],
      examples: ['Billing errors', 'Service outages', 'Meter issues'],
    },
  ];

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, steps.length - 1],
    outputRange: ['0%', '100%'],
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderCategorySelection();
      case 2:
        return renderDetailsForm();
      case 3:
        return renderEvidenceUpload();
      case 4:
        return renderReview();
      default:
        return null;
    }
  };

  const renderCategorySelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What type of dispute?</Text>
      <Text style={styles.stepSubtitle}>
        Choose the category that best matches your issue
      </Text>

      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.categoryCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setSelectedCategory(category.id)}
          >
            <LinearGradient
              colors={
                selectedCategory === category.id
                  ? category.gradient
                  : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryGradient}
            >
              {selectedCategory === category.id && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                </View>
              )}

              <View
                style={[
                  styles.categoryIcon,
                  selectedCategory === category.id && styles.categoryIconSelected,
                ]}
              >
                <Ionicons
                  name={category.icon}
                  size={28}
                  color={selectedCategory === category.id ? '#fff' : category.gradient[0]}
                />
              </View>

              <Text
                style={[
                  styles.categoryTitle,
                  selectedCategory === category.id && styles.categoryTitleSelected,
                ]}
              >
                {category.title}
              </Text>
              <Text
                style={[
                  styles.categorySubtitle,
                  selectedCategory === category.id && styles.categorySubtitleSelected,
                ]}
              >
                {category.subtitle}
              </Text>

              <View style={styles.categoryExamples}>
                {category.examples.slice(0, 2).map((example, index) => (
                  <View key={index} style={styles.exampleTag}>
                    <Text
                      style={[
                        styles.exampleText,
                        selectedCategory === category.id && styles.exampleTextSelected,
                      ]}
                    >
                      {example}
                    </Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDetailsForm = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tell us what happened</Text>
      <Text style={styles.stepSubtitle}>
        We'll use this info to build your claim
      </Text>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Flight Number</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="airplane-outline" size={20} color="rgba(255,255,255,0.5)" />
            <TextInput
              style={styles.input}
              placeholder="e.g., BA2847"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={formData.flightNumber}
              onChangeText={(text) => setFormData({ ...formData, flightNumber: text })}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Departure Date</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={20} color="rgba(255,255,255,0.5)" />
            <TextInput
              style={styles.input}
              placeholder="Dec 24, 2024"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={formData.departureDate}
              onChangeText={(text) => setFormData({ ...formData, departureDate: text })}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Delay Duration (hours)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.5)" />
            <TextInput
              style={styles.input}
              placeholder="e.g., 4.5"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="decimal-pad"
              value={formData.delayHours}
              onChangeText={(text) => setFormData({ ...formData, delayHours: text })}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Additional Details</Text>
          <View style={[styles.inputContainer, styles.textareaContainer]}>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe what happened, any communication with the airline, etc."
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              numberOfLines={6}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
          </View>
        </View>

        {/* AI Suggestion */}
        <View style={styles.aiSuggestion}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.15)', 'rgba(102, 126, 234, 0.05)']}
            style={styles.aiSuggestionGradient}
          >
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={20} color="#667eea" />
            </View>
            <View style={styles.aiContent}>
              <Text style={styles.aiTitle}>AI Suggestion</Text>
              <Text style={styles.aiText}>
                Based on EU261, you're likely eligible for €600 compensation
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );

  const renderEvidenceUpload = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Upload evidence</Text>
      <Text style={styles.stepSubtitle}>
        Add boarding passes, receipts, emails, or photos
      </Text>

      <View style={styles.uploadSection}>
        {/* Upload Zone */}
        <TouchableOpacity style={styles.uploadZone} activeOpacity={0.8}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.1)', 'rgba(102, 126, 234, 0.05)']}
            style={styles.uploadZoneGradient}
          >
            <View style={styles.uploadIcon}>
              <Ionicons name="cloud-upload-outline" size={48} color="#667eea" />
            </View>
            <Text style={styles.uploadTitle}>Tap to upload files</Text>
            <Text style={styles.uploadSubtitle}>
              PDF, JPG, PNG up to 10MB each
            </Text>
            <View style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>Browse Files</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Uploaded Files */}
        <View style={styles.uploadedFiles}>
          <Text style={styles.uploadedTitle}>Uploaded (2)</Text>

          <View style={styles.fileCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
              style={styles.fileGradient}
            >
              <View style={styles.fileIcon}>
                <Ionicons name="document-text" size={24} color="#667eea" />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>Boarding_Pass.pdf</Text>
                <Text style={styles.fileSize}>248 KB</Text>
              </View>
              <TouchableOpacity style={styles.fileAction}>
                <Ionicons name="close-circle" size={24} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.fileCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
              style={styles.fileGradient}
            >
              <View style={styles.fileIcon}>
                <Ionicons name="image" size={24} color="#f093fb" />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>Flight_Delay_Screen.jpg</Text>
                <Text style={styles.fileSize}>892 KB</Text>
              </View>
              <TouchableOpacity style={styles.fileAction}>
                <Ionicons name="close-circle" size={24} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color="#fbbf24" />
            <Text style={styles.tipsTitle}>Quick Tips</Text>
          </View>
          <Text style={styles.tipsText}>
            • Include your boarding pass or booking confirmation{'\n'}
            • Photos of departure boards showing delays{'\n'}
            • Any email or SMS from the airline
          </Text>
        </View>
      </View>
    </View>
  );

  const renderReview = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review & Submit</Text>
      <Text style={styles.stepSubtitle}>
        Double-check everything before we file your claim
      </Text>

      <View style={styles.reviewSection}>
        {/* Claim Summary */}
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryHeader}>
              <Ionicons name="airplane" size={32} color="#fff" />
              <Text style={styles.summaryType}>Flight Delay Compensation</Text>
            </View>

            <View style={styles.summaryAmount}>
              <Text style={styles.summaryLabel}>Estimated Compensation</Text>
              <Text style={styles.summaryValue}>€600</Text>
            </View>

            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Ionicons name="trending-up" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.summaryStatText}>94% success rate</Text>
              </View>
              <View style={styles.summaryStat}>
                <Ionicons name="time" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.summaryStatText}>7-14 days avg</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Details Review */}
        <View style={styles.detailsReview}>
          <Text style={styles.reviewSectionTitle}>Case Details</Text>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Flight Number</Text>
            <Text style={styles.reviewValue}>BA2847</Text>
          </View>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Departure Date</Text>
            <Text style={styles.reviewValue}>Dec 24, 2024</Text>
          </View>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Delay Duration</Text>
            <Text style={styles.reviewValue}>4.5 hours</Text>
          </View>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Evidence Files</Text>
            <Text style={styles.reviewValue}>2 files uploaded</Text>
          </View>
        </View>

        {/* What Happens Next */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.reviewSectionTitle}>What happens next?</Text>

          <View style={styles.nextStep}>
            <View style={styles.nextStepNumber}>
              <Text style={styles.nextStepNumberText}>1</Text>
            </View>
            <View style={styles.nextStepContent}>
              <Text style={styles.nextStepTitle}>We file your claim</Text>
              <Text style={styles.nextStepText}>
                Within 24 hours, we'll submit to the airline
              </Text>
            </View>
          </View>

          <View style={styles.nextStep}>
            <View style={styles.nextStepNumber}>
              <Text style={styles.nextStepNumberText}>2</Text>
            </View>
            <View style={styles.nextStepContent}>
              <Text style={styles.nextStepTitle}>Track progress</Text>
              <Text style={styles.nextStepText}>
                Get real-time updates via app notifications
              </Text>
            </View>
          </View>

          <View style={styles.nextStep}>
            <View style={styles.nextStepNumber}>
              <Text style={styles.nextStepNumberText}>3</Text>
            </View>
            <View style={styles.nextStepContent}>
              <Text style={styles.nextStepTitle}>Receive compensation</Text>
              <Text style={styles.nextStepText}>
                Money paid directly to your account
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

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
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Case</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        <View style={styles.stepsIndicator}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepIndicator}>
              <View
                style={[
                  styles.stepDot,
                  currentStep > index && styles.stepDotComplete,
                  currentStep === index + 1 && styles.stepDotActive,
                ]}
              >
                {currentStep > index + 1 ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      (currentStep === index + 1 || currentStep > index) &&
                        styles.stepNumberActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text style={styles.stepLabel}>{step.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderStepContent()}
        </Animated.View>
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <BlurView intensity={80} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.actionBarBlur}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextButton, currentStep === 1 && styles.nextButtonFull]}
            activeOpacity={0.9}
            onPress={handleNext}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length ? 'Submit Claim' : 'Continue'}
              </Text>
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
    top: -100,
    right: -150,
  },
  orb2: {
    width: 300,
    height: 300,
    backgroundColor: '#764ba2',
    bottom: 200,
    left: -100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepDotComplete: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  stepDotActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    borderColor: '#667eea',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  stepContent: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 28,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryCardSelected: {
    borderColor: 'rgba(102, 126, 234, 0.5)',
    borderWidth: 2,
  },
  categoryGradient: {
    padding: 20,
    position: 'relative',
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  categoryTitleSelected: {
    color: '#fff',
  },
  categorySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
  },
  categorySubtitleSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
  categoryExamples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exampleText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  exampleTextSelected: {
    color: 'rgba(255,255,255,0.95)',
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  textareaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  aiSuggestion: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  aiSuggestionGradient: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 4,
  },
  aiText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  uploadSection: {
    gap: 24,
  },
  uploadZone: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    borderStyle: 'dashed',
  },
  uploadZoneGradient: {
    padding: 40,
    alignItems: 'center',
  },
  uploadIcon: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.4)',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  uploadedFiles: {
    gap: 12,
  },
  uploadedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  fileCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  fileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  fileAction: {
    padding: 4,
  },
  tipsCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 14,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fbbf24',
  },
  tipsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  reviewSection: {
    gap: 24,
  },
  summaryCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 28,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },
  summaryAmount: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  summaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryStatText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  detailsReview: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  reviewLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  nextStepsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
  },
  nextStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  nextStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderWidth: 2,
    borderColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  nextStepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  nextStepText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
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
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  nextButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

export default NewCasePage;