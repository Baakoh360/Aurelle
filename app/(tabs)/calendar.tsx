import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, Platform, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/hooks/useAppStore';
import { formatReadable } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import CalendarView from '@/components/CalendarView';
import DayLogForm from '@/components/DayLogForm';
import { X, Clock, TrendingUp, CalendarDays, Trash2 } from 'lucide-react-native';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { dayLogs, deleteDayLog } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const selectedDayLog = selectedDate ? dayLogs.find(log => log.date === selectedDate) : null;
  const contentBottom = insets.bottom + 20;
  const headerPaddingTop = insets.top + spacing.sm;
  const recentLogsListHeight = Math.max(280, Dimensions.get('window').height * 0.35);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#FF6B9D', '#D873C9', '#9D71E8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: headerPaddingTop }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.2)']}
              style={styles.headerIconWrap}
            >
              <CalendarDays size={24} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Calendar</Text>
              <Text style={styles.headerSubtitle}>Track your cycle</Text>
            </View>
          </View>
          <View style={styles.datePill}>
            <Text style={styles.datePillText}>{formatReadable(new Date())}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentScroll, { paddingHorizontal: spacing.xl, paddingBottom: contentBottom }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <CalendarView onDayPress={handleDayPress} />

        <LinearGradient
          colors={['#FFFFFF', '#FFF8FC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.recentLogsContainer}
        >
          <View style={styles.sectionHeader}>
            <Clock size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Recent Logs</Text>
            <View style={styles.logCount}>
              <Text style={styles.logCountText}>{dayLogs.length}</Text>
            </View>
          </View>

          <View style={[styles.logsListWrap, { height: recentLogsListHeight }]}>
            <ScrollView
              style={styles.logsList}
              contentContainerStyle={styles.logsListContent}
              showsVerticalScrollIndicator={true}
            >
          {dayLogs.length > 0 ? (
            dayLogs
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(log => (
                <TouchableOpacity
                  key={log.date}
                  style={styles.logItem}
                  onPress={() => handleDayPress(log.date)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#FFF5F9']}
                    style={styles.logItemGradient}
                  >
                    <View style={styles.logHeader}>
                      <Text style={styles.logDate}>{formatReadable(log.date)}</Text>
                      <View style={styles.logHeaderRight}>
                        {log.flow && (
                        <LinearGradient
                          colors={
                            log.flow === 'light' ? ['#FFE5F1', '#FFF0F7'] :
                            log.flow === 'medium' ? ['#FF6B9D', '#FF8FB3'] :
                            ['#E91E63', '#F06292']
                          }
                          style={styles.flowBadge}
                        >
                          <Text style={[
                            styles.flowText,
                            log.flow !== 'light' && styles.whiteText
                          ]}>{log.flow}</Text>
                        </LinearGradient>
                      )}
                        <TouchableOpacity
                          style={styles.logDeleteBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            Alert.alert(
                              'Delete log',
                              `Remove log for ${formatReadable(log.date)}?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', style: 'destructive', onPress: async () => {
                                  await deleteDayLog(log.date);
                                  if (selectedDate === log.date) closeModal();
                                }},
                              ]
                            );
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Trash2 size={18} color={Colors.lightText} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.logDetails}>
                      {log.mood && (
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Mood:</Text>
                          <Text style={styles.detailValue}>{log.mood}</Text>
                        </View>
                      )}
                      
                      {log.pain !== undefined && log.pain > 0 && (
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Pain:</Text>
                          <Text style={styles.detailValue}>{log.pain}/4</Text>
                        </View>
                      )}
                      
                      {log.symptoms && log.symptoms.length > 0 && (
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Symptoms:</Text>
                          <Text style={styles.detailValue} numberOfLines={1}>
                            {log.symptoms.join(', ')}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    {log.notes && (
                      <Text style={styles.logNotes} numberOfLines={2}>
                        {log.notes}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))
          ) : (
            <View style={styles.emptyContainer}>
              <TrendingUp size={48} color={Colors.lightText} />
              <Text style={styles.emptyText}>
                No logs yet. Tap on a day to add a log.
              </Text>
            </View>
          )}
            </ScrollView>
          </View>
        </LinearGradient>
      </ScrollView>
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <LinearGradient
            colors={['#FFFFFF', '#FFF5F9', '#FFF0F8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.modalContent, { paddingBottom: insets.bottom || spacing.xl }]}
          >
            <View style={styles.modalHandleWrap}>
              <View style={styles.modalHandle} />
            </View>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {selectedDate ? formatReadable(selectedDate) : ''}
                </Text>
                <Text style={styles.modalSubtitle}>Log your day</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#FF6B9D', '#9D71E8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.closeButtonGradient}
                >
                  <X size={20} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {selectedDate && (
              <View style={styles.modalFormWrap}>
                <DayLogForm
                  date={selectedDate}
                  onClose={closeModal}
                  onDelete={(dateToDelete) => {
                    deleteDayLog(dateToDelete);
                    closeModal();
                  }}
                />
              </View>
            )}
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  header: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  datePill: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.full,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  datePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    paddingTop: spacing.base,
  },
  recentLogsContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    minHeight: 380,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 18 },
      android: { elevation: 4 },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginLeft: spacing.base,
    flex: 1,
    letterSpacing: 0.2,
  },
  logCount: {
    backgroundColor: Colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 32,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  logCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  logsListWrap: {
    marginTop: spacing.xs,
  },
  logsList: {
    flex: 1,
  },
  logsListContent: {
    paddingBottom: spacing.lg,
  },
  logItem: {
    marginBottom: spacing.base,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  logItemGradient: {
    padding: spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logDeleteBtn: {
    padding: spacing.xs,
  },
  logDate: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  flowBadge: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  flowText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: 0.2,
  },
  whiteText: {
    color: '#FFFFFF',
  },
  logDetails: {
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.lightText,
    fontWeight: '700',
    marginRight: spacing.base,
    minWidth: 70,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  logNotes: {
    fontSize: 13,
    color: Colors.lightText,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.lightText,
    marginTop: spacing.lg,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    minHeight: '72%',
    maxHeight: '90%',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.22, shadowRadius: 20 },
      android: { elevation: 16 },
    }),
  },
  modalFormWrap: {
    flex: 1,
    minHeight: 320,
  },
  modalHandleWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,107,157,0.15)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.lightText,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  closeButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});