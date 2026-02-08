// app/new-claim.tsx - New Claim Wizard Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function NewClaimScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, label: 'Details' },
    { number: 2, label: 'Evidence' },
    { number: 3, label: 'Review' },
    { number: 4, label: 'Submit' },
  ];

  const [formData, setFormData] = useState({
    flightNumber: 'BA456',
    flightDate: '2026-01-15',
    departureAirport: 'London Heathrow (LHR)',
    arrivalAirport: 'Frankfurt (FRA)',
    issueType: 'Flight was delayed',
    scheduledDeparture: '14:30',
    actualDeparture: '19:05',
    reason: 'Technical issues with the aircraft',
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Claim</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <View style={styles.stepContainer}>
                <View
                  style={[
                    styles.stepCircle,
                    currentStep >= step.number && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      currentStep >= step.number && styles.stepNumberActive,
                    ]}
                  >
                    {step.number}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    currentStep >= step.number && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepConnector,
                    currentStep > step.number && styles.stepConnectorActive,
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Flight Delay Compensation Claim</Text>
          <Text style={styles.subtitle}>Let's gather the details of your flight disruption</Text>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Flight Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.flightNumber}
                  onChangeText={(text) => setFormData({ ...formData, flightNumber: text })}
                  placeholder="e.g., LH1234"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Flight Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.flightDate}
                  onChangeText={(text) => setFormData({ ...formData, flightDate: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6B7280"
                />
              </View>
            </View>

            <View style={styles.formGroupFull}>
              <Text style={styles.label}>Departure Airport</Text>
              <TextInput
                style={styles.input}
                value={formData.departureAirport}
                onChangeText={(text) => setFormData({ ...formData, departureAirport: text })}
                placeholder="e.g., London Heathrow"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.formGroupFull}>
              <Text style={styles.label}>Arrival Airport</Text>
              <TextInput
                style={styles.input}
                value={formData.arrivalAirport}
                onChangeText={(text) => setFormData({ ...formData, arrivalAirport: text })}
                placeholder="e.g., Paris CDG"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.formGroupFull}>
              <Text style={styles.label}>What happened?</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>{formData.issueType}</Text>
                <Text style={styles.pickerIcon}>▼</Text>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Scheduled Departure</Text>
                <TextInput
                  style={styles.input}
                  value={formData.scheduledDeparture}
                  onChangeText={(text) => setFormData({ ...formData, scheduledDeparture: text })}
                  placeholder="HH:MM"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Actual Departure</Text>
                <TextInput
                  style={styles.input}
                  value={formData.actualDeparture}
                  onChangeText={(text) => setFormData({ ...formData, actualDeparture: text })}
                  placeholder="HH:MM"
                  placeholderTextColor="#6B7280"
                />
              </View>
            </View>

            <View style={styles.formGroupFull}>
              <Text style={styles.label}>Reason Given (if any)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.reason}
                onChangeText={(text) => setFormData({ ...formData, reason: text })}
                placeholder="What reason did the airline provide?"
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>ℹ️</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Estimated Compensation: €600</Text>
              <Text style={styles.infoText}>
                Based on EU Regulation 261/2004, flights over 1500km delayed by 3+ hours qualify
                for €600 compensation.
              </Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.saveDraftButton}>
            <Text style={styles.saveDraftText}>Save Draft</Text>
          </TouchableOpacity>

          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonDisabled]}
              disabled={currentStep === 1}
            >
              <Text style={styles.navButtonTextDisabled}>← Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButtonPrimary}
              onPress={() => setCurrentStep(currentStep + 1)}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.navButtonGradient}
              >
                <Text style={styles.navButtonPrimaryText}>Upload Evidence →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  stepLabelActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 8,
    marginBottom: 30,
  },
  stepConnectorActive: {
    backgroundColor: '#6366F1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroup: {
    flex: 1,
    marginBottom: 20,
  },
  formGroupFull: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  pickerIcon: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoIconText: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
  },
  bottomActions: {
    backgroundColor: 'rgba(19, 24, 37, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  saveDraftButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveDraftText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  navButtonDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  navButtonTextDisabled: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  navButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  navButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  navButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
