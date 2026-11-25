// "What a high / low result can mean" for markers that don't have improvement
// tips in guidance.js (mostly CBC, metabolic panel, iron and hormones). Kept
// short and mainstream; the UI always pairs it with "talk to your doctor".
// Keyed by lab_results test_name (markers.data.js `name`).

const SRC = {
  cbc: { label: 'MedlinePlus: Complete Blood Count', href: 'https://medlineplus.gov/lab-tests/complete-blood-count-cbc/' },
  diff: { label: 'MedlinePlus: Blood Differential', href: 'https://medlineplus.gov/lab-tests/blood-differential/' },
  cmp: { label: 'MedlinePlus: Comprehensive Metabolic Panel', href: 'https://medlineplus.gov/lab-tests/comprehensive-metabolic-panel-cmp/' },
  electrolytes: { label: 'MedlinePlus: Electrolyte Panel', href: 'https://medlineplus.gov/lab-tests/electrolyte-panel/' },
  liver: { label: 'MedlinePlus: Liver Function Tests', href: 'https://medlineplus.gov/lab-tests/liver-function-tests/' },
  iron: { label: 'MedlinePlus: Iron Tests', href: 'https://medlineplus.gov/lab-tests/iron-tests/' },
  thyroid: { label: 'MedlinePlus: Thyroid Tests', href: 'https://medlineplus.gov/thyroidtests.html' },
  testosterone: { label: 'MedlinePlus: Testosterone Levels Test', href: 'https://medlineplus.gov/lab-tests/testosterone-levels-test/' },
  estrogen: { label: 'MedlinePlus: Estrogen Levels Test', href: 'https://medlineplus.gov/lab-tests/estrogen-levels-test/' },
  dheas: { label: 'MedlinePlus: DHEA Sulfate Test', href: 'https://medlineplus.gov/lab-tests/dhea-sulfate-test/' },
  bun: { label: 'MedlinePlus: BUN Test', href: 'https://medlineplus.gov/lab-tests/bun-blood-urea-nitrogen/' },
  calcium: { label: 'MedlinePlus: Calcium Blood Test', href: 'https://medlineplus.gov/lab-tests/calcium-blood-test/' },
  albumin: { label: 'MedlinePlus: Albumin Blood Test', href: 'https://medlineplus.gov/lab-tests/albumin-blood-test/' },
  bilirubin: { label: 'MedlinePlus: Bilirubin Blood Test', href: 'https://medlineplus.gov/lab-tests/bilirubin-blood-test/' },
  alp: { label: 'MedlinePlus: Alkaline Phosphatase', href: 'https://medlineplus.gov/lab-tests/alkaline-phosphatase/' },
};

const redCells = {
  low: 'A low result can point to anemia. Common causes are low iron, B12 or folate, blood loss (including heavy periods), chronic illness, or simply being well hydrated. Small dips just under the line are common and often not significant on their own.',
  high: 'A high result most often reflects dehydration. It can also come from smoking, living at altitude, sleep apnea, testosterone therapy, or less often a bone-marrow condition.',
  sources: [SRC.cbc],
};

export const MEANINGS = {
  Hemoglobin: redCells,
  Hematocrit: redCells,
  RBC: redCells,
  MCV: {
    low: 'Smaller-than-usual red cells. The most common cause is iron deficiency; thalassemia trait is another.',
    high: 'Larger-than-usual red cells. Often linked to low B12 or folate, regular alcohol use, thyroid or liver issues, or some medications.',
    sources: [SRC.cbc],
  },
  MCH: {
    low: 'Less hemoglobin per red cell, usually alongside a low MCV. Iron deficiency is the most common reason.',
    high: 'More hemoglobin per cell, usually because the cells are larger (see MCV). B12 or folate deficiency is a common cause.',
    sources: [SRC.cbc],
  },
  MCHC: {
    low: 'Red cells are paler than usual, which commonly goes with iron deficiency.',
    high: 'Uncommon. Can reflect hereditary spherocytosis or be a lab artifact; usually rechecked.',
    sources: [SRC.cbc],
  },
  RDW: {
    low: 'A low RDW isn’t generally a concern.',
    high: 'Your red cells vary more in size than usual. It often shows up early in iron, B12 or folate deficiency, and is read alongside MCV.',
    sources: [SRC.cbc],
  },
  WBC: {
    low: 'Can follow a recent viral infection, and some healthy people simply run low. Medications, autoimmune conditions or bone-marrow problems are less common causes.',
    high: 'Usually your immune system responding to an infection, inflammation, stress, smoking or steroids. A persistently high count is worth following up.',
    sources: [SRC.cbc, SRC.diff],
  },
  Platelets: {
    low: 'Can come from a recent viral illness, medications, heavy alcohol use, liver disease or autoimmune conditions. Very low counts raise bleeding risk.',
    high: 'Often a reaction to inflammation, infection, iron deficiency or recent blood loss. Persistently high counts are worth a follow-up.',
    sources: [SRC.cbc],
  },
  'Neutrophils %': {
    low: 'Read together with the absolute count. Can follow viral infections or some medications.',
    high: 'Often a sign of a bacterial infection, inflammation, stress or steroid use.',
    sources: [SRC.diff],
  },
  'Neutrophils Abs': {
    low: 'Fewer infection-fighting neutrophils. Can follow viral illness or medications, and some people of African or Middle Eastern ancestry naturally run lower (benign ethnic neutropenia).',
    high: 'Usually a bacterial infection, inflammation, physical stress, smoking or steroid use.',
    sources: [SRC.diff],
  },
  'Lymphocytes %': {
    low: 'Read with the absolute count. Can reflect stress, steroids, or a high neutrophil share.',
    high: 'Often seen with viral infections.',
    sources: [SRC.diff],
  },
  'Lymphocytes Abs': {
    low: 'Can come from acute stress or illness, steroids, or immune conditions.',
    high: 'Commonly a viral infection. A persistently high count is worth following up.',
    sources: [SRC.diff],
  },
  'Monocytes %': {
    low: 'Usually not significant on its own.',
    high: 'Can reflect recovery from infection or chronic inflammation.',
    sources: [SRC.diff],
  },
  'Monocytes Abs': {
    low: 'Usually not significant on its own.',
    high: 'Can reflect recovery from infection, chronic infections or inflammation.',
    sources: [SRC.diff],
  },
  'Eosinophils %': {
    high: 'Commonly allergies, asthma, eczema or, less often, a parasitic infection.',
    sources: [SRC.diff],
  },
  'Eosinophils Abs': {
    high: 'Commonly allergies, asthma, eczema or, less often, a parasitic infection or medication reaction.',
    sources: [SRC.diff],
  },
  'Basophils %': {
    high: 'Can be seen with allergies or inflammation; rarely a bone-marrow condition.',
    sources: [SRC.diff],
  },
  'Basophils Abs': {
    high: 'Can be seen with allergies or inflammation; rarely a bone-marrow condition.',
    sources: [SRC.diff],
  },
  BUN: {
    low: 'Often reflects a low-protein diet or lots of fluid. Rarely, reduced liver function.',
    high: 'Commonly dehydration or a high-protein diet. It can also reflect reduced kidney function, so it’s read with creatinine.',
    sources: [SRC.bun],
  },
  'BUN/Creatinine Ratio': {
    low: 'Can reflect a low-protein diet or high muscle mass.',
    high: 'Often dehydration or high protein intake; occasionally bleeding in the upper gut.',
    sources: [SRC.bun],
  },
  Sodium: {
    low: 'Can come from drinking a lot of water, diuretics and some other medications, or heart, kidney or liver conditions.',
    high: 'Usually not drinking enough fluid or losing fluid (sweating, vomiting, diarrhea).',
    sources: [SRC.electrolytes],
  },
  Potassium: {
    low: 'Often from diuretics, vomiting or diarrhea. Low potassium can cause cramps and affect heart rhythm.',
    high: 'A common cause is the sample itself (hemolysis during the draw), so it’s often rechecked. True high potassium can come from kidney issues or some blood-pressure medications.',
    sources: [SRC.electrolytes],
  },
  Chloride: {
    low: 'Often follows vomiting or diuretic use; read alongside sodium and CO2.',
    high: 'Commonly dehydration or diarrhea; read alongside sodium and CO2.',
    sources: [SRC.electrolytes],
  },
  CO2: {
    low: 'Bicarbonate is lower, which can come from diarrhea, kidney issues, or fast breathing.',
    high: 'Can follow vomiting, diuretics or lung conditions that retain CO2.',
    sources: [SRC.electrolytes],
  },
  Calcium: {
    low: 'Most often goes with low albumin (so it’s read with it), or low vitamin D or magnesium.',
    high: 'The most common causes are an overactive parathyroid gland or too much calcium or vitamin D from supplements. Worth a follow-up.',
    sources: [SRC.calcium],
  },
  'Total Protein': {
    low: 'Can reflect low protein intake, liver or kidney issues, or poor absorption.',
    high: 'Often dehydration; occasionally chronic inflammation or infection.',
    sources: [SRC.cmp],
  },
  Albumin: {
    low: 'Can reflect inflammation, liver or kidney issues, or not enough protein.',
    high: 'Usually dehydration.',
    sources: [SRC.albumin],
  },
  Bilirubin: {
    high: 'Mildly high bilirubin is often Gilbert syndrome, a harmless, common inherited trait that rises with fasting or illness. Higher levels can point to liver or bile-duct issues or red-cell breakdown.',
    sources: [SRC.bilirubin],
  },
  'Direct Bilirubin': {
    high: 'Can point to a liver or bile-duct issue, so it’s worth discussing with your doctor.',
    sources: [SRC.bilirubin],
  },
  'Alk Phos': {
    low: 'Uncommon; can be linked to low zinc or magnesium.',
    high: 'Comes from liver or bone. Can be raised by bone growth or healing, vitamin D deficiency, or liver and bile-duct issues.',
    sources: [SRC.alp],
  },
  Iron: {
    low: 'Low iron stores, blood loss, or inflammation. Read with ferritin and iron saturation.',
    high: 'Can follow a recent iron supplement or iron-rich meal. Persistently high iron with high saturation can point to hemochromatosis.',
    sources: [SRC.iron],
  },
  TIBC: {
    low: 'Often seen with inflammation or iron overload.',
    high: 'Your body is ready to carry more iron, which commonly goes with iron deficiency.',
    sources: [SRC.iron],
  },
  UIBC: {
    low: 'Less spare iron-carrying capacity; can go with iron overload.',
    high: 'Commonly goes with iron deficiency.',
    sources: [SRC.iron],
  },
  'Iron Saturation': {
    low: 'Commonly iron deficiency, or iron tied up by inflammation.',
    high: 'Can follow recent supplements. Persistently above about 45% is worth checking for hemochromatosis.',
    sources: [SRC.iron],
  },
  'Free T4': {
    low: 'Can point to an underactive thyroid, especially with a high TSH.',
    high: 'Can point to an overactive thyroid, or too high a dose of thyroid medication. Biotin supplements can also skew the test.',
    sources: [SRC.thyroid],
  },
  'Free T3': {
    low: 'Can fall during illness, calorie restriction or an underactive thyroid.',
    high: 'Can point to an overactive thyroid.',
    sources: [SRC.thyroid],
  },
  'Free Testosterone': {
    low: 'Can come with aging, poor sleep, excess weight, high stress, or some medications.',
    high: 'Can come from testosterone therapy; in women, conditions such as PCOS.',
    sources: [SRC.testosterone],
  },
  Estradiol: {
    low: 'In men, can affect bone and libido; in women, varies a lot with the cycle and menopause.',
    high: 'In men, can come from excess body fat or testosterone therapy; in women, depends on cycle timing.',
    sources: [SRC.estrogen],
  },
  'DHEA-S': {
    low: 'Naturally declines with age; can also be low with adrenal issues or steroid use.',
    high: 'Can come from supplements, PCOS, or less often an adrenal condition.',
    sources: [SRC.dheas],
  },
};

/** What the latest result can mean, for position 'high' | 'low'. */
export function meaningFor(name, position) {
  const m = MEANINGS[name];
  if (!m || !position || !m[position]) return null;
  return { text: m[position], sources: m.sources || [] };
}
