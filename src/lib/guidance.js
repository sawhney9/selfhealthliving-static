// "How to move this number" guidance for lab markers (keyed by lab_results
// test_name) and calculators (keyed `tool:<slug>`). Kept general and
// mainstream; every entry ends with talking to a doctor in the UI.
// `read` are on-site article paths (the build fails if one doesn't exist);
// `sources` are public-health references (CDC, NIH, MedlinePlus, AHA).

const SRC = {
  cdcCholesterol: { label: 'CDC: Preventing High Cholesterol', href: 'https://www.cdc.gov/cholesterol/prevention/index.html' },
  ahaLevels: { label: 'American Heart Association: What Your Cholesterol Levels Mean', href: 'https://www.heart.org/en/health-topics/cholesterol/about-cholesterol/what-your-cholesterol-levels-mean' },
  ahaHdl: { label: 'American Heart Association: HDL, LDL and Triglycerides', href: 'https://www.heart.org/en/health-topics/cholesterol/hdl-good-ldl-bad-cholesterol-and-triglycerides' },
  ahaLpa: { label: 'American Heart Association: Lipoprotein(a)', href: 'https://www.heart.org/en/health-topics/cholesterol/causes-of-high-cholesterol/lipoprotein-a' },
  mpTriglycerides: { label: 'MedlinePlus: Triglycerides', href: 'https://medlineplus.gov/triglycerides.html' },
  cdcA1c: { label: 'CDC: A1C Test for Diabetes and Prediabetes', href: 'https://www.cdc.gov/diabetes/diabetes-testing/prediabetes-a1c-test.html' },
  cdcPrevent: { label: 'CDC: Preventing Type 2 Diabetes', href: 'https://www.cdc.gov/diabetes/prevention-type-2/index.html' },
  cdcInsulin: { label: 'CDC: Insulin Resistance and Type 2 Diabetes', href: 'https://www.cdc.gov/diabetes/about/insulin-resistance-type-2-diabetes.html' },
  mpCrp: { label: 'MedlinePlus: C-Reactive Protein Test', href: 'https://medlineplus.gov/lab-tests/c-reactive-protein-crp-test/' },
  odsVitaminD: { label: 'NIH: Vitamin D Fact Sheet', href: 'https://ods.od.nih.gov/factsheets/VitaminD-Consumer/' },
  odsB12: { label: 'NIH: Vitamin B12 Fact Sheet', href: 'https://ods.od.nih.gov/factsheets/VitaminB12-Consumer/' },
  odsIron: { label: 'NIH: Iron Fact Sheet', href: 'https://ods.od.nih.gov/factsheets/Iron-Consumer/' },
  odsMagnesium: { label: 'NIH: Magnesium Fact Sheet', href: 'https://ods.od.nih.gov/factsheets/Magnesium-Consumer/' },
  odsOmega3: { label: 'NIH: Omega-3 Fatty Acids Fact Sheet', href: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-Consumer/' },
  odsFolate: { label: 'NIH: Folate Fact Sheet', href: 'https://ods.od.nih.gov/factsheets/Folate-Consumer/' },
  mpFerritin: { label: 'MedlinePlus: Ferritin Blood Test', href: 'https://medlineplus.gov/lab-tests/ferritin-blood-test/' },
  niddkFattyLiver: { label: 'NIDDK: Fatty Liver Disease (NAFLD)', href: 'https://www.niddk.nih.gov/health-information/liver-disease/nafld-nash' },
  mpLiver: { label: 'MedlinePlus: Liver Function Tests', href: 'https://medlineplus.gov/lab-tests/liver-function-tests/' },
  mpUricAcid: { label: 'MedlinePlus: Uric Acid Test', href: 'https://medlineplus.gov/lab-tests/uric-acid-test/' },
  mpHomocysteine: { label: 'MedlinePlus: Homocysteine Test', href: 'https://medlineplus.gov/lab-tests/homocysteine-test/' },
  cdcKidney: { label: 'CDC: Preventing Chronic Kidney Disease', href: 'https://www.cdc.gov/kidney-disease/prevention/index.html' },
  niddkKidney: { label: 'NIDDK: Kidney Disease Tests and Diagnosis', href: 'https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/tests-diagnosis' },
  mpTestosterone: { label: 'MedlinePlus: Testosterone Levels Test', href: 'https://medlineplus.gov/lab-tests/testosterone-levels-test/' },
  mpTsh: { label: 'MedlinePlus: TSH Test', href: 'https://medlineplus.gov/lab-tests/tsh-thyroid-stimulating-hormone-test/' },
  cdcBloodPressure: { label: 'CDC: Preventing High Blood Pressure', href: 'https://www.cdc.gov/high-blood-pressure/prevention/index.html' },
  cdcHeart: { label: 'CDC: Preventing Heart Disease', href: 'https://www.cdc.gov/heart-disease/prevention/index.html' },
  cdcActivity: { label: 'CDC: Physical Activity Guidelines for Adults', href: 'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html' },
  cdcWeight: { label: 'CDC: Healthy Weight', href: 'https://www.cdc.gov/healthy-weight-growth/about/index.html' },
};

const lipids = {
  lower: [
    'Swap saturated fat (fatty red meat, butter, full-fat dairy) for olive oil, nuts, avocado and fish.',
    'Eat more soluble fiber: oats, beans, lentils, barley and psyllium bind cholesterol in your gut.',
    'Aim for at least 150 minutes a week of moderate activity, plus some strength training.',
    'If you carry extra weight, losing 5–10% of it improves your whole lipid panel.',
    'Ask your doctor whether medication makes sense, especially with a family history or other risk factors.',
  ],
  read: ['/train/apob-cholesterol-number-heart-disease/', '/train/fiber-gap-longevity-nutrient/', '/fuel/fiber-fix/'],
  sources: [SRC.cdcCholesterol, SRC.ahaLevels],
};

const glycemic = {
  lower: [
    'Build meals around protein, vegetables and fiber, and cut back on sugary drinks and refined carbs.',
    'Take a 10–15 minute walk after meals. It blunts the glucose spike that follows.',
    'Strength train 2–3 times a week. Muscle is where most of the glucose from a meal ends up.',
    'In the CDC’s prevention program, losing 5–7% of body weight cut the risk of type 2 diabetes by up to 58%.',
    'Sleep 7 or more hours. Short sleep makes your body more insulin resistant the next day.',
  ],
  read: [
    '/signals/decoding-blood-sugar/',
    '/train/normal-fasting-glucose-hidden-spikes-cgm/',
    '/train/why-diabetes-arrives-earlier-lighter-south-asians/',
  ],
  sources: [SRC.cdcPrevent, SRC.cdcInsulin],
};

const liver = {
  lower: [
    'Cut back on alcohol. GGT is especially sensitive to it.',
    'Fatty liver is the most common cause of a mildly high ALT. Losing even 3–5% of body weight reduces liver fat.',
    'Cut sugary drinks and refined carbs. Regular exercise lowers liver fat even without weight loss.',
    'Review medicines and supplements with your doctor. Some, including high doses of acetaminophen, stress the liver.',
  ],
  read: ['/signals/decoding-blood-sugar/'],
  sources: [SRC.niddkFattyLiver, SRC.mpLiver],
};

const kidney = {
  raise: [
    'Keep blood pressure and blood sugar in range. They are the two biggest drivers of kidney decline.',
    'Use NSAIDs like ibuprofen and naproxen sparingly. Regular use can harm the kidneys.',
    'Creatine supplements, a lot of muscle, or a very high-protein diet can raise creatinine without kidney damage. Mention them to your doctor.',
    'One low reading isn’t a diagnosis. Kidney disease is confirmed only if it stays low for 3 months or more.',
  ],
  read: ['/train/creatine-beyond-muscle-longevity/'],
  sources: [SRC.cdcKidney, SRC.niddkKidney],
};

const bloodPressure = {
  lower: [
    'Cut sodium. Most of it comes from packaged and restaurant food, not the salt shaker.',
    'Eat more vegetables, fruit, beans and low-fat dairy (the DASH pattern).',
    'Move at least 150 minutes a week, limit alcohol, and lose extra weight if you carry it.',
    'Measure at home: seated, after 5 minutes of rest, at the same time each day.',
  ],
  read: ['/train/hiit-workout-after-40/'],
  sources: [SRC.cdcBloodPressure, SRC.cdcHeart],
};

export const GUIDANCE = {
  LDL: lipids,
  'Total Cholesterol': lipids,
  ApoB: lipids,
  'Non-HDL Cholesterol': lipids,
  'LDL-P': lipids,
  HDL: {
    raise: [
      'Regular aerobic exercise is the most reliable way to raise HDL.',
      'Don’t smoke. Smoking lowers HDL.',
      'Replace refined carbs and trans fats with unsaturated fats like olive oil, nuts and fish.',
      'Very high HDL isn’t extra protection, so there’s no need to chase it with supplements.',
    ],
    read: ['/train/vo2-max-longevity-predictor-how-to-raise-it/', '/train/hiit-workout-after-40/'],
    sources: [SRC.ahaHdl],
  },
  Triglycerides: {
    lower: [
      'Cut back on added sugar, sweet drinks and refined carbs. They raise triglycerides more than dietary fat does.',
      'Limit alcohol. Even moderate drinking pushes triglycerides up.',
      'Eat fatty fish like salmon, sardines or mackerel twice a week.',
      'Exercise and weight loss bring triglycerides down quickly, often within weeks.',
    ],
    read: ['/signals/fish-oil-omega-3-dose-that-actually-works/', '/signals/decoding-blood-sugar/'],
    sources: [SRC.mpTriglycerides, SRC.ahaHdl],
  },
  'Lp(a)': {
    lower: [
      'Lp(a) is mostly set by your genes. Diet and exercise barely change it.',
      'What you can change is everything else: lower LDL and ApoB, blood pressure and blood sugar.',
      'One test is usually enough for life. If yours is high, tell your doctor and your close relatives.',
    ],
    read: ['/train/lpa-inherited-heart-risk-never-tested/'],
    sources: [SRC.ahaLpa],
  },
  HbA1c: { ...glycemic, sources: [SRC.cdcA1c, SRC.cdcPrevent] },
  Glucose: {
    ...glycemic,
    raise: [
      'A fasting glucose below 70 mg/dL can mean low blood sugar. If you feel shaky, sweaty or confused, talk to your doctor, especially if you take diabetes medication.',
    ],
  },
  'Fasting Insulin': glycemic,
  'hs-CRP': {
    lower: [
      'A recent cold, injury or hard workout can spike hs-CRP. Retest after 2 weeks before reading much into one high value.',
      'Losing extra weight, especially around the waist, lowers it.',
      'Regular exercise, not smoking and good sleep all bring it down.',
      'Eating plenty of vegetables, fruit, whole grains, fish and olive oil is linked to lower CRP.',
    ],
    read: ['/train/deep-sleep-brain-repair-longevity/', '/train/zombie-cells-senescent-cells-age-tissue/'],
    sources: [SRC.mpCrp],
  },
  'Vitamin D': {
    raise: [
      'Short periods of midday sun on bare skin help. How much you need depends on skin tone, latitude and season.',
      'Eat fatty fish, egg yolks and fortified foods.',
      'Supplements work well for most people. Ask your doctor about a dose, then retest in about 3 months.',
    ],
    lower: ['Very high levels almost always come from high-dose supplements. Cut back and talk to your doctor.'],
    read: ['/fuel/vitamin-d-the-super-nutrient-you-get-for-free/', '/train/vitamin-d-supplement-trials-reality/'],
    sources: [SRC.odsVitaminD],
  },
  'Vitamin B12': {
    raise: [
      'B12 comes from animal foods: meat, fish, eggs and dairy. If you eat vegan or vegetarian, use fortified foods or a supplement.',
      'Metformin and acid-reducing drugs (PPIs) can lower B12 over time. Ask your doctor to keep an eye on it.',
      'Absorption drops with age, so adults over 50 often do better with fortified foods or supplements.',
    ],
    sources: [SRC.odsB12],
  },
  Ferritin: {
    raise: [
      'Eat iron-rich foods: red meat, poultry, fish, beans, lentils, spinach and fortified cereal.',
      'Pair plant iron with vitamin C (citrus, peppers), and keep tea and coffee away from iron-rich meals.',
      'Low iron has a cause, like heavy periods, blood loss or poor absorption. Work it out with your doctor before taking iron.',
    ],
    lower: [
      'Ferritin also rises with inflammation, liver stress and alcohol, not only from too much iron.',
      'Very high values can mean hemochromatosis, an inherited iron overload. Ask your doctor about an iron saturation test.',
      'Don’t take iron supplements unless your doctor recommends them.',
    ],
    sources: [SRC.mpFerritin, SRC.odsIron],
  },
  ALT: liver,
  AST: {
    ...liver,
    lower: ['A hard workout in the last few days can raise AST from muscle, so retest after rest.', ...liver.lower],
  },
  GGT: liver,
  'Uric Acid': {
    lower: [
      'Limit alcohol, especially beer, and drinks sweetened with sugar or high-fructose corn syrup.',
      'Eat organ meats and some shellfish less often. They are high in purines.',
      'Drink plenty of water and lose extra weight if you carry it.',
    ],
    sources: [SRC.mpUricAcid],
  },
  Homocysteine: {
    lower: [
      'High homocysteine is often a sign of low B12, folate or B6.',
      'Eat leafy greens, beans and fortified grains for folate, and animal foods or fortified foods for B12.',
      'Ask your doctor to check B12 and folate before you start supplements.',
    ],
    sources: [SRC.mpHomocysteine, SRC.odsFolate],
  },
  eGFR: kidney,
  Creatinine: { lower: kidney.raise, read: kidney.read, sources: kidney.sources },
  'Cystatin C': { lower: kidney.raise, read: kidney.read, sources: kidney.sources },
  'Omega-3 Index': {
    raise: [
      'Eat fatty fish like salmon, sardines or mackerel two or more times a week.',
      'Fish oil or algae oil raises the index. What counts is the dose of EPA and DHA, not the size of the capsule.',
      'Retest after 3–4 months. Red blood cells turn over slowly.',
    ],
    read: ['/train/omega-3-index/', '/signals/fish-oil-omega-3-dose-that-actually-works/'],
    sources: [SRC.odsOmega3],
  },
  Magnesium: {
    raise: [
      'Eat nuts, seeds, beans, leafy greens and whole grains.',
      'Diuretics and acid-reducing drugs (PPIs) can lower magnesium. Ask your doctor.',
      'Blood magnesium can look normal even when your body’s stores are low.',
    ],
    read: ['/fuel/magnesium-guide/'],
    sources: [SRC.odsMagnesium],
  },
  Folate: {
    raise: [
      'Eat leafy greens, beans, lentils, asparagus and fortified grains.',
      'If you could become pregnant, the CDC recommends 400 mcg of folic acid every day.',
    ],
    sources: [SRC.odsFolate],
  },
  Testosterone: {
    raise: [
      'Sleep 7–9 hours. Short sleep lowers testosterone.',
      'Strength train, and lose extra body fat if you carry it.',
      'Limit alcohol.',
      'A low reading needs a repeat early-morning test before any treatment decision.',
    ],
    read: ['/train/strength-training-after-40/', '/train/anabolic-resistance-protein-after-50/'],
    sources: [SRC.mpTestosterone],
  },
  TSH: {
    lower: [
      'A TSH outside the range usually means your thyroid needs a doctor’s look. Lifestyle changes don’t fix it.',
      'Retest before acting. Recent illness and biotin supplements can throw the result off.',
    ],
    sources: [SRC.mpTsh],
  },
  'Systolic BP': bloodPressure,
  'Diastolic BP': bloodPressure,

  'tool:grip-strength-tracker': {
    raise: [
      'Train grip directly: deadlifts, farmer’s carries and dead hangs, 2–3 times a week.',
      'Full-body strength training raises grip as a side effect.',
      'Eat enough protein, about 1.2–1.6 g per kg of body weight a day if you’re training, especially after 50.',
    ],
    read: ['/train/grip-strength-longevity-biomarker/', '/train/strength-training-after-40/', '/train/anabolic-resistance-protein-after-50/'],
    sources: [SRC.cdcActivity],
  },
  'tool:vo2-max-walk-test': {
    raise: [
      'Build an aerobic base with 2–3 hours a week of easy Zone 2 cardio, where you can still talk in full sentences.',
      'Add one hard interval session a week, such as 4 rounds of 4 minutes hard and 3 minutes easy.',
      'Consistency matters more than intensity. Most people see gains within 8–12 weeks.',
    ],
    read: ['/train/vo2-max-longevity-predictor-how-to-raise-it/', '/train/hiit-workout-after-40/', '/train/walking-speed-predicts-lifespan/'],
    sources: [SRC.cdcActivity],
  },
  'tool:waist-to-height-ratio': {
    lower: [
      'Visceral fat responds well to exercise. Combine cardio with strength training.',
      'Eat more protein and fiber, and cut sugary drinks and alcohol.',
      'Sleep 7 or more hours. Short sleep is linked to more belly fat.',
    ],
    read: ['/train/fiber-gap-longevity-nutrient/', '/train/strength-training-after-40/'],
    sources: [SRC.cdcWeight, SRC.cdcActivity],
  },
};

// Calculators built on lab markers reuse that marker's guidance.
GUIDANCE['tool:triglyceride-hdl-ratio'] = GUIDANCE.Triglycerides;
GUIDANCE['tool:non-hdl-cholesterol'] = lipids;
GUIDANCE['tool:homa-ir'] = glycemic;
GUIDANCE['tool:a1c-to-average-glucose'] = GUIDANCE.HbA1c;
GUIDANCE['tool:egfr-calculator'] = kidney;

/**
 * The tips that fit where a value sits: 'high' → ways to lower it, 'low' → ways
 * to raise it, in range → the marker's usual direction ("keep it here").
 */
export function guidanceFor(key, position) {
  const g = GUIDANCE[key];
  if (!g) return null;
  let direction = position === 'high' ? 'lower' : position === 'low' ? 'raise' : null;
  if (!direction || !g[direction]) direction = g.lower ? 'lower' : 'raise';
  if (!g[direction]) return null;
  return { direction, tips: g[direction], read: g.read || [], sources: g.sources || [] };
}

/** Every on-site path referenced, so pages can check them at build time. */
export const GUIDANCE_PATHS = [...new Set(Object.values(GUIDANCE).flatMap((g) => g.read || []))];
