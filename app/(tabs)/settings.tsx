import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';
import { useChatStore } from '@/hooks/useChatStore';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import GradientButton from '@/components/GradientButton';
import { Calendar, Trash2, X, LogOut, Edit3, ChevronRight, Settings } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO, addDays } from '@/utils/dateUtils';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, cycleData, saveCycleData, saveUser, logout } = useAppStore();
  const { clearMessages } = useChatStore();

  const [periodModalVisible, setPeriodModalVisible] = useState<boolean>(false);
  const [quickEditModalVisible, setQuickEditModalVisible] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [nameEditModalVisible, setNameEditModalVisible] = useState<boolean>(false);
  const [nameEditValue, setNameEditValue] = useState<string>('');

  useEffect(() => {
    if (cycleData?.periodStartDate) {
      setPeriodStartDate(parseISO(cycleData.periodStartDate)); // start date for Period & Cycle modal
    }
    if (cycleData?.periodLength != null) {
      setPeriodLength(String(cycleData.periodLength));
    }
    if (cycleData?.cycleLength != null) {
      setCycleLength(String(cycleData.cycleLength));
    }
  }, [cycleData]);

  const [periodStartDate, setPeriodStartDate] = useState<Date>(() => {
    try {
      if (cycleData?.periodStartDate) {
        return parseISO(cycleData.periodStartDate); // start date for Period & Cycle modal
      }
    } catch (_) { /* invalid date */ }
    return new Date();
  });
  const [periodLength, setPeriodLength] = useState<string>(
    cycleData ? cycleData.periodLength.toString() : '5'
  );
  const [cycleLength, setCycleLength] = useState<string>(
    cycleData ? cycleData.cycleLength.toString() : '28'
  );

  const handleSavePeriodSettings = () => {
    const periodLengthNum = parseInt(periodLength, 10);
    const cycleLengthNum = parseInt(cycleLength, 10);
    if (isNaN(periodLengthNum) || isNaN(cycleLengthNum)) return;

    const clampedPeriodLength = Math.min(10, Math.max(1, periodLengthNum));
    const clampedCycleLength = Math.min(45, Math.max(21, cycleLengthNum));
    const periodStart = periodStartDate; // state is start date in Period & Cycle modal
    const dateStr = format(periodStart, 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isFuture = dateStr > todayStr;
    const safeDateStr = isFuture ? todayStr : dateStr;

    const updatedCycleData = {
      ...(cycleData ?? {
        periodStartDate: todayStr,
        periodLength: 5,
        cycleLength: 28,
        lastUpdated: todayStr,
      }),
      periodStartDate: safeDateStr,
      periodLength: clampedPeriodLength,
      cycleLength: clampedCycleLength,
      lastUpdated: todayStr,
    };

    saveCycleData(updatedCycleData);
    setPeriodLength(String(clampedPeriodLength));
    setCycleLength(String(clampedCycleLength));
    setPeriodModalVisible(false);
    setShowDatePicker(false);
  };
  
  const handleClearChatHistory = () => {
    clearMessages();
  };
  
  const handleLogout = async () => {
    clearMessages();
    await logout();
    router.replace('/');
  };

  const openNameEditModal = () => {
    setNameEditValue(user?.name ?? '');
    setNameEditModalVisible(true);
  };

  const handleSaveName = () => {
    const trimmed = nameEditValue.trim();
    if (trimmed && user) {
      saveUser({ ...user, name: trimmed });
      setNameEditModalVisible(false);
    }
  };
  
  const handleQuickEditPeriodDate = () => {
    if (cycleData?.periodStartDate) {
      try {
        const start = parseISO(cycleData.periodStartDate);
        setPeriodStartDate(addDays(start, (cycleData.periodLength ?? 5) - 1)); // show end date
      } catch (_) {
        setPeriodStartDate(new Date());
      }
      setQuickEditModalVisible(true);
    }
  };
  
  const handleSaveQuickEdit = () => {
    // periodStartDate state holds end date; convert to start for store
    const periodEnd = periodStartDate;
    const startDate = addDays(periodEnd, -((cycleData?.periodLength ?? 5) - 1));
    const dateStr = format(startDate, 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const safeDateStr = dateStr > todayStr ? todayStr : dateStr;

    const updatedCycleData = {
      ...(cycleData ?? {
        periodLength: 5,
        cycleLength: 28,
        lastUpdated: todayStr,
      }),
      periodStartDate: safeDateStr,
      lastUpdated: todayStr,
    };

    saveCycleData(updatedCycleData);
    setQuickEditModalVisible(false);
  };
  
  const onDateChange = (event: any, selectedDate?: Date) => {
    const isClosing = event.type === 'dismissed';
    setShowDatePicker(Platform.OS === 'ios' && !isClosing);
    if (selectedDate && !isClosing) {
      setPeriodStartDate(selectedDate);
    }
  };
  
  const insets = useSafeAreaInsets();
  const headerPaddingTop = insets.top + spacing.sm;
  const contentBottom = insets.bottom + 28;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.lightBackground, '#FFFFFF', Colors.lightBackground]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['#FF6B9D', '#E06BA8', '#C96BB8', '#9D71E8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: headerPaddingTop }]}
      >
        <View style={styles.headerInner}>
          <View style={styles.headerIconPill}>
            <Settings size={22} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Your account & cycle</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: contentBottom }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* Profile */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={openNameEditModal}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarWrap}
          >
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Signed in as</Text>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName}>{user?.name || 'Not set'}</Text>
              <Edit3 size={18} color={Colors.primary} strokeWidth={2} style={styles.profileEditIcon} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Cycle */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Cycle</Text>
          {cycleData && (
            <TouchableOpacity style={styles.row} onPress={handleQuickEditPeriodDate} activeOpacity={0.7}>
              <View style={[styles.rowIconWrap, { backgroundColor: Colors.period + '22' }]}>
                <Calendar size={20} color={Colors.period} strokeWidth={2} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Last period ended</Text>
                <Text style={styles.rowValue}>{format(addDays(parseISO(cycleData.periodStartDate), (cycleData.periodLength ?? 5) - 1), 'EEE, MMM d, yyyy')}</Text>
              </View>
              <ChevronRight size={20} color={Colors.lightText} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.row, !cycleData && styles.rowFirst]}
            onPress={() => {
              if (cycleData) {
                if (cycleData.periodStartDate) {
                  try { setPeriodStartDate(parseISO(cycleData.periodStartDate)); } catch (_) { setPeriodStartDate(new Date()); }
                }
                if (cycleData.periodLength != null) setPeriodLength(String(cycleData.periodLength));
                if (cycleData.cycleLength != null) setCycleLength(String(cycleData.cycleLength));
              }
              setPeriodModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.rowIconWrap, { backgroundColor: Colors.secondary + '22' }]}>
              <Calendar size={20} color={Colors.secondary} strokeWidth={2} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Period & cycle details</Text>
              <Text style={styles.rowValue}>Date, period length, cycle length</Text>
            </View>
            <ChevronRight size={20} color={Colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Data & account */}
        <View style={styles.dataBlock}>
          <Text style={styles.blockTitle}>Data & account</Text>
          <Text style={styles.blockSubtitle}>Manage your data and sign out</Text>

          <TouchableOpacity style={styles.dataRow} onPress={handleClearChatHistory} activeOpacity={0.7}>
            <View style={styles.dataRowIconWrap}>
              <Trash2 size={22} color={Colors.tertiary} strokeWidth={2} />
            </View>
            <View style={styles.dataRowContent}>
              <Text style={styles.dataRowLabel}>Clear chat history</Text>
              <Text style={styles.dataRowValue}>Remove all AI conversation history</Text>
            </View>
            <ChevronRight size={20} color={Colors.lightText} strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.dangerDivider} />
          <TouchableOpacity style={styles.dangerRow} onPress={handleLogout} activeOpacity={0.7}>
            <View style={styles.dangerRowIconWrap}>
              <LogOut size={22} color={Colors.error} strokeWidth={2} />
            </View>
            <View style={styles.dangerRowContent}>
              <Text style={styles.dangerRowLabel}>Log out</Text>
              <Text style={styles.dangerRowValue}>Sign out and clear all local data</Text>
            </View>
            <ChevronRight size={20} color={Colors.error} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerAppName}>Aurelle</Text>
          <Text style={styles.footerPrivacy}>Your data stays on your device</Text>
          <Text style={styles.footerByline}>By Nana Baako Tech Studios</Text>
        </View>
      </ScrollView>
      
      {/* Period Settings Modal — KeyboardAvoidingView so inputs stay visible when keyboard opens */}
      <Modal
        visible={periodModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setPeriodModalVisible(false);
          setShowDatePicker(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        >
          <View style={[styles.modalContent, { paddingBottom: insets.bottom || spacing.xl }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Period & Cycle Settings</Text>
              <TouchableOpacity
                onPress={() => {
                  setPeriodModalVisible(false);
                  setShowDatePicker(false);
                }}
                style={styles.closeButton}
              >
                <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.closeButtonGradient}>
                  <X size={20} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Last Period Start Date</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dateText}>
                    {format(periodStartDate, 'MMMM d, yyyy')}
                  </Text>
                  <Calendar size={20} color={Colors.primary} style={styles.dateInputIcon} />
                </TouchableOpacity>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Period Length (days)</Text>
                <TextInput
                  style={styles.numberInput}
                  value={periodLength}
                  onChangeText={setPeriodLength}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cycle Length (days)</Text>
                <TextInput
                  style={styles.numberInput}
                  value={cycleLength}
                  onChangeText={setCycleLength}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              
              <GradientButton
                title="Save Changes"
                onPress={handleSavePeriodSettings}
                style={styles.saveButton}
                testID="save-period-settings"
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit name modal — KeyboardAvoidingView so keyboard doesn't cover content */}
      <Modal
        visible={nameEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNameEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        >
          <View style={[styles.modalContent, { paddingBottom: insets.bottom || spacing.xl }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit name</Text>
              <TouchableOpacity onPress={() => setNameEditModalVisible(false)} style={styles.closeButton}>
                <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.closeButtonGradient}>
                  <X size={20} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Your name</Text>
                <TextInput
                  style={[styles.textInput, { color: Colors.text }]}
                  value={nameEditValue}
                  onChangeText={setNameEditValue}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.lightText}
                  autoCapitalize="words"
                  maxLength={50}
                  keyboardAppearance="light"
                  selectionColor={Colors.primary}
                />
              </View>
              <GradientButton
                title="Save"
                onPress={handleSaveName}
                style={styles.saveButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Edit Last Period – calendar on same popup, then Save */}
      <Modal
        visible={quickEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setQuickEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom || spacing.xl }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Last Period End Date</Text>
              <TouchableOpacity onPress={() => setQuickEditModalVisible(false)} style={styles.closeButton}>
                <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.closeButtonGradient}>
                  <X size={20} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.calendarWrap}>
                <DateTimePicker
                  value={periodStartDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              </View>
              <GradientButton
                title="Save"
                onPress={handleSaveQuickEdit}
                style={styles.saveButton}
                testID="save-quick-edit"
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Date Picker only for full Period & Cycle modal (when you tap the date there) */}
      {showDatePicker && periodModalVisible && (
        <DateTimePicker
          value={periodStartDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  header: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  headerIconPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    ...Platform.select({
      ios: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
      android: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
    }),
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...Platform.select({
      ios: { padding: spacing.xl, marginBottom: spacing.xxl },
      android: { padding: spacing.xl, marginBottom: spacing.xxl },
    }),
    borderWidth: 1,
    borderColor: Colors.primary + '18',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 18 },
      android: { elevation: 4 },
    }),
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  profileInfo: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.lightText,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  profileEditIcon: {
    marginLeft: spacing.sm,
  },
  block: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary + '12',
    ...Platform.select({
      ios: { marginBottom: spacing.xxl },
      android: { marginBottom: spacing.xxl },
    }),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 14 },
      android: { elevation: 3 },
    }),
  },
  blockTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.lightText,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
    ...Platform.select({
      ios: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.base },
      android: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.base },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    ...Platform.select({
      ios: { minHeight: 60, paddingVertical: spacing.base, paddingHorizontal: spacing.xl },
      android: { minHeight: 60, paddingVertical: spacing.base, paddingHorizontal: spacing.xl },
    }),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  rowIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  rowContent: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.lightText,
    marginTop: 2,
  },
  rowChevron: {
    marginLeft: spacing.xs,
  },
  dataBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary + '12',
    paddingBottom: spacing.base,
    ...Platform.select({
      ios: { marginBottom: spacing.xxl, paddingBottom: spacing.lg },
      android: { marginBottom: spacing.xxl, paddingBottom: spacing.lg },
    }),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 14 },
      android: { elevation: 3 },
    }),
  },
  blockSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.lightText,
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing.base,
    marginTop: -4,
    ...Platform.select({
      ios: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
      android: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
    }),
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    ...Platform.select({
      ios: { minHeight: 68, paddingVertical: spacing.base, paddingHorizontal: spacing.xl },
      android: { minHeight: 68, paddingVertical: spacing.base, paddingHorizontal: spacing.xl },
    }),
  },
  dataRowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: Colors.tertiary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  dataRowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  dataRowLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  dataRowValue: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.lightText,
    marginTop: 2,
  },
  dangerDivider: {
    height: 1,
    backgroundColor: Colors.error + '20',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    ...Platform.select({
      ios: { marginVertical: spacing.base },
      android: { marginVertical: spacing.base },
    }),
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: Colors.error + '08',
    marginHorizontal: spacing.base,
    marginBottom: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.error + '18',
    ...Platform.select({
      ios: { minHeight: 68, paddingVertical: spacing.base, paddingHorizontal: spacing.xl, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
      android: { minHeight: 68, paddingVertical: spacing.base, paddingHorizontal: spacing.xl, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
    }),
  },
  dangerRowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: Colors.error + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  dangerRowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  dangerRowLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
    letterSpacing: 0.2,
  },
  dangerRowValue: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.error,
    opacity: 0.85,
    marginTop: 2,
  },
  footer: {
    marginTop: spacing.lg,
    marginBottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    ...Platform.select({
      ios: { marginTop: spacing.xxl, paddingHorizontal: spacing.xxl },
      android: { marginTop: spacing.xxl, paddingHorizontal: spacing.xxl },
    }),
  },
  footerDivider: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary + '30',
    marginBottom: spacing.sm,
  },
  footerAppName: {
    fontSize: 13,
    color: Colors.lightText,
    fontWeight: '700',
    marginBottom: 2,
  },
  footerPrivacy: {
    fontSize: 12,
    color: Colors.lightText,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 4,
  },
  footerByline: {
    fontSize: 12,
    color: Colors.lightText,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    maxHeight: '88%',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.18, shadowRadius: 20 },
      android: { elevation: 20 },
    }),
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  closeButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  closeButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.primary + '25',
    borderRadius: radius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    backgroundColor: Colors.lightBackground,
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  dateInputIcon: {
    opacity: 0.8,
    marginLeft: spacing.sm,
  },
  calendarWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  numberInput: {
    borderWidth: 2,
    borderColor: Colors.primary + '25',
    borderRadius: radius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    backgroundColor: Colors.lightBackground,
    color: Colors.text,
  },
  textInput: {
    borderWidth: 2,
    borderColor: Colors.primary + '25',
    borderRadius: radius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    backgroundColor: Colors.lightBackground,
    color: Colors.text,
  },
  saveButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxxl,
  },
});