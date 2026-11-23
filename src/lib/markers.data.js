// Generated from the SelfHealth iOS app (HealthApp: LabMarker in
// BloodworkViewModel.swift, ranges in BloodMarkerRange.swift and
// BloodworkAnalysisService.swift) so the website names, ranges and flags
// lab results exactly like the app. `name` is the lab_results.test_name
// value; don't edit by hand, re-run the port when the app changes.

export const MARKERS = [
  {
    "name": "LDL-P",
    "fullName": "LDL Particle Number",
    "category": "Cardiovascular (Advanced)",
    "unit": "nmol/L",
    "about": "Counts the total number of LDL particles in your blood. A higher particle count raises cardiovascular risk even when cholesterol looks normal."
  },
  {
    "name": "LDL Small",
    "fullName": "Small LDL Particles",
    "category": "Cardiovascular (Advanced)",
    "unit": "nmol/L",
    "about": "Measures the concentration of small, dense LDL particles. These are more prone to oxidation and are a stronger predictor of arterial plaque than standard LDL."
  },
  {
    "name": "Lp(a)",
    "fullName": "Lipoprotein(a)",
    "category": "Cardiovascular (Advanced)",
    "unit": "mg/dL",
    "about": "A genetically-determined lipoprotein that carries cholesterol and promotes clotting. Elevated levels are an independent risk factor for heart attack and stroke.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0,
      "optimalHigh": 30,
      "normalHigh": 50,
      "criticalHigh": 75
    }
  },
  {
    "name": "ApoB",
    "fullName": "Apolipoprotein B",
    "category": "Cardiovascular (Advanced)",
    "unit": "mg/dL",
    "about": "Counts every potentially harmful lipoprotein particle — each LDL, VLDL, and IDL carries exactly one ApoB molecule, making this the most direct measure of cardiovascular particle risk.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0,
      "optimalHigh": 80,
      "normalHigh": 100,
      "criticalHigh": 130
    }
  },
  {
    "name": "HbA1c",
    "fullName": "Hemoglobin A1c",
    "category": "Metabolic & Organ",
    "unit": "%",
    "about": "Reflects your average blood sugar level over the past 2–3 months by measuring sugar attached to hemoglobin. It is the gold standard for monitoring long-term glucose control.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 4.0,
      "optimalHigh": 5.4,
      "normalHigh": 6.4,
      "criticalHigh": 10
    }
  },
  {
    "name": "Vitamin D",
    "fullName": "Vitamin D (25-OH)",
    "category": "Metabolic & Organ",
    "unit": "ng/mL",
    "about": "Measures the main circulating form of vitamin D in the blood. Adequate levels support bone health, immune function, mood, and inflammation regulation.",
    "range": {
      "criticalLow": 10,
      "normalLow": 20,
      "optimalLow": 50,
      "optimalHigh": 80,
      "normalHigh": 100,
      "criticalHigh": null
    }
  },
  {
    "name": "ALT",
    "fullName": "Alanine Aminotransferase",
    "category": "Metabolic & Organ",
    "unit": "U/L",
    "about": "An enzyme that leaks into the blood when liver cells are stressed or damaged. It is the most sensitive routine marker for liver health.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 9.0,
      "optimalHigh": 46.0,
      "normalHigh": 56,
      "criticalHigh": 200
    }
  },
  {
    "name": "AST",
    "fullName": "Aspartate Aminotransferase",
    "category": "Metabolic & Organ",
    "unit": "U/L",
    "about": "An enzyme found in the liver, heart, and muscles. Elevated levels alongside ALT suggest liver damage; in isolation they may point to muscle stress.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 10.0,
      "optimalHigh": 40.0,
      "normalHigh": 40,
      "criticalHigh": 200
    }
  },
  {
    "name": "Fasting Insulin",
    "fullName": "Fasting Insulin",
    "category": "Metabolic & Organ",
    "unit": "μIU/mL",
    "about": "Measures insulin in the blood after an overnight fast. High levels signal insulin resistance — one of the earliest detectable steps toward type 2 diabetes.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 2.0,
      "optimalHigh": 5.0,
      "normalHigh": 6.5,
      "criticalHigh": 10.0
    }
  },
  {
    "name": "hs-CRP",
    "fullName": "High-Sensitivity C-Reactive Protein",
    "category": "Inflammation & Micronutrients",
    "unit": "mg/L",
    "about": "A highly sensitive measure of systemic inflammation. Even mildly elevated levels are associated with increased cardiovascular and metabolic risk.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0,
      "optimalHigh": 1.0,
      "normalHigh": 3.0,
      "criticalHigh": 10
    }
  },
  {
    "name": "Total Cholesterol",
    "fullName": "Total Cholesterol",
    "category": "Cardiovascular (Advanced)",
    "unit": "mg/dL",
    "about": "The combined total of all cholesterol types in your blood. It is most useful when interpreted alongside the individual HDL, LDL, and triglyceride fractions.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 100,
      "optimalHigh": 200,
      "normalHigh": 239,
      "criticalHigh": 280
    }
  },
  {
    "name": "HDL",
    "fullName": "HDL Cholesterol",
    "category": "Cardiovascular (Advanced)",
    "unit": "mg/dL",
    "about": "Often called 'good' cholesterol, HDL removes excess cholesterol from arteries and transports it to the liver for disposal. Higher levels are protective.",
    "range": {
      "criticalLow": 30,
      "normalLow": 40,
      "optimalLow": 60,
      "optimalHigh": 100,
      "normalHigh": 100,
      "criticalHigh": null
    }
  },
  {
    "name": "LDL",
    "fullName": "LDL Cholesterol",
    "category": "Cardiovascular (Advanced)",
    "unit": "mg/dL",
    "about": "Often called 'bad' cholesterol, LDL carries cholesterol from the liver to cells. Excess LDL can deposit in artery walls and contribute to plaque buildup.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0,
      "optimalHigh": 100,
      "normalHigh": 160,
      "criticalHigh": 190
    }
  },
  {
    "name": "Triglycerides",
    "fullName": "Triglycerides",
    "category": "Cardiovascular (Advanced)",
    "unit": "mg/dL",
    "about": "A type of fat derived from calories your body doesn't immediately use. High levels are strongly linked to metabolic syndrome, insulin resistance, and cardiovascular risk.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0,
      "optimalHigh": 100,
      "normalHigh": 150,
      "criticalHigh": 200
    }
  },
  {
    "name": "Glucose",
    "fullName": "Fasting Glucose",
    "category": "Metabolic & Organ",
    "unit": "mg/dL",
    "about": "Measures blood sugar after fasting. It is the primary screen for diabetes and insulin resistance, and reflects how well your body manages carbohydrate intake.",
    "range": {
      "criticalLow": 50,
      "normalLow": 70,
      "optimalLow": 70,
      "optimalHigh": 99,
      "normalHigh": 126,
      "criticalHigh": 200
    }
  },
  {
    "name": "TSH",
    "fullName": "Thyroid Stimulating Hormone",
    "category": "Metabolic & Organ",
    "unit": "mIU/L",
    "about": "The pituitary signal that tells the thyroid how hard to work. High TSH suggests an underactive thyroid (hypothyroidism); low TSH suggests an overactive thyroid.",
    "range": {
      "criticalLow": 0.01,
      "normalLow": 0.4,
      "optimalLow": 0.5,
      "optimalHigh": 2.5,
      "normalHigh": 4.5,
      "criticalHigh": 10
    }
  },
  {
    "name": "Free T4",
    "fullName": "Free Thyroxine (T4)",
    "category": "Metabolic & Organ",
    "unit": "ng/dL",
    "about": "The unbound, active form of thyroxine available to body tissues. Used alongside TSH to get a complete picture of thyroid function.",
    "range": {
      "criticalLow": null,
      "normalLow": 0.6,
      "optimalLow": 0.8,
      "optimalHigh": 1.8,
      "normalHigh": 2.34,
      "criticalHigh": 3.6
    }
  },
  {
    "name": "Testosterone",
    "fullName": "Total Testosterone",
    "category": "Metabolic & Organ",
    "unit": "ng/dL",
    "about": "The primary androgen hormone. It regulates muscle mass, bone density, libido, energy, and mood in both men (high levels) and women (lower levels).",
    "range": {
      "criticalLow": 100,
      "normalLow": 264,
      "optimalLow": 400,
      "optimalHigh": 800,
      "normalHigh": 1000,
      "criticalHigh": null
    }
  },
  {
    "name": "Vitamin B12",
    "fullName": "Vitamin B12",
    "category": "Metabolic & Organ",
    "unit": "pg/mL",
    "about": "Essential for nerve function, DNA synthesis, and red blood cell formation. Deficiency develops slowly and can cause irreversible neurological damage if untreated.",
    "range": {
      "criticalLow": 100,
      "normalLow": 200.0,
      "optimalLow": 200.0,
      "optimalHigh": 900.0,
      "normalHigh": 1170.0,
      "criticalHigh": null
    }
  },
  {
    "name": "Ferritin",
    "fullName": "Ferritin",
    "category": "Metabolic & Organ",
    "unit": "ng/mL",
    "about": "A protein that stores iron inside cells. It is the most accurate indicator of your body's total iron reserves — more reliable than serum iron alone.",
    "range": {
      "criticalLow": null,
      "normalLow": 24.0,
      "optimalLow": 30.0,
      "optimalHigh": 300.0,
      "normalHigh": 390.0,
      "criticalHigh": null
    }
  },
  {
    "name": "GGT",
    "fullName": "Gamma-Glutamyl Transferase",
    "category": "Organ & Kidney",
    "unit": "U/L",
    "about": "An enzyme concentrated in the liver and bile ducts. It is particularly sensitive to alcohol intake and is elevated early in bile duct obstruction or liver stress.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0,
      "optimalHigh": 60.0,
      "normalHigh": 78.0,
      "criticalHigh": 180.0
    }
  },
  {
    "name": "Alk Phos",
    "fullName": "Alkaline Phosphatase",
    "category": "Organ & Kidney",
    "unit": "U/L",
    "about": "An enzyme found in the liver and bones. Elevated levels can indicate bile duct problems, liver disease, or accelerated bone turnover.",
    "range": {
      "criticalLow": null,
      "normalLow": 35.2,
      "optimalLow": 44.0,
      "optimalHigh": 147.0,
      "normalHigh": 191.1,
      "criticalHigh": 294.0
    }
  },
  {
    "name": "Bilirubin",
    "fullName": "Total Bilirubin",
    "category": "Organ & Kidney",
    "unit": "mg/dL",
    "about": "A yellow pigment produced when red blood cells break down and processed by the liver. High levels cause jaundice and can indicate liver or bile duct problems.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0.1,
      "optimalHigh": 1.2,
      "normalHigh": 1.8,
      "criticalHigh": 3.6
    }
  },
  {
    "name": "Creatinine",
    "fullName": "Creatinine",
    "category": "Organ & Kidney",
    "unit": "mg/dL",
    "about": "A muscle-metabolism waste product filtered by the kidneys. Rising creatinine is a reliable sign that kidney filtration is declining.",
    "range": {
      "criticalLow": null,
      "normalLow": 0.525,
      "optimalLow": 0.7,
      "optimalHigh": 1.3,
      "normalHigh": 1.82,
      "criticalHigh": 3.25
    }
  },
  {
    "name": "eGFR",
    "fullName": "eGFR",
    "category": "Organ & Kidney",
    "unit": "mL/min",
    "about": "Estimates how many millilitres of blood your kidneys filter per minute. It is the most accurate single measure of overall kidney function.",
    "range": {
      "criticalLow": 15,
      "normalLow": 30,
      "optimalLow": 60,
      "optimalHigh": 120,
      "normalHigh": 140,
      "criticalHigh": null
    }
  },
  {
    "name": "Free Testosterone",
    "fullName": "Free Testosterone",
    "category": "Metabolic & Organ",
    "unit": "ng/dL",
    "about": "The biologically active fraction of testosterone not bound to proteins. It better reflects testosterone's real effects on tissues than total testosterone.",
    "range": {
      "criticalLow": null,
      "normalLow": 6.75,
      "optimalLow": 9.0,
      "optimalHigh": 30.0,
      "normalHigh": 39.0,
      "criticalHigh": null
    }
  },
  {
    "name": "Estradiol",
    "fullName": "Estradiol (E2)",
    "category": "Metabolic & Organ",
    "unit": "pg/mL",
    "about": "The primary form of estrogen. It regulates reproductive health, bone density, mood, and cardiovascular function in both women and men.",
    "range": {
      "criticalLow": null,
      "normalLow": 5.0,
      "optimalLow": 10.0,
      "optimalHigh": 40.0,
      "normalHigh": 60.0,
      "criticalHigh": 80.0
    }
  },
  {
    "name": "Free T3",
    "fullName": "Free Triiodothyronine (T3)",
    "category": "Metabolic & Organ",
    "unit": "pg/mL",
    "about": "The active thyroid hormone that directly drives metabolism, heart rate, body temperature, and energy production at the cellular level.",
    "range": {
      "criticalLow": null,
      "normalLow": 1.725,
      "optimalLow": 2.3,
      "optimalHigh": 4.2,
      "normalHigh": 5.46,
      "criticalHigh": null
    }
  },
  {
    "name": "DHEA-S",
    "fullName": "Dehydroepiandrosterone Sulfate",
    "category": "Metabolic & Organ",
    "unit": "μg/dL",
    "about": "A hormone made by the adrenal glands that serves as a precursor to testosterone and estrogen. Levels naturally decline with age and reflect adrenal reserve.",
    "range": {
      "criticalLow": null,
      "normalLow": 60.0,
      "optimalLow": 100.0,
      "optimalHigh": 400.0,
      "normalHigh": 520.0,
      "criticalHigh": null
    }
  },
  {
    "name": "Uric Acid",
    "fullName": "Uric Acid",
    "category": "Metabolic & Organ",
    "unit": "mg/dL",
    "about": "A waste product from purine breakdown that accumulates when the kidneys cannot keep up. Excess levels crystallize in joints (gout) and are linked to kidney stones and metabolic syndrome.",
    "range": {
      "criticalLow": null,
      "normalLow": 2.8,
      "optimalLow": 3.5,
      "optimalHigh": 6.0,
      "normalHigh": 7.8,
      "criticalHigh": 10.8
    }
  },
  {
    "name": "Magnesium",
    "fullName": "Serum Magnesium",
    "category": "Metabolic & Organ",
    "unit": "mg/dL",
    "about": "An essential mineral involved in over 300 enzymatic reactions, including muscle contraction, nerve signaling, DNA repair, and blood sugar regulation.",
    "range": {
      "criticalLow": 1.4,
      "normalLow": 1.7,
      "optimalLow": 2.0,
      "optimalHigh": 2.5,
      "normalHigh": 3.0,
      "criticalHigh": 3.75
    }
  },
  {
    "name": "Omega-3 Index",
    "fullName": "Omega-3 Index",
    "category": "Metabolic & Organ",
    "unit": "%",
    "about": "The percentage of EPA and DHA omega-3 fatty acids in red blood cell membranes. Higher values are associated with lower cardiovascular, inflammatory, and cognitive risk.",
    "range": {
      "criticalLow": null,
      "normalLow": 4.0,
      "optimalLow": 8.0,
      "optimalHigh": 12.0,
      "normalHigh": 15.0,
      "criticalHigh": null
    }
  },
  {
    "name": "Homocysteine",
    "fullName": "Homocysteine",
    "category": "Organ & Kidney",
    "unit": "μmol/L",
    "about": "An amino acid that, when elevated, damages the inner lining of blood vessels and promotes clotting. High levels are linked to B-vitamin deficiency and cardiovascular disease.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0,
      "optimalHigh": 9.0,
      "normalHigh": 15.0,
      "criticalHigh": 30.0
    }
  },
  {
    "name": "Cystatin C",
    "fullName": "Cystatin C",
    "category": "Organ & Kidney",
    "unit": "mg/L",
    "about": "A protein filtered by the kidneys at a constant rate, making it more accurate than creatinine for detecting early or mild kidney dysfunction.",
    "range": {
      "criticalLow": null,
      "normalLow": 0.4,
      "optimalLow": 0.5,
      "optimalHigh": 1.0,
      "normalHigh": 1.5,
      "criticalHigh": 2.5
    }
  },
  {
    "name": "Systolic BP",
    "fullName": "Blood Pressure Systolic",
    "category": "Cardiovascular (Advanced)",
    "unit": "mmHg",
    "about": "The pressure in your arteries when your heart contracts and pushes blood out. Chronically elevated levels strain the heart, arteries, and kidneys.",
    "range": {
      "criticalLow": 70,
      "normalLow": 90,
      "optimalLow": 90,
      "optimalHigh": 115,
      "normalHigh": 130,
      "criticalHigh": 160
    }
  },
  {
    "name": "Diastolic BP",
    "fullName": "Blood Pressure Diastolic",
    "category": "Cardiovascular (Advanced)",
    "unit": "mmHg",
    "about": "The pressure in your arteries between heartbeats while the heart relaxes. Persistently high values indicate the arterial walls are under constant stress.",
    "range": {
      "criticalLow": 40,
      "normalLow": 60,
      "optimalLow": 60,
      "optimalHigh": 75,
      "normalHigh": 80,
      "criticalHigh": 100
    }
  },
  {
    "name": "WBC",
    "fullName": "White Blood Cell Count",
    "category": "Organ & Kidney",
    "unit": "K/µL",
    "about": "Counts the white blood cells that defend against infection and disease. Abnormal counts can indicate infection, inflammation, immune suppression, or blood disorders.",
    "range": {
      "criticalLow": 2.0,
      "normalLow": 4.5,
      "optimalLow": 4.5,
      "optimalHigh": 10.5,
      "normalHigh": 10.5,
      "criticalHigh": 20.0
    }
  },
  {
    "name": "RBC",
    "fullName": "Red Blood Cell Count",
    "category": "Organ & Kidney",
    "unit": "M/µL",
    "about": "Counts the red blood cells that carry oxygen to every tissue. Abnormal values can indicate anemia (low) or conditions like dehydration or polycythemia (high).",
    "range": {
      "criticalLow": 3.0,
      "normalLow": 4.2,
      "optimalLow": 4.2,
      "optimalHigh": 5.9,
      "normalHigh": 5.9,
      "criticalHigh": 7.0
    }
  },
  {
    "name": "Hemoglobin",
    "fullName": "Hemoglobin",
    "category": "Organ & Kidney",
    "unit": "g/dL",
    "about": "The iron-containing protein inside red blood cells that binds and transports oxygen. Low levels cause anemia symptoms such as fatigue and shortness of breath.",
    "range": {
      "criticalLow": 7.0,
      "normalLow": 12.0,
      "optimalLow": 13.5,
      "optimalHigh": 17.5,
      "normalHigh": 17.5,
      "criticalHigh": 20.0
    }
  },
  {
    "name": "Hematocrit",
    "fullName": "Hematocrit",
    "category": "Organ & Kidney",
    "unit": "%",
    "about": "The percentage of blood volume occupied by red blood cells. Used together with hemoglobin to characterize the severity of anemia or erythrocytosis.",
    "range": {
      "criticalLow": 20,
      "normalLow": 36,
      "optimalLow": 40,
      "optimalHigh": 52,
      "normalHigh": 52,
      "criticalHigh": 60
    }
  },
  {
    "name": "MCV",
    "fullName": "Mean Corpuscular Volume",
    "category": "Organ & Kidney",
    "unit": "fL",
    "about": "The average size of red blood cells. Large cells point toward B12 or folate deficiency; small cells typically indicate iron deficiency or thalassemia.",
    "range": {
      "criticalLow": 60,
      "normalLow": 80,
      "optimalLow": 80,
      "optimalHigh": 100,
      "normalHigh": 100,
      "criticalHigh": 120
    }
  },
  {
    "name": "MCH",
    "fullName": "Mean Corpuscular Hemoglobin",
    "category": "Organ & Kidney",
    "unit": "pg",
    "about": "The average amount of hemoglobin per red blood cell. Interpreted alongside MCV to classify the type and likely cause of anemia.",
    "range": {
      "criticalLow": 15,
      "normalLow": 27,
      "optimalLow": 27,
      "optimalHigh": 33,
      "normalHigh": 33,
      "criticalHigh": 40
    }
  },
  {
    "name": "MCHC",
    "fullName": "Mean Corpuscular Hemoglobin Concentration",
    "category": "Organ & Kidney",
    "unit": "g/dL",
    "about": "The average concentration of hemoglobin within each red blood cell. Low MCHC is a hallmark of iron-deficiency anemia.",
    "range": {
      "criticalLow": 28,
      "normalLow": 32,
      "optimalLow": 32,
      "optimalHigh": 36,
      "normalHigh": 36,
      "criticalHigh": 40
    }
  },
  {
    "name": "RDW",
    "fullName": "Red Cell Distribution Width",
    "category": "Organ & Kidney",
    "unit": "%",
    "about": "Measures variation in red blood cell size. High variation often signals mixed nutrient deficiencies or early iron or B12/folate deficiency before anemia is apparent.",
    "range": {
      "criticalLow": null,
      "normalLow": 11.5,
      "optimalLow": 11.5,
      "optimalHigh": 14.5,
      "normalHigh": 14.5,
      "criticalHigh": 20.0
    }
  },
  {
    "name": "Platelets",
    "fullName": "Platelet Count",
    "category": "Organ & Kidney",
    "unit": "K/µL",
    "about": "Cell fragments that clump together to form clots and stop bleeding. Low counts raise bleeding risk; high counts can indicate inflammation or clotting disorders.",
    "range": {
      "criticalLow": 50,
      "normalLow": 150,
      "optimalLow": 150,
      "optimalHigh": 400,
      "normalHigh": 400,
      "criticalHigh": 1000
    }
  },
  {
    "name": "Neutrophils %",
    "fullName": "Neutrophils %",
    "category": "Organ & Kidney",
    "unit": "%",
    "about": "The most abundant white blood cells and first responders to bacterial infections. Percentage elevations are common during acute infection or significant stress.",
    "range": {
      "criticalLow": null,
      "normalLow": 40,
      "optimalLow": 40,
      "optimalHigh": 70,
      "normalHigh": 70,
      "criticalHigh": 90
    }
  },
  {
    "name": "Lymphocytes %",
    "fullName": "Lymphocytes %",
    "category": "Organ & Kidney",
    "unit": "%",
    "about": "White blood cells (T cells, B cells, NK cells) that orchestrate adaptive immunity. Elevated in viral infections; reduced in certain immune or inflammatory conditions.",
    "range": {
      "criticalLow": null,
      "normalLow": 20,
      "optimalLow": 20,
      "optimalHigh": 45,
      "normalHigh": 45,
      "criticalHigh": 60
    }
  },
  {
    "name": "Monocytes %",
    "fullName": "Monocytes %",
    "category": "Organ & Kidney",
    "unit": "%",
    "about": "Large white blood cells that mature into macrophages to clear cellular debris and fight chronic infections. Elevated in inflammatory or autoimmune conditions.",
    "range": {
      "criticalLow": null,
      "normalLow": 2,
      "optimalLow": 2,
      "optimalHigh": 10,
      "normalHigh": 10,
      "criticalHigh": 15
    }
  },
  {
    "name": "Eosinophils %",
    "fullName": "Eosinophils %",
    "category": "Organ & Kidney",
    "unit": "%",
    "about": "White blood cells involved in allergic reactions and parasite defense. Elevated counts are common in allergies, asthma, eczema, and certain infections.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0,
      "optimalHigh": 6,
      "normalHigh": 6,
      "criticalHigh": 15
    }
  },
  {
    "name": "Basophils %",
    "fullName": "Basophils %",
    "category": "Organ & Kidney",
    "unit": "%",
    "about": "The rarest circulating white blood cells, involved in allergic and inflammatory responses. Significant elevations are uncommon and may suggest a blood disorder.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0,
      "optimalHigh": 1,
      "normalHigh": 1,
      "criticalHigh": 3
    }
  },
  {
    "name": "Neutrophils Abs",
    "fullName": "Neutrophils (Absolute)",
    "category": "Organ & Kidney",
    "unit": "K/µL",
    "about": "The absolute number of neutrophils per microlitre of blood. A count below normal (neutropenia) significantly raises the risk of serious bacterial infection.",
    "range": {
      "criticalLow": 0.5,
      "normalLow": 1.8,
      "optimalLow": 1.8,
      "optimalHigh": 7.7,
      "normalHigh": 7.7,
      "criticalHigh": 15
    }
  },
  {
    "name": "Lymphocytes Abs",
    "fullName": "Lymphocytes (Absolute)",
    "category": "Organ & Kidney",
    "unit": "K/µL",
    "about": "The absolute count of lymphocytes. Low counts can indicate immune suppression from illness, medications, or stress on the immune system.",
    "range": {
      "criticalLow": 0.5,
      "normalLow": 1.0,
      "optimalLow": 1.0,
      "optimalHigh": 4.8,
      "normalHigh": 4.8,
      "criticalHigh": 8.0
    }
  },
  {
    "name": "Monocytes Abs",
    "fullName": "Monocytes (Absolute)",
    "category": "Organ & Kidney",
    "unit": "K/µL",
    "about": "The absolute count of monocytes. Persistently elevated counts may reflect chronic infection, autoimmune activity, or inflammatory disease.",
    "range": {
      "criticalLow": null,
      "normalLow": 0.1,
      "optimalLow": 0.1,
      "optimalHigh": 0.9,
      "normalHigh": 0.9,
      "criticalHigh": 2.0
    }
  },
  {
    "name": "Eosinophils Abs",
    "fullName": "Eosinophils (Absolute)",
    "category": "Organ & Kidney",
    "unit": "K/µL",
    "about": "The absolute count of eosinophils. Markedly elevated counts (hypereosinophilia) can cause organ damage and require investigation.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0,
      "optimalHigh": 0.5,
      "normalHigh": 0.5,
      "criticalHigh": 1.5
    }
  },
  {
    "name": "Basophils Abs",
    "fullName": "Basophils (Absolute)",
    "category": "Organ & Kidney",
    "unit": "K/µL",
    "about": "The absolute count of basophils. Elevated counts are rare but can occur in allergic conditions and certain myeloproliferative blood disorders.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0,
      "optimalHigh": 0.1,
      "normalHigh": 0.1,
      "criticalHigh": 0.3
    }
  },
  {
    "name": "BUN",
    "fullName": "Blood Urea Nitrogen",
    "category": "Organ & Kidney",
    "unit": "mg/dL",
    "about": "Measures blood urea nitrogen, a protein-breakdown byproduct filtered by the kidneys. Elevated levels can indicate kidney dysfunction, dehydration, or high protein intake.",
    "range": {
      "criticalLow": null,
      "normalLow": 7,
      "optimalLow": 7,
      "optimalHigh": 20,
      "normalHigh": 25,
      "criticalHigh": 50
    }
  },
  {
    "name": "BUN/Creatinine Ratio",
    "fullName": "BUN/Creatinine Ratio",
    "category": "Organ & Kidney",
    "unit": "ratio",
    "about": "The ratio of BUN to creatinine helps pinpoint the cause of elevated kidney markers — a high ratio typically points to dehydration or low blood flow rather than intrinsic kidney damage.",
    "range": {
      "criticalLow": null,
      "normalLow": 10,
      "optimalLow": 10,
      "optimalHigh": 20,
      "normalHigh": 20,
      "criticalHigh": 30
    }
  },
  {
    "name": "Sodium",
    "fullName": "Sodium",
    "category": "Organ & Kidney",
    "unit": "mEq/L",
    "about": "The primary electrolyte controlling fluid balance and nerve and muscle function. Abnormal levels affect hydration status, blood pressure, and neurological function.",
    "range": {
      "criticalLow": 125,
      "normalLow": 136,
      "optimalLow": 136,
      "optimalHigh": 145,
      "normalHigh": 145,
      "criticalHigh": 155
    }
  },
  {
    "name": "Potassium",
    "fullName": "Potassium",
    "category": "Organ & Kidney",
    "unit": "mEq/L",
    "about": "Critical for heart rhythm, muscle contraction, and nerve signaling. Even small deviations from the normal range can cause dangerous cardiac arrhythmias.",
    "range": {
      "criticalLow": 3.0,
      "normalLow": 3.5,
      "optimalLow": 3.5,
      "optimalHigh": 5.0,
      "normalHigh": 5.0,
      "criticalHigh": 6.0
    }
  },
  {
    "name": "Chloride",
    "fullName": "Chloride",
    "category": "Organ & Kidney",
    "unit": "mEq/L",
    "about": "An electrolyte that works alongside sodium to maintain fluid balance and regulate the body's acid-base equilibrium.",
    "range": {
      "criticalLow": 90,
      "normalLow": 98,
      "optimalLow": 98,
      "optimalHigh": 107,
      "normalHigh": 107,
      "criticalHigh": 120
    }
  },
  {
    "name": "CO2",
    "fullName": "Carbon Dioxide (CO2)",
    "category": "Organ & Kidney",
    "unit": "mEq/L",
    "about": "Measures bicarbonate in the blood as a proxy for carbon dioxide, reflecting the body's acid-base (pH) balance and respiratory and metabolic status.",
    "range": {
      "criticalLow": 15,
      "normalLow": 22,
      "optimalLow": 22,
      "optimalHigh": 29,
      "normalHigh": 29,
      "criticalHigh": 35
    }
  },
  {
    "name": "Calcium",
    "fullName": "Calcium",
    "category": "Organ & Kidney",
    "unit": "mg/dL",
    "about": "Essential for bone structure, muscle contraction, nerve signaling, and blood clotting. Blood levels are tightly regulated by the parathyroid hormone.",
    "range": {
      "criticalLow": 7.0,
      "normalLow": 8.5,
      "optimalLow": 8.5,
      "optimalHigh": 10.2,
      "normalHigh": 10.2,
      "criticalHigh": 12.0
    }
  },
  {
    "name": "Total Protein",
    "fullName": "Total Protein",
    "category": "Organ & Kidney",
    "unit": "g/dL",
    "about": "The combined measure of albumin and globulins in the blood, reflecting nutritional status, liver synthetic function, and immune protein production.",
    "range": {
      "criticalLow": null,
      "normalLow": 6.0,
      "optimalLow": 6.0,
      "optimalHigh": 8.3,
      "normalHigh": 8.3,
      "criticalHigh": 10.0
    }
  },
  {
    "name": "Albumin",
    "fullName": "Albumin",
    "category": "Organ & Kidney",
    "unit": "g/dL",
    "about": "The most abundant blood protein, produced by the liver. Low levels can indicate malnutrition, liver disease, kidney disease, or chronic systemic inflammation.",
    "range": {
      "criticalLow": 2.0,
      "normalLow": 3.5,
      "optimalLow": 4.0,
      "optimalHigh": 5.5,
      "normalHigh": 5.5,
      "criticalHigh": null
    }
  },
  {
    "name": "Iron",
    "fullName": "Serum Iron",
    "category": "Metabolic & Organ",
    "unit": "µg/dL",
    "about": "Measures the amount of iron circulating bound to transferrin. Used alongside ferritin and TIBC to get a complete picture of iron status.",
    "range": {
      "criticalLow": 20,
      "normalLow": 38,
      "optimalLow": 60,
      "optimalHigh": 150,
      "normalHigh": 169,
      "criticalHigh": 300
    }
  },
  {
    "name": "TIBC",
    "fullName": "Total Iron Binding Capacity",
    "category": "Metabolic & Organ",
    "unit": "µg/dL",
    "about": "Measures the blood's total capacity to bind iron, reflecting transferrin levels. High TIBC with low serum iron is a classic sign of iron deficiency.",
    "range": {
      "criticalLow": null,
      "normalLow": 250,
      "optimalLow": 250,
      "optimalHigh": 370,
      "normalHigh": 370,
      "criticalHigh": 450
    }
  },
  {
    "name": "UIBC",
    "fullName": "Unsaturated Iron Binding Capacity",
    "category": "Metabolic & Organ",
    "unit": "µg/dL",
    "about": "The portion of transferrin not yet carrying iron. A high UIBC alongside low serum iron confirms that the body is searching for more iron to bind.",
    "range": {
      "criticalLow": null,
      "normalLow": 130,
      "optimalLow": 130,
      "optimalHigh": 300,
      "normalHigh": 300,
      "criticalHigh": 400
    }
  },
  {
    "name": "Iron Saturation",
    "fullName": "Iron Saturation",
    "category": "Metabolic & Organ",
    "unit": "%",
    "about": "The percentage of transferrin currently bound to iron. Low saturation confirms iron deficiency; elevated saturation can indicate hemochromatosis (iron overload).",
    "range": {
      "criticalLow": 8,
      "normalLow": 15,
      "optimalLow": 20,
      "optimalHigh": 45,
      "normalHigh": 55,
      "criticalHigh": 70
    }
  },
  {
    "name": "Folate",
    "fullName": "Folate (Vitamin B9)",
    "category": "Metabolic & Organ",
    "unit": "ng/mL",
    "about": "Vitamin B9, essential for DNA synthesis, cell division, and red blood cell formation. Deficiency during early pregnancy significantly raises the risk of neural tube defects.",
    "range": {
      "criticalLow": 2.0,
      "normalLow": 3.0,
      "optimalLow": 5.0,
      "optimalHigh": 20.0,
      "normalHigh": 20.0,
      "criticalHigh": null
    }
  },
  {
    "name": "Direct Bilirubin",
    "fullName": "Direct Bilirubin",
    "category": "Organ & Kidney",
    "unit": "mg/dL",
    "about": "The water-soluble form of bilirubin that has been processed by the liver. Elevated levels specifically suggest bile duct obstruction or cholestatic liver disease.",
    "range": {
      "criticalLow": null,
      "normalLow": 0,
      "optimalLow": 0,
      "optimalHigh": 0.3,
      "normalHigh": 0.3,
      "criticalHigh": 1.0
    }
  }
];
