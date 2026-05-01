import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DayLog } from '@/types';
import { useAppStore } from '@/hooks/useAppStore';
import { formatReadable } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import GradientButton from './GradientButton';

const MOOD_OPTIONS: { value: DayLog['mood']; emoji: string; label: string }[] = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'angry', emoji: '😤', label: 'Angry' },
];

interface DayLogFormProps {
  date: string;
  onClose: () => void;
  onDelete?: (date: string) => void;
  isSettingsMode?: boolean;
}

const DayLogForm: React.FC<DayLogFormProps> = ({ date, onClose, onDelete, isSettingsMode = false }) => {
  const { dayLogs, saveDayLog, cycleData, saveCycleData, user } = useAppStore();
  const hasExistingLog = dayLogs.some(l => l.date === date);
  const [periodStartDate, setPeriodStartDate] = useState<string>(
    cycleData?.periodStartDate || new Date().toISOString().split('T')[0]
  );
  const [periodLength, setPeriodLength] = useState<string>(
    cycleData?.periodLength.toString() || '5'
  );
  const [cycleLength, setCycleLength] = useState<string>(
    cycleData?.cycleLength.toString() || '28'
  );
  const [log, setLog] = useState<DayLog>({
    date,
    flow: null,
    pain: 0,
    mood: null,
    symptoms: [],
    notes: '',
  });
  
  // Common symptoms with emojis
  const commonSymptoms: { symptom: string; emoji: string }[] = [
    { symptom: 'Headache', emoji: '🤕' },
    { symptom: 'Cramps', emoji: '😣' },
    { symptom: 'Bloating', emoji: '🤰' },
    { symptom: 'Fatigue', emoji: '😴' },
    { symptom: 'Breast tenderness', emoji: '💜' },
    { symptom: 'Acne', emoji: '✨' },
    { symptom: 'Nausea', emoji: '🤢' },
    { symptom: 'Mood swings', emoji: '🎭' },
    { symptom: 'Cravings', emoji: '🍫' },
    { symptom: 'Insomnia', emoji: '🌙' },
  ];
  
  useEffect(() => {
    // Load existing log if available
    const existingLog = dayLogs.find(l => l.date === date);
    if (existingLog) {
      setLog(existingLog);
    } else {
      setLog({
        date,
        flow: null,
        pain: 0,
        mood: null,
        symptoms: [],
        notes: '',
      });
    }
  }, [date, dayLogs]);
  
  const handleSave = async () => {
    if (isSettingsMode) {
      // Save cycle data when in settings mode
      const periodLengthNum = parseInt(periodLength, 10);
      const cycleLengthNum = parseInt(cycleLength, 10);
      
      if (!isNaN(periodLengthNum) && !isNaN(cycleLengthNum) && cycleData) {
        await saveCycleData({
          ...cycleData,
          periodStartDate,
          periodLength: periodLengthNum,
          cycleLength: cycleLengthNum,
          lastUpdated: new Date().toISOString().split('T')[0],
        });
      }
    } else {
      await saveDayLog(log);
    }
    onClose();
  };
  
  const toggleSymptom = (symptom: string) => {
    if (log.symptoms?.includes(symptom)) {
      setLog({
        ...log,
        symptoms: log.symptoms.filter(s => s !== symptom),
      });
    } else {
      setLog({
        ...log,
        symptoms: [...(log.symptoms || []), symptom],
      });
    }
  };
  
  if (isSettingsMode) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Update Cycle Information</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last Period Start Date</Text>
          <TextInput
            style={styles.dateInput}
            value={periodStartDate}
            onChangeText={setPeriodStartDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Period Length (days)</Text>
          <TextInput
            style={styles.numberInput}
            value={periodLength}
            onChangeText={setPeriodLength}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cycle Length (days)</Text>
          <TextInput
            style={styles.numberInput}
            value={cycleLength}
            onChangeText={setCycleLength}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <GradientButton
            title="Save Changes"
            onPress={handleSave}
            style={styles.saveButton}
            testID="save-cycle-settings"
          />
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flow</Text>
        <View style={styles.flowButtons}>
          <TouchableOpacity
            style={[styles.flowButton, log.flow === 'light' && styles.flowButtonActive]}
            onPress={() => setLog({ ...log, flow: 'light' })}
            activeOpacity={0.85}
          >
            {log.flow === 'light' ? (
              <LinearGradient colors={[Colors.primary, '#FF8FB3']} style={StyleSheet.absoluteFill} />
            ) : null}
            <Text style={[styles.flowButtonText, log.flow === 'light' && styles.flowButtonTextActive]}>Light</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flowButton, log.flow === 'medium' && styles.flowButtonActive]}
            onPress={() => setLog({ ...log, flow: 'medium' })}
            activeOpacity={0.85}
          >
            {log.flow === 'medium' ? (
              <LinearGradient colors={[Colors.primary, '#FF8FB3']} style={StyleSheet.absoluteFill} />
            ) : null}
            <Text style={[styles.flowButtonText, log.flow === 'medium' && styles.flowButtonTextActive]}>Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flowButton, log.flow === 'heavy' && styles.flowButtonActive]}
            onPress={() => setLog({ ...log, flow: 'heavy' })}
            activeOpacity={0.85}
          >
            {log.flow === 'heavy' ? (
              <LinearGradient colors={[Colors.primary, '#FF8FB3']} style={StyleSheet.absoluteFill} />
            ) : null}
            <Text style={[styles.flowButtonText, log.flow === 'heavy' && styles.flowButtonTextActive]}>Heavy</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pain Level</Text>
        <View style={styles.painSlider}>
          {[0, 1, 2, 3, 4].map(level => (
            <TouchableOpacity
              key={level}
              style={[styles.painLevel, log.pain === level && styles.painLevelActive]}
              onPress={() => setLog({ ...log, pain: level })}
              activeOpacity={0.85}
            >
              <Text style={[styles.painLevelText, log.pain === level && styles.painLevelTextActive]}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.painLabels}>
          <Text style={styles.painLabelText}>None</Text>
          <Text style={styles.painLabelText}>Severe</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood</Text>
        <View style={styles.moodButtons}>
          {MOOD_OPTIONS.map(({ value, emoji, label }) => (
            <TouchableOpacity
              key={value}
              style={[styles.moodButton, log.mood === value && styles.moodButtonActive]}
              onPress={() => setLog({ ...log, mood: value })}
              activeOpacity={0.85}
            >
              <Text style={styles.moodEmoji}>{emoji}</Text>
              <Text style={[styles.moodButtonText, log.mood === value && styles.moodButtonTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Symptoms</Text>
        <View style={styles.symptomsContainer}>
          {commonSymptoms.map(({ symptom, emoji }) => (
            <TouchableOpacity
              key={symptom}
              style={[
                styles.symptomButton,
                log.symptoms?.includes(symptom) && styles.symptomButtonActive
              ]}
              onPress={() => toggleSymptom(symptom)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.symptomButtonText,
                  log.symptoms?.includes(symptom) && styles.symptomButtonTextActive
                ]}
              >
                {emoji} {symptom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
          style={styles.notesInput}
          multiline
          placeholder="Add any additional notes here..."
          placeholderTextColor={Colors.lightText}
          value={log.notes}
          onChangeText={(text) => setLog({ ...log, notes: text })}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <GradientButton
          title="Save"
          onPress={handleSave}
          style={styles.saveButton}
          testID="save-log-button"
        />
        {hasExistingLog && onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              onDelete(date);
              onClose();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.deleteButtonText}>Delete log</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.08)',
    ...Platform.select({
      ios: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: spacing.base,
    letterSpacing: 0.2,
  },
  flowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  flowButton: {
    flex: 1,
    paddingVertical: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,107,157,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  flowButtonActive: {
    borderColor: Colors.primary,
  },
  flowButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  flowButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  painSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  painLevel: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 52,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'rgba(255,107,157,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  painLevelActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  painLevelText: {
    color: Colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  painLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  painLevelTextActive: {
    color: '#FFFFFF',
  },
  painLabelText: {
    fontSize: 12,
    color: Colors.lightText,
    fontWeight: '600',
  },
  moodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,107,157,0.35)',
    minWidth: '18%',
  },
  moodEmoji: {
    fontSize: 34,
    marginBottom: spacing.xs,
  },
  moodButtonActive: {
    backgroundColor: 'rgba(255,107,157,0.12)',
    borderColor: Colors.primary,
  },
  moodButtonText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  moodButtonTextActive: {
    color: Colors.text,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  symptomButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,107,157,0.3)',
  },
  symptomButtonActive: {
    backgroundColor: 'rgba(255,107,157,0.15)',
    borderColor: Colors.primary,
  },
  symptomButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  symptomButtonTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  notesInput: {
    borderWidth: 2,
    borderColor: 'rgba(255,107,157,0.2)',
    borderRadius: radius.lg,
    padding: spacing.base,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: Colors.text,
  },
  dateInput: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  numberInput: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContainer: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  saveButton: {
    marginBottom: spacing.base,
    ...Platform.select({
      ios: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(244,67,54,0.1)',
  },
  deleteButtonText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cancelButtonText: {
    color: Colors.lightText,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default DayLogForm;