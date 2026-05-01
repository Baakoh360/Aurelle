import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  Image,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppStore } from '@/hooks/useAppStore';
import GradientButton from '@/components/GradientButton';
import Colors from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import { format, addDays } from '@/utils/dateUtils';
import { Heart, Shield, Calendar, ChevronRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Step = 'name' | 'period-question' | 'period-form' | 'skip-message';

export default function OnboardingScreen() {
  const router = useRouter();
  const { saveUser, saveCycleData } = useAppStore();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [periodEndDate, setPeriodEndDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 5);
    return d;
  });
  const [periodLength, setPeriodLength] = useState<string>('5');
  const [cycleLength, setCycleLength] = useState<string>('28');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const nameScale = useRef(new Animated.Value(0.6)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  // Dark mode colors
  const dm = {
    formBg1: isDark ? 'rgba(28,28,30,0.97)' : 'rgba(255,255,255,0.95)',
    formBg2: isDark ? 'rgba(36,36,38,0.95)' : 'rgba(255,255,255,0.9)',
    text: isDark ? '#F2F2F7' : Colors.text,
    lightText: isDark ? '#AEAEB2' : Colors.lightText,
    inputBg: isDark ? '#2C2C2E' : '#FFFFFF',
    inputBorder: isDark ? '#3A3A3C' : Colors.border,
    inputText: isDark ? '#F2F2F7' : Colors.text,
    dateInputBg: isDark ? '#2C2C2E' : Colors.lightBackground,
    dateInputBorder: isDark ? Colors.primary + '55' : Colors.primary + '25',
    choicePrimaryBg: isDark ? Colors.primary + '25' : Colors.primary + '18',
    choicePrimaryBorder: isDark ? Colors.primary + '55' : Colors.primary + '35',
    choiceSecondaryBg: isDark ? '#2C2C2E' : Colors.lightBackground,
    choiceSecondaryBorder: isDark ? '#3A3A3C' : Colors.border,
    skipIconBg: isDark ? Colors.primary + '30' : Colors.primary + '22',
    privacyText: isDark ? '#AEAEB2' : Colors.lightText,
  };

  useEffect(() => {
    if (step === 'name') {
      nameScale.setValue(0.6);
      nameOpacity.setValue(0);
      formOpacity.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(nameScale, {
              toValue: 1.05,
              duration: 500,
              easing: Easing.out(Easing.back(1.4)),
              useNativeDriver: true,
            }),
            Animated.timing(nameOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(nameScale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(450),
          Animated.timing(formOpacity, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      nameScale.setValue(1);
      nameOpacity.setValue(1);
      formOpacity.setValue(0);
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [step, nameScale, nameOpacity, formOpacity]);

  const handleNameContinue = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await saveUser({ name: name.trim(), isPregnant: false });
      setStep('period-question');
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYesPeriod = () => {
    setStep('period-form');
  };

  const handleSkipPeriod = () => {
    setStep('skip-message');
  };

  const handlePeriodFormContinue = async () => {
    const periodLengthNum = parseInt(periodLength, 10);
    const cycleLengthNum = parseInt(cycleLength, 10);
    if (isNaN(periodLengthNum) || isNaN(cycleLengthNum)) return;

    const clampedPeriod = Math.min(10, Math.max(1, periodLengthNum));
    const clampedCycle = Math.min(45, Math.max(21, cycleLengthNum));
    const endDate = periodEndDate;
    const startDate = addDays(endDate, -(clampedPeriod - 1));
    const dateStr = format(startDate, 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const safeDateStr = dateStr > todayStr ? todayStr : dateStr;

    setIsLoading(true);
    try {
      await saveCycleData({
        periodStartDate: safeDateStr,
        periodLength: clampedPeriod,
        cycleLength: clampedCycle,
        lastUpdated: todayStr,
      });
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error saving cycle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipMessageContinue = () => {
    router.replace('/(tabs)/home');
  };

  const onDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setPeriodEndDate(selectedDate);
  };

  const paddingVertical = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom + spacing.xl,
    paddingHorizontal: spacing.xl,
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {step === 'name' && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.fullScreenImage}
            resizeMode="cover"
          />
          <View style={styles.fullScreenOverlay} />
        </View>
      )}
      <LinearGradient
        colors={
          step === 'name'
            ? ['rgba(255,107,157,0.5)', 'rgba(157,113,232,0.75)', '#9D71E8']
            : ['#FF6B9D', '#9D71E8', '#5BBFDD']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={[styles.content, paddingVertical]}>

          {/* ─── STEP: name ─── */}
          {step === 'name' && (
            <>
              <View style={styles.heroWrap}>
                <Animated.View
                  style={[
                    styles.nameContainer,
                    { opacity: nameOpacity, transform: [{ scale: nameScale }] },
                  ]}
                >
                  <Text style={styles.logoText}>Aurelle</Text>
                  <Text style={styles.tagline}>Your Cycle, Your Glow ✨</Text>
                </Animated.View>
                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}>
                    <Heart size={20} color="rgba(255, 255, 255, 0.95)" />
                    <Text style={styles.featureText}>Track your cycle</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Shield size={20} color="rgba(255, 255, 255, 0.95)" />
                    <Text style={styles.featureText}>Private & secure</Text>
                  </View>
                </View>
              </View>

              <Animated.View style={{ opacity: formOpacity }}>
                <LinearGradient
                  colors={[dm.formBg1, dm.formBg2]}
                  style={styles.formContainer}
                >
                  <Text style={[styles.welcomeText, { color: dm.text }]}>
                    Welcome to Aurelle!
                  </Text>
                  <Text style={[styles.subtitle, { color: dm.lightText }]}>
                    Your personal cycle companion. Let&apos;s get started with your name.
                  </Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: dm.inputBg,
                          borderColor: dm.inputBorder,
                          color: dm.inputText,
                        },
                      ]}
                      placeholder="Enter your name"
                      placeholderTextColor={dm.lightText}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      autoCorrect={false}
                      testID="name-input"
                    />
                  </View>
                  <GradientButton
                    title="Continue"
                    onPress={handleNameContinue}
                    isLoading={isLoading}
                    disabled={!name.trim()}
                    style={styles.button}
                    testID="continue-button"
                  />
                  <View style={styles.privacyContainer}>
                    <Shield size={16} color={dm.privacyText} />
                    <Text style={[styles.privacyText, { color: dm.privacyText }]}>
                      Your data stays on your device. No account required.
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </>
          )}

          {/* ─── STEP: period-question ─── */}
          {step === 'period-question' && (
            <Animated.View style={{ flex: 1, opacity: formOpacity }}>
              <LinearGradient
                colors={[dm.formBg1, dm.formBg2]}
                style={styles.formContainer}
              >
                <Text style={[styles.stepTitle, { color: dm.text }]}>
                  Do you know your last period date?
                </Text>
                <Text style={[styles.stepSubtitle, { color: dm.lightText }]}>
                  This helps us show predictions and fertile days. You can change it anytime in Settings.
                </Text>

                <TouchableOpacity
                  style={[
                    styles.choiceButton,
                    {
                      backgroundColor: dm.choicePrimaryBg,
                      borderColor: dm.choicePrimaryBorder,
                    },
                  ]}
                  onPress={handleYesPeriod}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.choiceButtonText, { color: dm.text }]}>
                    Yes, I know it
                  </Text>
                  <ChevronRight size={22} color={Colors.primary} strokeWidth={2.5} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.choiceButton,
                    {
                      backgroundColor: dm.choiceSecondaryBg,
                      borderColor: dm.choiceSecondaryBorder,
                    },
                  ]}
                  onPress={handleSkipPeriod}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.choiceButtonTextSecondary, { color: dm.lightText }]}>
                    Not sure / I&apos;ll add later
                  </Text>
                  <ChevronRight size={22} color={dm.lightText} strokeWidth={2.5} />
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          )}

          {/* ─── STEP: period-form ─── */}
          {step === 'period-form' && (
            <Animated.View style={{ flex: 1, opacity: formOpacity }}>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <LinearGradient
                  colors={[dm.formBg1, dm.formBg2]}
                  style={styles.formContainer}
                >
                  <Text style={[styles.stepTitle, { color: dm.text }]}>
                    When did your last period end?
                  </Text>
                  <Text style={[styles.stepSubtitle, { color: dm.lightText }]}>
                    We&apos;ll use this to predict your next period and fertile window.
                  </Text>

                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: dm.text }]}>
                      Last period end date
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.dateInput,
                        {
                          backgroundColor: dm.dateInputBg,
                          borderColor: dm.dateInputBorder,
                        },
                      ]}
                      onPress={() => setShowDatePicker(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.dateText, { color: dm.text }]}>
                        {format(periodEndDate, 'MMMM d, yyyy')}
                      </Text>
                      <Calendar size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      value={periodEndDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      maximumDate={new Date()}
                      // ensures spinner text is readable in dark mode on iOS
                      themeVariant={isDark ? 'dark' : 'light'}
                    />
                  )}

                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: dm.text }]}>
                      Period length (days)
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: dm.inputBg,
                          borderColor: dm.inputBorder,
                          color: dm.inputText,
                        },
                      ]}
                      value={periodLength}
                      onChangeText={setPeriodLength}
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholder="5"
                      placeholderTextColor={dm.lightText}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: dm.text }]}>
                      Cycle length (days)
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: dm.inputBg,
                          borderColor: dm.inputBorder,
                          color: dm.inputText,
                        },
                      ]}
                      value={cycleLength}
                      onChangeText={setCycleLength}
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholder="28"
                      placeholderTextColor={dm.lightText}
                    />
                  </View>

                  <GradientButton
                    title="Continue to Aurelle"
                    onPress={handlePeriodFormContinue}
                    isLoading={isLoading}
                    style={styles.button}
                  />
                </LinearGradient>
              </ScrollView>
            </Animated.View>
          )}

          {/* ─── STEP: skip-message ─── */}
          {step === 'skip-message' && (
            <Animated.View style={{ flex: 1, opacity: formOpacity }}>
              <LinearGradient
                colors={[dm.formBg1, dm.formBg2]}
                style={styles.formContainer}
              >
                <View style={[styles.skipIconWrap, { backgroundColor: dm.skipIconBg }]}>
                  <Calendar size={40} color={Colors.primary} strokeWidth={1.5} />
                </View>
                <Text style={[styles.stepTitle, { color: dm.text }]}>No problem!</Text>
                <Text style={[styles.stepSubtitle, { color: dm.lightText }]}>
                  You can add your last period date anytime in Settings. Your predictions will appear once you do.
                </Text>
                <GradientButton
                  title="Continue to Aurelle"
                  onPress={handleSkipMessageContinue}
                  style={styles.button}
                />
              </LinearGradient>
            </Animated.View>
          )}

        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, justifyContent: 'space-between' },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  heroWrap: {
    flex: 1,
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: spacing.xl,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.base,
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  featureText: { color: 'rgba(255, 255, 255, 0.95)', fontSize: 14, fontWeight: '600' },
  formContainer: { borderRadius: radius.xxl, padding: spacing.xl },
  welcomeText: { fontSize: 24, fontWeight: '800', marginBottom: spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: 15, marginBottom: spacing.xxl, textAlign: 'center', lineHeight: 22 },
  stepTitle: { fontSize: 22, fontWeight: '800', marginBottom: spacing.sm, textAlign: 'center' },
  stepSubtitle: { fontSize: 15, marginBottom: spacing.xl, textAlign: 'center', lineHeight: 22 },
  inputContainer: { marginBottom: spacing.xl },
  input: {
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing.lg,
    fontSize: 16,
    fontWeight: '500',
  },
  button: { marginBottom: spacing.lg },
  privacyContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  privacyText: { fontSize: 12, fontWeight: '500' },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.base,
  },
  choiceButtonText: { fontSize: 16, fontWeight: '700' },
  choiceButtonTextSecondary: { fontSize: 16, fontWeight: '600' },
  formGroup: { marginBottom: spacing.lg },
  formLabel: { fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  dateText: { fontSize: 16, fontWeight: '600', flex: 1 },
  skipIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
});