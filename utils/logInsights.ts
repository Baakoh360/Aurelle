import type { DayLog } from '@/types';

export interface InsightSection {
  id: string;
  title: string;
  emoji: string;
  tips: string[];
  /** How many log days mentioned this */
  mentionCount: number;
}

const SYMPTOM_TIPS: Record<string, { title: string; emoji: string; tips: string[] }> = {
  Cramps: {
    title: 'Cramps',
    emoji: '😣',
    tips: [
      'Try a short walk or gentle stretching — light movement can ease cramping.',
      'Place a warm water bottle or heating pad on your lower abdomen for 15–20 minutes.',
      'Stay hydrated; warm (non-caffeinated) drinks can feel soothing.',
      'If pain is strong or unusual for you, consider speaking with a healthcare provider.',
    ],
  },
  Headache: {
    title: 'Headache',
    emoji: '🤕',
    tips: [
      'Drink water — dehydration often contributes to headaches.',
      'Rest in a quiet, dim space and limit screen time if screens trigger pain.',
      'A short walk or fresh air can help if you have been sitting a long time.',
      'Seek care if headaches are sudden, severe, or different from your usual pattern.',
    ],
  },
  Bloating: {
    title: 'Bloating',
    emoji: '🤰',
    tips: [
      'Eat smaller meals and chew slowly to reduce air swallowing.',
      'Light walking after meals can aid digestion.',
      'Some people find peppermint or ginger tea comforting.',
      'Limit very salty foods if bloating tends to follow salty meals.',
    ],
  },
  Fatigue: {
    title: 'Fatigue',
    emoji: '😴',
    tips: [
      'Prioritize sleep on a regular schedule when you can.',
      'Include iron-rich foods (e.g. leafy greens, beans) especially during your period.',
      'Short breaks during the day beat long crash-naps for steady energy.',
      'If fatigue is extreme or new, it is worth discussing with a clinician.',
    ],
  },
  'Breast tenderness': {
    title: 'Breast tenderness',
    emoji: '💜',
    tips: [
      'A supportive, well-fitting bra can reduce discomfort.',
      'Some people feel better when they ease caffeine around sensitive days.',
      'Gentle upper-body stretching may help tension.',
      'Report new lumps, redness, or one-sided pain promptly to a healthcare provider.',
    ],
  },
  Acne: {
    title: 'Acne',
    emoji: '✨',
    tips: [
      'Use a gentle cleanser; avoid harsh scrubbing.',
      'Keep hair products off your face if they irritate skin.',
      'Hormonal fluctuations can affect skin — be patient with your routine.',
      'See a dermatologist if acne is painful or leaving scars.',
    ],
  },
  Nausea: {
    title: 'Nausea',
    emoji: '🤢',
    tips: [
      'Try small, bland meals and eat slowly.',
      'Ginger tea or dry crackers help some people.',
      'Fresh air and sitting upright after eating can reduce queasiness.',
      'Seek urgent care if vomiting is severe or you cannot keep fluids down.',
    ],
  },
  'Mood swings': {
    title: 'Mood swings',
    emoji: '🎭',
    tips: [
      'Name the feeling briefly — it can take the edge off intensity.',
      'A few minutes of slow breathing (in 4, hold 2, out 6) can steady your nervous system.',
      'Light exercise and daylight exposure often support mood.',
      'Reach out to someone you trust or a professional if mood changes feel overwhelming.',
    ],
  },
  Cravings: {
    title: 'Cravings',
    emoji: '🍫',
    tips: [
      'Pair sweet cravings with protein or fiber (e.g. nuts, fruit) for steadier energy.',
      'Notice if cravings track with sleep or stress — those are fixable levers.',
      'Eating regular meals can reduce extreme hunger-driven cravings.',
    ],
  },
  Insomnia: {
    title: 'Insomnia',
    emoji: '🌙',
    tips: [
      'Keep a consistent wake time, even after a bad night.',
      'Dim screens 30–60 minutes before bed.',
      'A wind-down routine (stretching, shower, reading) signals sleep to your body.',
      'Talk to a clinician if sleep problems persist for weeks.',
    ],
  },
};

const MOOD_TIPS: Partial<
  Record<NonNullable<DayLog['mood']>, { title: string; emoji: string; tips: string[] }>
> = {
  sad: {
    title: 'Low mood',
    emoji: '💙',
    tips: [
      'One small kind action for yourself today counts — even a shower or a text to a friend.',
      'Short walks and daylight often help mood a little.',
      'If low mood lasts most days for two weeks or more, consider professional support.',
    ],
  },
  anxious: {
    title: 'Anxiety',
    emoji: '🌿',
    tips: [
      'Ground yourself: name 5 things you see, 4 you feel, 3 you hear.',
      'Limit caffeine if it ramps up jitteriness.',
      'Breathing slowly (longer exhale than inhale) can calm the stress response.',
    ],
  },
  angry: {
    title: 'Irritability',
    emoji: '🌸',
    tips: [
      'Hormonal shifts can amplify feelings — your reaction is valid.',
      'Physical outlet: walk, stretch, or shake out tension for a minute.',
      'Step away from conflict until you feel a notch calmer.',
    ],
  },
};

function countSymptoms(logs: DayLog[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const log of logs) {
    for (const s of log.symptoms || []) {
      map.set(s, (map.get(s) || 0) + 1);
    }
  }
  return map;
}

function countMoods(logs: DayLog[]): Map<NonNullable<DayLog['mood']>, number> {
  const map = new Map<NonNullable<DayLog['mood']>, number>();
  for (const log of logs) {
    if (log.mood) {
      map.set(log.mood, (map.get(log.mood) || 0) + 1);
    }
  }
  return map;
}

/**
 * Builds personalized suggestion sections from saved day logs (wellness tips only — not medical diagnosis).
 */
export function analyzeDayLogs(logs: DayLog[]): {
  sections: InsightSection[];
  highPainDays: number;
  totalLogs: number;
} {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const symptomCounts = countSymptoms(sorted);
  const moodCounts = countMoods(sorted);

  const sections: InsightSection[] = [];

  const sortedSymptoms = [...symptomCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [symptom, count] of sortedSymptoms) {
    const def = SYMPTOM_TIPS[symptom];
    if (def) {
      sections.push({
        id: `symptom-${symptom}`,
        title: def.title,
        emoji: def.emoji,
        tips: def.tips,
        mentionCount: count,
      });
    }
  }

  const highPainDays = sorted.filter((l) => (l.pain ?? 0) >= 2).length;
  if (highPainDays > 0) {
    sections.unshift({
      id: 'pain-general',
      title: 'Pain you logged',
      emoji: '🩹',
      tips: [
        'You noted higher pain on one or more days. Gentle movement, warmth on the abdomen or back, and hydration help many people.',
        'Over-the-counter options exist, but follow package directions and ask a pharmacist or clinician if unsure.',
        'Seek urgent care for sudden severe pain, fever with pain, or pain unlike anything you have had before.',
      ],
      mentionCount: highPainDays,
    });
  }

  const topMoods = [...moodCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [mood, count] of topMoods) {
    const def = MOOD_TIPS[mood];
    if (def && count >= 2) {
      sections.push({
        id: `mood-${mood}`,
        title: def.title,
        emoji: def.emoji,
        tips: def.tips,
        mentionCount: count,
      });
    }
  }

  return {
    sections,
    highPainDays,
    totalLogs: sorted.length,
  };
}

/**
 * Short wellness lines for one day's log (for Calendar cards).
 */
export function getInsightsForDayLog(log: DayLog): string[] {
  const lines: string[] = [];

  if ((log.pain ?? 0) >= 2) {
    lines.push(
      'You logged higher pain — try gentle movement, warmth on your abdomen or back, and hydration.'
    );
  } else if ((log.pain ?? 0) === 1) {
    lines.push('Light stretching or a short walk may ease mild discomfort.');
  }

  for (const s of log.symptoms || []) {
    const def = SYMPTOM_TIPS[s];
    if (def?.tips[0]) lines.push(def.tips[0]);
  }

  if (log.mood) {
    const moodDef = MOOD_TIPS[log.mood];
    if (moodDef?.tips[0]) lines.push(moodDef.tips[0]);
  }

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const line of lines) {
    if (!seen.has(line)) {
      seen.add(line);
      unique.push(line);
    }
    if (unique.length >= 4) break;
  }

  if (unique.length === 0) {
    unique.push('Tap this day to add symptoms or notes — we will tailor tips for you.');
  }

  return unique.slice(0, 3);
}
