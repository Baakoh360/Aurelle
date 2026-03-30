/**
 * Health Guide — simple data for categories and articles.
 */

export type CategoryKey = 'cycle' | 'vaginal' | 'reproductive' | 'mental' | 'nutrition';

export interface ArticleSection {
  heading: string;
  body: string;
}

export interface Article {
  id: string;
  slug: string;
  category: CategoryKey;
  title: string;
  intro: string;
  sections: ArticleSection[];
  /** Pictorial comparison guide (emoji + label + short description) */
  visualGuide?: { emoji: string; label: string; description: string }[];
  colorGuide?: { emoji: string; label: string; meaning: string }[];
  whenToSeeDoctor?: string;
}

export interface Category {
  key: CategoryKey;
  label: string;
  emoji: string;
  tagline: string;
  gradient: [string, string];
}

export const CATEGORIES: Category[] = [
  { key: 'cycle', label: 'Cycle Health', emoji: '🩸', tagline: 'Periods & cycle basics', gradient: ['#FF6B9D', '#E84A7A'] },
  { key: 'vaginal', label: 'Vaginal Health', emoji: '🌸', tagline: 'Discharge, hygiene & comfort', gradient: ['#9D71E8', '#B794F6'] },
  { key: 'reproductive', label: 'Reproductive Health', emoji: '🤰', tagline: 'Fertility & pregnancy', gradient: ['#5BBFDD', '#7DD3F0'] },
  { key: 'mental', label: 'Mental Health', emoji: '🧠', tagline: 'Mood, anxiety & well-being', gradient: ['#F59E0B', '#FBBF24'] },
  {
    key: 'nutrition',
    label: 'Food & Nutrition',
    emoji: '🥗',
    tagline: 'What to eat, what to skip & why it matters',
    gradient: ['#22C55E', '#34D399'],
  },
];

export const ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'vaginal-discharge-color-guide',
    category: 'vaginal',
    title: 'Vaginal discharge color guide',
    intro: 'Discharge is a normal part of a healthy vagina. Its color, consistency, and amount can change through your cycle and over time. Here\'s a clear guide to what\'s usually normal and when it\'s worth getting checked.',
    visualGuide: [
      { emoji: '⚪', label: 'Normal', description: 'Clear or white, thin to creamy. Changes with cycle.' },
      { emoji: '🟡', label: 'Watch', description: 'Yellow, green, grey, or chunky. Possible infection.' },
      { emoji: '🩺', label: 'See doctor', description: 'Strong smell, itching, burning. Easy to treat.' },
    ],
    sections: [
      {
        heading: 'What is normal discharge?',
        body: 'Clear or white discharge that\'s thin to slightly thick is normal. It may look creamy or stretchy around ovulation, when your body produces more cervical mucus to help sperm reach the egg. The amount can vary from person to person and by phase of your cycle. Some people notice more discharge mid-cycle; others have a steady amount throughout. All of these are normal.',
      },
      {
        heading: 'How discharge changes through your cycle',
        body: 'Right after your period, discharge is often minimal. As you approach ovulation, it typically becomes clearer, stretchier, and more abundant — like raw egg white. After ovulation, it may thicken and become more opaque or white again. Before your next period, it might decrease or become slightly thicker. These changes are normal and reflect your body\'s hormonal shifts.',
      },
      {
        heading: 'When to pay attention',
        body: 'A strong, fishy, or unusual smell — especially with discharge — can signal an infection. Itching, burning, or discomfort inside or around the vulva are also worth noting. Green or grey discharge often points to infection. Chunky, cottage-cheese-like discharge can indicate a yeast infection. Brown or pink discharge can be old blood (often normal after a period) or spotting; if it\'s unexpected or persistent, mention it to a doctor.',
      },
      {
        heading: 'What not to do',
        body: 'Avoid douches, scented wipes, or deodorants on or in the vagina. They can make odor or infection worse. Your vagina is self-cleaning; gentle washing of the vulva with water is enough.',
      },
    ],
    colorGuide: [
      { emoji: '⚪', label: 'Clear / White', meaning: 'Normal, healthy. Can be thin or slightly thick.' },
      { emoji: '🟡', label: 'Yellow / Green', meaning: 'Possible infection. See a doctor.' },
      { emoji: '🩶', label: 'Grey', meaning: 'Possible bacterial vaginosis. See a doctor.' },
      { emoji: '🟤', label: 'Brown', meaning: 'Often old blood, common after a period.' },
      { emoji: '🔴', label: 'Red / Pink', meaning: 'Can be spotting or period blood; if unexpected, get checked.' },
    ],
    whenToSeeDoctor: 'See a doctor if discharge has a strong smell, causes itching or burning, or is green, grey, or chunky. These are common and treatable.',
  },
  {
    id: '2',
    slug: 'how-to-clean-your-vulva',
    category: 'vaginal',
    title: 'How to clean your vulva (correctly)',
    intro: 'Your vulva and vagina are designed to stay healthy with minimal intervention. Here\'s how to care for them gently without disrupting their natural balance.',
    visualGuide: [
      { emoji: '💧', label: 'Water', description: 'Warm water on vulva. Gentle and enough.' },
      { emoji: '🧴', label: 'Mild soap', description: 'Unscented only, outside only. Optional.' },
      { emoji: '❌', label: 'Avoid', description: 'No douches, scented wipes, or harsh soaps.' },
    ],
    sections: [
      {
        heading: 'Clean the outside only',
        body: 'Wash the vulva (the outer part) with warm water. You don\'t need soap, but if you use it, choose something mild and unscented. Avoid putting soap or cleansers inside the vagina — it can upset pH and cause irritation or infection. The vagina is self-cleaning; it produces discharge that helps keep things balanced.',
      },
      {
        heading: 'Avoid douches and scented products',
        body: 'Douches, scented wipes, and strong soaps can irritate the vulva and disrupt the vagina\'s natural bacteria. Plain water and gentle, fragrance-free products are enough. If you use a washcloth, use a clean one each time and avoid harsh scrubbing.',
      },
      {
        heading: 'During your period',
        body: 'Change pads, tampons, or menstrual cups regularly. Wash the vulva with water when you shower or bathe. There\'s no need to clean inside the vagina.',
      },
      {
        heading: 'When to see a doctor',
        body: 'If you have ongoing itching, odor, or discomfort despite gentle care, see a doctor. They can check for infections or skin conditions and suggest the right treatment.',
      },
    ],
    whenToSeeDoctor: 'See a doctor if you have persistent itching, unusual odor, or discomfort that doesn\'t improve with gentle cleaning.',
  },
  {
    id: '3',
    slug: 'spotting-vs-period',
    category: 'cycle',
    title: 'Spotting vs period vs bleeding',
    intro: 'Knowing the difference between spotting, a normal period, and heavier bleeding helps you understand your body and when to seek care.',
    visualGuide: [
      { emoji: '💧', label: 'Spotting', description: 'Light — a few drops or light pink/brown. Usually no pad needed.' },
      { emoji: '🩸', label: 'Period', description: 'Medium — full flow for 3–7 days. Needs pad, tampon, or cup.' },
      { emoji: '🔴', label: 'Heavy', description: 'Heavy — soaks through a pad in 1–2 hours. Get checked.' },
    ],
    sections: [
      {
        heading: '💧 Spotting',
        body: 'Spotting is light bleeding — a few drops or light pink/brown on tissue. It can happen around ovulation, when starting or stopping birth control, or from irritation. It usually doesn\'t need a pad or tampon. Spotting is common and often harmless, but if it\'s new or frequent, mention it to a doctor.',
      },
      {
        heading: '🩸 Normal period',
        body: 'A period is a full flow that lasts several days and needs a pad, tampon, or cup. Flow can be light to heavy on different days. Cycle length and flow can vary from person to person. Most periods last 3–7 days, and cycles vary from about 21 to 35 days.',
      },
      {
        heading: '🔴 Heavy or unusual bleeding',
        body: 'Heavy bleeding soaks through a pad or tampon in an hour or two, or lasts much longer than usual. Bleeding between periods, after sex, or after menopause should be checked by a doctor. So should bleeding that\'s much heavier or longer than your usual pattern.',
      },
      {
        heading: '📋 Tracking helps',
        body: 'Keeping a note of when you bleed, how heavy it is, and how long it lasts helps you and your doctor understand what\'s normal for you and when something might need attention.',
      },
    ],
    whenToSeeDoctor: 'See a doctor if you soak through pads/tampons every 1–2 hours, bleed between periods, after sex, or after menopause, or if bleeding is much heavier or longer than usual.',
  },
  {
    id: '4',
    slug: 'early-signs-of-pregnancy',
    category: 'reproductive',
    title: 'Early signs of pregnancy',
    intro: 'Early pregnancy can show up in different ways. These signs are common but not everyone has them. A pregnancy test and a visit to a doctor confirm pregnancy.',
    visualGuide: [
      { emoji: '📅', label: 'Missed period', description: 'Often the first sign. Take a test.' },
      { emoji: '🤕', label: 'Body signs', description: 'Tender breasts, nausea, tiredness, spotting.' },
      { emoji: '🧪', label: 'Test', description: 'Home urine test from day of missed period.' },
    ],
    sections: [
      {
        heading: 'Missed period',
        body: 'A missed period is often the first sign. If your cycle is usually regular and you\'re late, consider taking a pregnancy test. Some people have light spotting around the time of their expected period — that can be implantation bleeding or something else.',
      },
      {
        heading: 'Other possible signs',
        body: 'Tender breasts, tiredness, nausea, needing to pee more often, and light spotting can occur in early pregnancy. They can also happen for other reasons, so a test is the way to know. Mood changes and food aversions are common too.',
      },
      {
        heading: 'Taking a test',
        body: 'Home urine tests are reliable when used correctly. Test from the first day of a missed period, or a few days after. If the result is positive, see a doctor to confirm and start care. If it\'s negative but you still don\'t get your period, test again in a few days or see a doctor.',
      },
    ],
    whenToSeeDoctor: 'Take a pregnancy test if you might be pregnant. If it\'s positive or you\'re unsure, see a doctor to confirm and discuss next steps.',
  },
  {
    id: '5',
    slug: 'normal-vs-abnormal-period-pain',
    category: 'cycle',
    title: 'Normal vs abnormal period pain',
    intro: 'Some cramping with your period is common. But pain that gets in the way of your life may be a sign something else is going on.',
    visualGuide: [
      { emoji: '😌', label: 'Mild', description: 'Light cramps, 1–2 days. Heat and rest help.' },
      { emoji: '😣', label: 'Moderate', description: 'Noticeable pain. OTC meds often help.' },
      { emoji: '🆘', label: 'Severe', description: 'Can\'t function, heavy bleeding. See a doctor.' },
    ],
    sections: [
      {
        heading: 'Normal period pain',
        body: 'Mild to moderate cramps in the lower belly or back for a day or two are normal. Rest, heat, gentle movement, and over-the-counter pain relievers often help. Many people find that exercise, yoga, or a heating pad can ease cramps.',
      },
      {
        heading: 'When pain may not be normal',
        body: 'Pain that\'s severe, lasts many days, doesn\'t improve with usual measures, or comes with heavy bleeding, nausea, or fainting could point to conditions like endometriosis or fibroids. These are common and treatable, so it\'s worth getting checked.',
      },
      {
        heading: 'What you can do',
        body: 'Keep a note of when pain happens, how bad it is, and how long it lasts. That helps a doctor figure out whether more tests or treatment are needed. In the meantime, heat, gentle exercise, and pain relievers can help.',
      },
    ],
    whenToSeeDoctor: 'See a doctor if period pain is severe, lasts most of your period, doesn\'t improve with rest or pain relievers, or affects work or daily life.',
  },
  {
    id: '6',
    slug: 'what-ovulation-feels-like',
    category: 'reproductive',
    title: 'What ovulation feels like',
    intro: 'Some people notice physical signs around ovulation; others don\'t. Both are normal. Here\'s what to look for if you\'re curious.',
    visualGuide: [
      { emoji: '🤏', label: 'Cramping', description: 'Mild one-sided pinch (mittelschmerz).' },
      { emoji: '🥚', label: 'Discharge', description: 'Clear, stretchy, egg-white-like mucus.' },
      { emoji: '⚡', label: 'Energy', description: 'Some feel more energy, mood boost, libido.' },
    ],
    sections: [
      {
        heading: 'Body signs',
        body: 'Mild cramping on one side (mittelschmerz), a slight rise in body temperature, and more stretchy, clear discharge (like egg white) are common around ovulation. These are your body\'s way of preparing for possible pregnancy.',
      },
      {
        heading: 'Mood and energy',
        body: 'Some people feel more energy, a better mood, or a higher libido in the few days around ovulation. These can be subtle and don\'t happen for everyone.',
      },
      {
        heading: 'Tracking ovulation',
        body: 'Apps like this one use your period dates to estimate ovulation. Ovulation tests (LH kits) or tracking basal body temperature can give a more precise idea of when you ovulate. This can be helpful if you\'re trying to conceive or want to understand your cycle better.',
      },
    ],
    whenToSeeDoctor: 'See a doctor if you have severe pain around mid-cycle, or if you\'re trying to conceive and want help with ovulation or fertility.',
  },
  {
    id: '7',
    slug: 'vaginal-dryness',
    category: 'vaginal',
    title: 'Why your vagina is dry',
    intro: 'Vaginal dryness is common and has many causes. It\'s nothing to be ashamed of, and there are safe ways to feel more comfortable.',
    visualGuide: [
      { emoji: '🔄', label: 'Causes', description: 'Hormones, stress, meds, breastfeeding.' },
      { emoji: '💧', label: 'Lubricant', description: 'Water-based lube helps during sex.' },
      { emoji: '🩺', label: 'Doctor', description: 'Ongoing dryness? Topical options available.' },
    ],
    sections: [
      {
        heading: 'Common causes',
        body: 'Hormonal changes (e.g. around menopause, after childbirth, or with some birth control), stress, certain medications, or not being fully aroused during sex can lead to dryness. Breastfeeding can also cause temporary dryness.',
      },
      {
        heading: 'What can help',
        body: 'Water-based lubricants can help during sex. If dryness is ongoing, a doctor can suggest options like topical estrogen or other treatments that are safe for you. Staying hydrated and avoiding harsh soaps can also help.',
      },
      {
        heading: 'When to see a doctor',
        body: 'If dryness is bothering you or causing pain during sex, see a doctor. They can rule out other causes and recommend the best treatment for your situation.',
      },
    ],
    whenToSeeDoctor: 'See a doctor if dryness is persistent, painful, or affecting your daily life or sex life.',
  },
  {
    id: '8',
    slug: 'vaginal-odor',
    category: 'vaginal',
    title: 'Vaginal odor — what\'s normal',
    intro: 'Every vagina has a mild scent that can change with your cycle, sweat, or diet. Here\'s how to tell the difference between normal variation and when to get checked.',
    visualGuide: [
      { emoji: '🌸', label: 'Normal', description: 'Mild, musky. Varies with cycle and sweat.' },
      { emoji: '🐟', label: 'Fishy', description: 'Strong smell + discharge? Possible infection.' },
      { emoji: '❌', label: 'Avoid', description: 'No douches or scented products. Makes it worse.' },
    ],
    sections: [
      {
        heading: 'Normal odor',
        body: 'A mild, musky or slightly sweet smell is normal. It can be a bit stronger after exercise or on hot days. It may also change slightly around your period or ovulation.',
      },
      {
        heading: 'When to pay attention',
        body: 'A strong, fishy, or unusual smell — especially with discharge, itching, or burning — can mean an infection like bacterial vaginosis or thrush. These are common and treatable.',
      },
      {
        heading: 'What not to do',
        body: 'Avoid douches, scented wipes, or deodorants on or in the vagina. They can make odor or infection worse. Gentle washing with water is enough.',
      },
    ],
    whenToSeeDoctor: 'See a doctor if you notice a strong or new odor, especially with discharge, itching, or burning.',
  },
  {
    id: '15',
    slug: 'yeast-infection-vs-bv',
    category: 'vaginal',
    title: 'Yeast infection vs bacterial vaginosis (BV)',
    intro: 'Both can cause vaginal discomfort and discharge, but they\'re different infections with different treatments. Here\'s how to tell them apart and when to see a doctor.',
    visualGuide: [
      { emoji: '🍞', label: 'Yeast', description: 'Itching, thick white discharge (like cottage cheese). Often no strong smell.' },
      { emoji: '🐟', label: 'BV', description: 'Fishy smell, thin grey/white discharge. Less itching than yeast.' },
      { emoji: '🩺', label: 'Get checked', description: 'Don\'t guess — wrong treatment can delay healing. Both are treatable.' },
    ],
    sections: [
      {
        heading: 'Yeast infection (thrush)',
        body: 'Yeast infections are caused by an overgrowth of yeast (often Candida). Common signs include itching or soreness around the vulva, thick white discharge that can look like cottage cheese, and sometimes burning when you pee. There\'s usually no strong odor. Yeast infections are very common and can be triggered by antibiotics, hormonal changes, or moisture. Over-the-counter antifungal creams or suppositories work for many people, but if it\'s your first time or symptoms don\'t improve, see a doctor.',
      },
      {
        heading: 'Bacterial vaginosis (BV)',
        body: 'BV happens when the normal balance of bacteria in the vagina is disrupted. Typical signs include a fishy or unpleasant odor (often stronger after sex), thin grey or white discharge, and sometimes mild itching or burning. It\'s not the same as a yeast infection — the discharge and smell are different. BV is treated with prescription antibiotics (pill or gel). Douches and scented products can make it worse or cause recurrences.',
      },
      {
        heading: 'Why it matters to tell them apart',
        body: 'Treating yeast when you have BV (or the other way around) won\'t help and can delay proper care. If you\'re unsure, or if symptoms are severe, keep coming back, or you\'re pregnant, see a doctor or nurse. They can confirm the cause and give the right treatment. Both conditions are common and treatable.',
      },
    ],
    whenToSeeDoctor: 'See a doctor if it\'s your first time, symptoms don\'t improve with OTC treatment, you\'re pregnant, or you\'re unsure whether it\'s yeast or BV.',
  },
  {
    id: '16',
    slug: 'utis-signs-and-prevention',
    category: 'vaginal',
    title: 'UTIs — signs, prevention & when to get help',
    intro: 'Urinary tract infections are common, especially in people with vulvas. Knowing the signs and simple prevention steps can help you avoid or catch them early.',
    visualGuide: [
      { emoji: '🔥', label: 'Signs', description: 'Burning when you pee, urgency, pelvic pressure. See a doctor.' },
      { emoji: '💧', label: 'Prevention', description: 'Pee after sex, stay hydrated, wipe front to back.' },
      { emoji: '🩺', label: 'Treatment', description: 'Antibiotics. Don\'t delay — can spread to kidneys.' },
    ],
    sections: [
      {
        heading: 'What is a UTI?',
        body: 'A UTI is an infection in the urinary tract — usually the bladder (cystitis). Bacteria from the skin or gut can enter the urethra and multiply. People with vulvas get UTIs more often because the urethra is shorter and closer to the anus. Sex, holding pee too long, and dehydration can increase risk.',
      },
      {
        heading: 'Common signs',
        body: 'Burning or pain when you pee, feeling you need to go often (even if little comes out), pressure or discomfort in the lower belly, and sometimes cloudy or strong-smelling urine. If you have fever, back pain, or feel very unwell, the infection may have reached the kidneys — get care right away.',
      },
      {
        heading: 'What can help prevent UTIs',
        body: 'Pee soon after sex. Drink enough water so your urine is light in color. Wipe from front to back after using the toilet. Avoid holding pee for long periods. Some people find that cranberry products or probiotics help; evidence is mixed, but they\'re generally safe. If you get UTIs often, a doctor can suggest other steps or tests.',
      },
      {
        heading: 'Treatment',
        body: 'UTIs usually need antibiotics prescribed by a doctor or nurse. Starting treatment early helps prevent the infection from spreading to the kidneys. Finish the full course of antibiotics even if you feel better. If symptoms don\'t improve in a day or two, or you have fever or back pain, see a doctor again.',
      },
    ],
    whenToSeeDoctor: 'See a doctor if you have UTI symptoms (burning, urgency, pelvic pain), fever, back pain, or blood in your urine. Don\'t delay — kidney infection is serious.',
  },
  {
    id: '9',
    slug: 'pcos-signs',
    category: 'reproductive',
    title: 'PCOS — signs to watch for',
    intro: 'Polycystic ovary syndrome (PCOS) is a common condition that affects hormones and cycles. Knowing the signs can help you get support sooner.',
    visualGuide: [
      { emoji: '📅', label: 'Periods', description: 'Irregular, few, or absent periods.' },
      { emoji: '🩸', label: 'Other signs', description: 'Extra hair, acne, weight gain, dark skin.' },
      { emoji: '🩺', label: 'Get checked', description: 'Doctor can diagnose and suggest treatment.' },
    ],
    sections: [
      {
        heading: 'What is PCOS?',
        body: 'PCOS is a hormonal condition. People with PCOS may have irregular or missed periods, higher levels of androgens (male-type hormones), and sometimes many small follicles on the ovaries (seen on ultrasound).',
      },
      {
        heading: 'Common signs',
        body: 'Irregular or very few periods, extra hair on the face or body, acne, weight gain or trouble losing weight, and darkening skin in creases can be signs. Not everyone has every sign.',
      },
      {
        heading: 'Why it matters',
        body: 'PCOS can affect fertility and long-term health (e.g. diabetes, heart health). A doctor can diagnose PCOS and suggest lifestyle and medical options that work for you.',
      },
    ],
    whenToSeeDoctor: 'See a doctor if your periods are very irregular or absent, or if you have several of the signs above and want to be checked for PCOS.',
  },
  {
    id: '10',
    slug: 'when-to-see-doctor-cycle',
    category: 'cycle',
    title: 'When to see a doctor about your cycle',
    intro: 'Your cycle is a window into your health. Some changes are normal; others are worth a check-up. Here\'s when it\'s a good idea to see a doctor.',
    visualGuide: [
      { emoji: '🩸', label: 'Period changes', description: 'Heavier, lighter, irregular, or between periods.' },
      { emoji: '😣', label: 'Pain', description: 'Severe cramps, pain during sex, or new pattern.' },
      { emoji: '🤰', label: 'Trying to conceive', description: 'No success after 6–12 months? Get help.' },
    ],
    sections: [
      {
        heading: 'Period changes',
        body: 'See a doctor if your period suddenly becomes much heavier, much lighter, or much more painful; if it\'s very irregular or stops (and you\'re not pregnant or in menopause); or if you bleed between periods or after sex.',
      },
      {
        heading: 'Pain and other symptoms',
        body: 'Severe pelvic pain, pain during sex, or pain that doesn\'t fit with your usual period pattern should be evaluated. So should new or worsening acne, hair growth, or mood changes that affect your life.',
      },
      {
        heading: 'Trying to conceive',
        body: 'If you\'ve been trying to get pregnant for a year (or six months if you\'re over 35) without success, a doctor can help with basic checks and next steps.',
      },
      {
        heading: 'When in doubt',
        body: 'It\'s okay to see a doctor. They can help rule out problems and give you peace of mind or a clear plan.',
      },
    ],
    whenToSeeDoctor: 'When in doubt, it\'s okay to see a doctor. They can help rule out problems and give you peace of mind or a clear plan.',
  },
  {
    id: '11',
    slug: 'mood-and-your-cycle',
    category: 'mental',
    title: 'Mood and your cycle',
    intro: 'Hormones affect how you feel. It\'s normal for mood to shift through your cycle — and knowing why can help you be kinder to yourself.',
    visualGuide: [
      { emoji: '📈', label: 'Follicular', description: 'Often more energy, better mood after period.' },
      { emoji: '✨', label: 'Ovulation', description: 'Peak energy, confidence. Many feel their best.' },
      { emoji: '📉', label: 'Luteal', description: 'Can feel low, irritable, tired before period.' },
    ],
    sections: [
      {
        heading: 'Why mood changes',
        body: 'Estrogen and progesterone rise and fall through your cycle. These hormones affect serotonin and other brain chemicals that influence mood, energy, and sleep. So feeling different at different times of the month is normal — not a character flaw.',
      },
      {
        heading: 'What many people notice',
        body: 'In the first half of the cycle (after your period), you might feel more energetic and upbeat. Around ovulation, some people feel a peak in mood and confidence. In the week or so before your period (luteal phase), it\'s common to feel more tired, irritable, or low. These shifts are real and valid.',
      },
      {
        heading: 'What can help',
        body: 'Rest when you need it. Gentle movement, enough sleep, and eating regularly can help. Some people find it useful to track mood alongside their cycle so they can plan around tougher days. If mood changes are severe or affect your life, see a doctor — treatment is available.',
      },
    ],
    whenToSeeDoctor: 'See a doctor if mood changes are severe, last most of the month, or get in the way of work, relationships, or daily life.',
  },
  {
    id: '12',
    slug: 'pms-vs-pmdd',
    category: 'mental',
    title: 'PMS vs PMDD — when it\'s more than "just PMS"',
    intro: 'Premenstrual syndrome (PMS) is common. Premenstrual dysphoric disorder (PMDD) is a more severe form that deserves proper care. Here\'s how to tell the difference.',
    visualGuide: [
      { emoji: '😐', label: 'PMS', description: 'Mild to moderate. Irritable, tired, bloated. Manageable.' },
      { emoji: '😰', label: 'PMDD', description: 'Severe. Overwhelming sadness, anger, hopelessness.' },
      { emoji: '🩺', label: 'Get help', description: 'PMDD is treatable. You don\'t have to suffer.' },
    ],
    sections: [
      {
        heading: 'What is PMS?',
        body: 'PMS includes physical and emotional symptoms in the days before your period: bloating, breast tenderness, fatigue, irritability, mood swings, or feeling low. Symptoms are usually mild to moderate and don\'t severely disrupt your life. Many people have some PMS; it\'s common and often manageable with rest, exercise, and sometimes pain relievers.',
      },
      {
        heading: 'What is PMDD?',
        body: 'PMDD is a more severe form of premenstrual distress. Symptoms include intense sadness, hopelessness, anger, anxiety, or feeling out of control. They typically start in the week before your period and ease within a few days of bleeding. PMDD can make it hard to work, maintain relationships, or function normally. It\'s a real condition — not "just PMS" or something you should tough out.',
      },
      {
        heading: 'Why it matters',
        body: 'PMDD is treatable. A doctor can suggest lifestyle changes, therapy, or medication that can help. If your premenstrual symptoms are severe and affect your life, you deserve support.',
      },
    ],
    whenToSeeDoctor: 'See a doctor if premenstrual symptoms are severe, affect your work or relationships, or make you feel hopeless or out of control.',
  },
  {
    id: '13',
    slug: 'anxiety-around-periods',
    category: 'mental',
    title: 'Anxiety around periods',
    intro: 'Worrying about your period — whether it\'s late, heavy, or "wrong" — is common. Here\'s some reassurance and when to get help.',
    visualGuide: [
      { emoji: '🤔', label: 'Common worries', description: 'Late period, irregular flow, "is this normal?"' },
      { emoji: '📋', label: 'Tracking helps', description: 'Log your cycle. Patterns become clearer.' },
      { emoji: '💬', label: 'Talk to someone', description: 'Doctor or therapist can ease your mind.' },
    ],
    sections: [
      {
        heading: 'Why period anxiety happens',
        body: 'Periods can be unpredictable, especially when you\'re young, after childbirth, or when stressed. It\'s natural to worry when your cycle doesn\'t match what you expect. Social stigma and lack of open conversation can make it harder to know what\'s normal.',
      },
      {
        heading: 'Common worries',
        body: 'Worrying about a late period (when you\'re not trying to get pregnant), heavy bleeding, irregular cycles, or pain is very common. Many of these are normal variations. Tracking your cycle can help you see patterns and feel more in control. A pregnancy test can rule out pregnancy if that\'s a concern.',
      },
      {
        heading: 'When anxiety is too much',
        body: 'If period-related worry takes up a lot of your thoughts, affects your sleep, or stops you from doing things you enjoy, it\'s worth talking to someone. A doctor can check that everything is okay physically, and a therapist can help with anxiety. You don\'t have to manage it alone.',
      },
    ],
    whenToSeeDoctor: 'See a doctor if anxiety about your period is affecting your daily life, or if you have physical symptoms (bleeding, pain) that worry you.',
  },
  {
    id: '14',
    slug: 'body-image-and-your-cycle',
    category: 'mental',
    title: 'Body image and your cycle',
    intro: 'Bloating, weight fluctuation, and skin changes around your period are real. So is the impact on how you feel about your body. Here\'s what\'s going on and how to be kinder to yourself.',
    visualGuide: [
      { emoji: '💧', label: 'Bloating', description: 'Water retention before period. Normal and temporary.' },
      { emoji: '🩸', label: 'Skin', description: 'Acne, oiliness. Hormones at play.' },
      { emoji: '💚', label: 'Self-care', description: 'Comfortable clothes, rest, gentle movement.' },
    ],
    sections: [
      {
        heading: 'What your body does',
        body: 'Hormonal changes before your period can cause water retention, so you may feel or look bloated. Some people gain a few pounds that go away after their period. Acne or oilier skin is also common. These are normal physical responses — not a sign you\'re doing something wrong.',
      },
      {
        heading: 'How it can affect you',
        body: 'Feeling uncomfortable in your body, avoiding certain clothes, or being hard on yourself during this time is common. Social media and diet culture can make it worse. Remember: your body is doing what it\'s designed to do. Bloating and temporary changes don\'t define your worth.',
      },
      {
        heading: 'What can help',
        body: 'Wear comfortable clothes. Avoid weighing yourself right before your period. Gentle movement can ease bloating and boost mood. Rest when you need it. If body image struggles affect your eating, exercise, or mental health, talking to a therapist or doctor can help.',
      },
    ],
    whenToSeeDoctor: 'See a doctor or therapist if body image concerns affect your eating, exercise habits, or overall well-being.',
  },
  {
    id: '15',
    slug: 'foods-that-support-your-cycle',
    category: 'nutrition',
    title: 'Foods that support your cycle',
    intro:
      'What you eat does not replace medical care, but steady meals with whole foods, fiber, protein, and iron-rich foods can support energy, mood, and how you feel across your cycle.',
    visualGuide: [
      { emoji: '🥬', label: 'Plants & fiber', description: 'Vegetables, fruit, beans, whole grains — steady energy.' },
      { emoji: '🫘', label: 'Iron & protein', description: 'Leafy greens, beans, lean meat, eggs — especially after blood loss.' },
      { emoji: '💧', label: 'Hydration', description: 'Water and herbal teas. Helps bloating and headaches.' },
    ],
    sections: [
      {
        heading: 'Benefits of eating in a balanced way',
        body:
          'Regular meals with protein, complex carbs, and healthy fats help keep blood sugar steadier. That often means fewer mood crashes, less afternoon fatigue, and better focus. Fiber from plants supports digestion and can help with bloating over time. Iron-rich foods (spinach, lentils, fortified cereals, lean meat if you eat it) help replace iron lost with menstrual blood. Omega-3–rich foods (like oily fish, walnuts, flax) are linked in research to general health; some people also find they feel better overall when they include them.',
      },
      {
        heading: 'What “eating well” usually looks like',
        body:
          'Half your plate vegetables and fruit when you can, a quarter whole grains, a quarter protein. Snacks that pair carbs with protein (e.g. apple with nut butter, yogurt with fruit) help avoid spikes and dips. There is no single magic food — consistency matters more than perfection.',
      },
      {
        heading: 'Around your period',
        body:
          'Warm, easy-to-digest meals can feel comforting. Magnesium- and potassium-containing foods (leafy greens, bananas, nuts, seeds) are part of a normal varied diet. If you have heavy periods, discussing iron status with a doctor is sensible; food helps, but sometimes supplements are needed under medical guidance.',
      },
    ],
    whenToSeeDoctor:
      'See a doctor if you have very heavy periods, unusual fatigue, or symptoms that suggest anemia (e.g. dizziness, shortness of breath). They can check iron and advise safely.',
  },
  {
    id: '16',
    slug: 'foods-to-limit-or-avoid',
    category: 'nutrition',
    title: 'Foods to limit or skip (and gentler swaps)',
    intro:
      'Some foods and drinks can worsen bloating, cramps, mood swings, or sleep — especially in large amounts or right before your period. You do not need to ban anything; small changes often help.',
    visualGuide: [
      { emoji: '🧂', label: 'Very salty', description: 'Can increase water retention and bloating.' },
      { emoji: '🍬', label: 'Lots of added sugar', description: 'Energy crashes and mood swings for some.' },
      { emoji: '☕', label: 'Excess caffeine', description: 'Can worsen anxiety, sleep, breast tenderness.' },
    ],
    sections: [
      {
        heading: 'Highly processed snacks and sugary drinks',
        body:
          'Frequent spikes in blood sugar from sugary drinks and refined snacks can leave you tired and irritable when the crash hits. Ultra-processed foods are often high in salt and low in fiber — fine occasionally, but not ideal as the main part of your diet.',
      },
      {
        heading: 'Alcohol',
        body:
          'Alcohol can disrupt sleep, dehydrate you, and worsen mood for some people. It can also interact with medications. If you drink, moderation and plenty of water matter; skip it if you feel worse or if your doctor advises.',
      },
      {
        heading: 'What to choose instead (examples)',
        body:
          'Swap sugary soda for sparkling water with fruit. Choose baked or steamed options over very salty fried fast food when you are already bloated. If caffeine makes you jittery, try half-caf, smaller amounts, or stopping earlier in the day.',
      },
    ],
    whenToSeeDoctor:
      'If you feel unable to control eating, binge often, or restrict food in ways that harm your health, see a doctor or eating-disorder specialist.',
  },
  {
    id: '17',
    slug: 'when-your-diet-affects-how-you-feel',
    category: 'nutrition',
    title: 'When eating the “wrong” things often — what can happen',
    intro:
      'Skipping meals, relying on sugar and salt, or drinking lots of caffeine can affect energy, mood, sleep, and bloating. Here is a plain-language look at implications — not blame, just information.',
    visualGuide: [
      { emoji: '📉', label: 'Energy crashes', description: 'Big sugar hits → crash later. Hard to focus.' },
      { emoji: '💧', label: 'Bloating & puffiness', description: 'Very salty meals + dehydration = worse bloating.' },
      { emoji: '😴', label: 'Poor sleep', description: 'Late caffeine or alcohol → sleep suffers → mood dips.' },
    ],
    sections: [
      {
        heading: 'Implications of too much added sugar',
        body:
          'Rapid rises and falls in blood sugar can feel like irritability, shakiness, or craving more sugar. Over time, a pattern of mostly sugary foods often means you miss fiber, vitamins, and minerals that support steady energy and gut health. That does not mean one dessert is “bad” — it is about overall pattern.',
      },
      {
        heading: 'Implications of too much salt',
        body:
          'Very salty meals can increase water retention, which some people notice as puffiness, bloating, or tight rings before their period. Drinking water does not “flush out” salt instantly, but staying hydrated and choosing lower-salt meals when you are already uncomfortable can help.',
      },
      {
        heading: 'Skipping meals or under-eating',
        body:
          'Going long without food can cause headaches, dizziness, irritability, and stronger cravings later. Your body needs fuel — especially if you are active or on your period. Regular meals support hormones and mood more than extreme restriction.',
      },
    ],
    whenToSeeDoctor:
      'See a doctor if you have persistent bloating, weight change you cannot explain, or symptoms of anemia or thyroid problems.',
  },
  {
    id: '18',
    slug: 'benefits-of-eating-the-right-foods',
    category: 'nutrition',
    title: 'Benefits of eating the right foods for you',
    intro:
      '“Right” means balanced, enough, and enjoyable — not perfect. When your meals regularly include plants, protein, fiber, and water, your body and mind often get clear benefits.',
    visualGuide: [
      { emoji: '⚡', label: 'Steadier energy', description: 'Fewer crashes and better focus through the day.' },
      { emoji: '😊', label: 'Mood support', description: 'Stable blood sugar and nutrients help brain chemistry.' },
      { emoji: '🌿', label: 'Digestion', description: 'Fiber and fluids support regular, comfortable digestion.' },
    ],
    sections: [
      {
        heading: 'Physical benefits',
        body:
          'Adequate protein helps repair tissue and keeps you full. Fiber supports gut bacteria and bowel regularity. Iron and vitamin C together (e.g. beans with peppers, or leafy greens with citrus) help iron absorption. Hydration supports skin, headaches, and cramps for many people.',
      },
      {
        heading: 'Mental and emotional benefits',
        body:
          'When you are not starving or on a sugar rollercoaster, many people find it easier to regulate mood and stress. Regular meals signal safety to your nervous system. That does not replace therapy or treatment for depression or anxiety — but nutrition is one pillar of self-care.',
      },
      {
        heading: 'Cycle-specific benefits',
        body:
          'Some people notice less bloating when they reduce very salty processed foods before their period. Others feel better with magnesium-rich foods in a normal diet (nuts, seeds, whole grains, greens). Everyone is different — use your own body as feedback, not strict rules.',
      },
    ],
    whenToSeeDoctor:
      'If you want personalized nutrition advice (e.g. PCOS, diabetes, pregnancy), ask your doctor or a registered dietitian.',
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: CategoryKey): Article[] {
  return ARTICLES.filter((a) => a.category === category);
}
