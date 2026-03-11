import type { Specialty, ColorPalette, Service } from "@/types";

interface SpecialtyConfig {
  label: string;
  description: string;
  palette: ColorPalette;
  defaultServices: Omit<Service, "id">[];
  subSpecialties: string[];
  boardBodies: { name: string; abbreviation: string; url: string }[];
}

export const specialtyConfigs: Record<Specialty, SpecialtyConfig> = {
  obgyn: {
    label: "Obstetrics & Gynecology",
    description: "Comprehensive women's health care",
    palette: {
      primary: "#62929E",
      primaryDark: "#4A6D7C",
      accent: "#C6C5B9",
      neutral: "#475657",
      neutralDark: "#393A10",
    },
    defaultServices: [
      { title: "Obstetric Care", description: "Prenatal care, high-risk pregnancies, vaginal delivery, C-section, postpartum care.", icon: "🤰", featured: false },
      { title: "Gynecologic Surgery", description: "Robotic assisted surgery, hysterectomy, endometrial ablation, tubal ligation.", icon: "⚕️", featured: false },
      { title: "Women's Health", description: "Annual exams, pap smears, mammography screening, hormone replacement, menopause care.", icon: "❤️", featured: false },
      { title: "Family Planning", description: "Birth control, IUD placement/removal, contraceptive implants, infertility evaluation.", icon: "👪", featured: false },
      { title: "Weight Loss", description: "Personalized weight management programs and anti-obesity medications.", icon: "⚖️", featured: true },
      { title: "Specialized Treatments", description: "Endometriosis, uterine fibroids, cervical dysplasia, STD testing.", icon: "🩺", featured: false },
    ],
    subSpecialties: [
      "Maternal-Fetal Medicine",
      "Gynecologic Oncology",
      "Reproductive Endocrinology",
      "Urogynecology",
      "Obesity Medicine",
      "Minimally Invasive Surgery",
    ],
    boardBodies: [
      { name: "American Board of Obstetrics and Gynecology", abbreviation: "ABOG", url: "https://www.abog.org" },
      { name: "American College of Obstetricians and Gynecologists", abbreviation: "ACOG", url: "https://www.acog.org" },
      { name: "American Board of Obesity Medicine", abbreviation: "ABOM", url: "https://www.abom.org" },
    ],
  },

  "family-medicine": {
    label: "Family Medicine",
    description: "Primary care for the whole family",
    palette: {
      primary: "#6B8E6B",
      primaryDark: "#4A6B4A",
      accent: "#D4CFC4",
      neutral: "#5A5A5A",
      neutralDark: "#2D2D2D",
    },
    defaultServices: [
      { title: "Preventive Care", description: "Annual physicals, immunizations, health screenings, wellness exams.", icon: "🩺", featured: false },
      { title: "Chronic Disease Management", description: "Diabetes, hypertension, heart disease, thyroid disorders.", icon: "💊", featured: false },
      { title: "Pediatric Care", description: "Well-child visits, developmental screenings, childhood immunizations.", icon: "👶", featured: false },
      { title: "Geriatric Care", description: "Senior wellness, fall prevention, cognitive screening, medication management.", icon: "🧓", featured: false },
      { title: "Urgent Care", description: "Same-day sick visits, minor injuries, infections, acute care needs.", icon: "🏥", featured: true },
      { title: "Mental Health", description: "Depression, anxiety screening, stress management, behavioral health referrals.", icon: "🧠", featured: false },
    ],
    subSpecialties: [
      "Sports Medicine",
      "Geriatric Medicine",
      "Adolescent Medicine",
      "Obesity Medicine",
      "Preventive Medicine",
    ],
    boardBodies: [
      { name: "American Board of Family Medicine", abbreviation: "ABFM", url: "https://www.theabfm.org" },
      { name: "American Academy of Family Physicians", abbreviation: "AAFP", url: "https://www.aafp.org" },
    ],
  },

  dermatology: {
    label: "Dermatology",
    description: "Expert skin, hair, and nail care",
    palette: {
      primary: "#5B8DB8",
      primaryDark: "#3D6E94",
      accent: "#E8E0D0",
      neutral: "#6B6B6B",
      neutralDark: "#333333",
    },
    defaultServices: [
      { title: "Medical Dermatology", description: "Acne, eczema, psoriasis, rosacea, skin infections, rashes.", icon: "🔬", featured: false },
      { title: "Skin Cancer Screening", description: "Full-body skin exams, mole checks, biopsy, Mohs surgery referrals.", icon: "🩺", featured: true },
      { title: "Cosmetic Dermatology", description: "Botox, fillers, chemical peels, laser treatments, microneedling.", icon: "✨", featured: false },
      { title: "Surgical Dermatology", description: "Skin lesion removal, cyst excision, scar revision.", icon: "⚕️", featured: false },
      { title: "Hair & Nail Disorders", description: "Hair loss, alopecia, fungal infections, nail disorders.", icon: "💇", featured: false },
      { title: "Pediatric Dermatology", description: "Birthmarks, childhood eczema, warts, molluscum.", icon: "👶", featured: false },
    ],
    subSpecialties: [
      "Mohs Surgery",
      "Cosmetic Dermatology",
      "Pediatric Dermatology",
      "Dermatopathology",
    ],
    boardBodies: [
      { name: "American Board of Dermatology", abbreviation: "ABD", url: "https://www.abderm.org" },
      { name: "American Academy of Dermatology", abbreviation: "AAD", url: "https://www.aad.org" },
    ],
  },

  orthopedics: {
    label: "Orthopedic Surgery",
    description: "Bone, joint, and musculoskeletal care",
    palette: {
      primary: "#2B5C8A",
      primaryDark: "#1D3F5E",
      accent: "#B0C4D8",
      neutral: "#4A5568",
      neutralDark: "#1A202C",
    },
    defaultServices: [
      { title: "Joint Replacement", description: "Total knee replacement, total hip replacement, partial knee replacement.", icon: "🦴", featured: true },
      { title: "Sports Medicine", description: "ACL reconstruction, rotator cuff repair, meniscus surgery, sports injuries.", icon: "⚽", featured: false },
      { title: "Spine Care", description: "Herniated disc, spinal stenosis, scoliosis, minimally invasive spine surgery.", icon: "🦴", featured: false },
      { title: "Hand & Wrist", description: "Carpal tunnel, trigger finger, fractures, tendon repair.", icon: "✋", featured: false },
      { title: "Fracture Care", description: "Acute fracture treatment, surgical fixation, cast management.", icon: "🏥", featured: false },
      { title: "Physical Therapy", description: "Post-surgical rehabilitation, injury prevention, strength training.", icon: "💪", featured: false },
    ],
    subSpecialties: [
      "Joint Replacement",
      "Sports Medicine",
      "Spine Surgery",
      "Hand Surgery",
      "Foot & Ankle",
      "Trauma",
    ],
    boardBodies: [
      { name: "American Board of Orthopaedic Surgery", abbreviation: "ABOS", url: "https://www.abos.org" },
      { name: "American Academy of Orthopaedic Surgeons", abbreviation: "AAOS", url: "https://www.aaos.org" },
    ],
  },

  pediatrics: {
    label: "Pediatrics",
    description: "Healthcare for infants, children, and adolescents",
    palette: {
      primary: "#E8864A",
      primaryDark: "#C96A30",
      accent: "#FFF3E0",
      neutral: "#5D5D5D",
      neutralDark: "#333333",
    },
    defaultServices: [
      { title: "Well-Child Visits", description: "Growth monitoring, developmental milestones, immunizations, health screenings.", icon: "👶", featured: false },
      { title: "Sick Visits", description: "Fever, ear infections, colds, flu, rashes, and acute illness care.", icon: "🤒", featured: true },
      { title: "Immunizations", description: "Recommended childhood vaccines, flu shots, catch-up schedules.", icon: "💉", featured: false },
      { title: "Newborn Care", description: "First newborn visit, jaundice screening, feeding support, weight checks.", icon: "🍼", featured: false },
      { title: "Adolescent Medicine", description: "Teen physicals, sports clearance, mental health screening, reproductive health.", icon: "🧒", featured: false },
      { title: "Behavioral Health", description: "ADHD evaluation, anxiety, behavioral concerns, developmental delays.", icon: "🧠", featured: false },
    ],
    subSpecialties: [
      "Neonatology",
      "Pediatric Cardiology",
      "Pediatric Gastroenterology",
      "Developmental Pediatrics",
      "Adolescent Medicine",
    ],
    boardBodies: [
      { name: "American Board of Pediatrics", abbreviation: "ABP", url: "https://www.abp.org" },
      { name: "American Academy of Pediatrics", abbreviation: "AAP", url: "https://www.aap.org" },
    ],
  },

  "internal-medicine": {
    label: "Internal Medicine",
    description: "Adult primary and specialty care",
    palette: {
      primary: "#7B6BA5",
      primaryDark: "#5C4F82",
      accent: "#E8E0F0",
      neutral: "#555555",
      neutralDark: "#2A2A2A",
    },
    defaultServices: [
      { title: "Primary Care", description: "Comprehensive adult health assessments, preventive care, chronic disease management.", icon: "🩺", featured: false },
      { title: "Cardiovascular Health", description: "Hypertension, cholesterol management, heart disease risk assessment.", icon: "❤️", featured: false },
      { title: "Diabetes Management", description: "Type 1 and Type 2 diabetes, insulin management, A1C monitoring.", icon: "💉", featured: true },
      { title: "Pulmonary Care", description: "Asthma, COPD, respiratory infections, pulmonary function testing.", icon: "🫁", featured: false },
      { title: "Gastrointestinal Health", description: "IBS, GERD, liver disease, GI cancer screening.", icon: "🏥", featured: false },
      { title: "Preventive Screenings", description: "Cancer screenings, bone density, cardiac risk assessment.", icon: "🔬", featured: false },
    ],
    subSpecialties: [
      "Cardiology",
      "Endocrinology",
      "Gastroenterology",
      "Pulmonology",
      "Rheumatology",
      "Infectious Disease",
    ],
    boardBodies: [
      { name: "American Board of Internal Medicine", abbreviation: "ABIM", url: "https://www.abim.org" },
      { name: "American College of Physicians", abbreviation: "ACP", url: "https://www.acponline.org" },
    ],
  },

  "med-spa": {
    label: "Medical Spa",
    description: "Aesthetic and wellness treatments",
    palette: {
      primary: "#C4956A",
      primaryDark: "#A07850",
      accent: "#F5F0EB",
      neutral: "#6B6B6B",
      neutralDark: "#2D2D2D",
    },
    defaultServices: [
      { title: "Injectables", description: "Botox, Dysport, dermal fillers, lip augmentation, jawline contouring.", icon: "💉", featured: true },
      { title: "Laser Treatments", description: "Laser hair removal, skin resurfacing, tattoo removal, vein treatment.", icon: "✨", featured: false },
      { title: "Skin Rejuvenation", description: "Chemical peels, microneedling, PRP therapy, LED light therapy.", icon: "🌟", featured: false },
      { title: "Body Contouring", description: "CoolSculpting, lipolysis, skin tightening, cellulite reduction.", icon: "💎", featured: false },
      { title: "Facial Treatments", description: "HydraFacial, oxygen facials, dermaplaning, custom skincare regimens.", icon: "🧖", featured: false },
      { title: "Wellness", description: "IV therapy, vitamin injections, hormone optimization, weight management.", icon: "🌿", featured: false },
    ],
    subSpecialties: [
      "Aesthetic Medicine",
      "Anti-Aging Medicine",
      "Regenerative Medicine",
      "Weight Management",
    ],
    boardBodies: [
      { name: "American Med Spa Association", abbreviation: "AmSpa", url: "https://www.americanmedspa.org" },
    ],
  },

  cardiology: {
    label: "Cardiology",
    description: "Heart and cardiovascular care",
    palette: {
      primary: "#C0392B",
      primaryDark: "#922B21",
      accent: "#FADBD8",
      neutral: "#555555",
      neutralDark: "#2C2C2C",
    },
    defaultServices: [
      { title: "Preventive Cardiology", description: "Risk assessment, cholesterol management, lifestyle counseling.", icon: "❤️", featured: false },
      { title: "Diagnostic Testing", description: "EKG, echocardiogram, stress testing, Holter monitoring.", icon: "📊", featured: false },
      { title: "Heart Failure Management", description: "CHF treatment, medication optimization, device management.", icon: "🫀", featured: true },
      { title: "Arrhythmia", description: "Atrial fibrillation, pacemaker management, ablation referral.", icon: "⚡", featured: false },
      { title: "Interventional Cardiology", description: "Cardiac catheterization, stent placement, angioplasty.", icon: "⚕️", featured: false },
      { title: "Vascular Care", description: "Peripheral artery disease, venous insufficiency, aortic disease.", icon: "🩺", featured: false },
    ],
    subSpecialties: [
      "Interventional Cardiology",
      "Electrophysiology",
      "Heart Failure",
      "Preventive Cardiology",
    ],
    boardBodies: [
      { name: "American Board of Internal Medicine — Cardiovascular Disease", abbreviation: "ABIM-CV", url: "https://www.abim.org" },
      { name: "American College of Cardiology", abbreviation: "ACC", url: "https://www.acc.org" },
    ],
  },

  urology: {
    label: "Urology",
    description: "Urinary tract and male reproductive health",
    palette: {
      primary: "#2E86AB",
      primaryDark: "#1B5E7B",
      accent: "#D6EAF8",
      neutral: "#4A5568",
      neutralDark: "#2D3748",
    },
    defaultServices: [
      { title: "General Urology", description: "UTIs, kidney stones, bladder issues, urinary incontinence.", icon: "🩺", featured: false },
      { title: "Prostate Health", description: "BPH, prostate cancer screening, PSA testing, prostate biopsy.", icon: "🔬", featured: true },
      { title: "Men's Health", description: "Erectile dysfunction, testosterone therapy, vasectomy, male infertility.", icon: "⚕️", featured: false },
      { title: "Kidney Care", description: "Kidney stones, kidney cancer, minimally invasive stone removal.", icon: "🏥", featured: false },
      { title: "Urologic Surgery", description: "Robotic surgery, laparoscopic procedures, reconstructive urology.", icon: "🤖", featured: false },
      { title: "Pediatric Urology", description: "Bedwetting, undescended testes, pediatric urinary issues.", icon: "👶", featured: false },
    ],
    subSpecialties: [
      "Urologic Oncology",
      "Female Urology",
      "Male Infertility",
      "Pediatric Urology",
      "Endourology",
    ],
    boardBodies: [
      { name: "American Board of Urology", abbreviation: "ABU", url: "https://www.abu.org" },
      { name: "American Urological Association", abbreviation: "AUA", url: "https://www.auanet.org" },
    ],
  },

  ent: {
    label: "Otolaryngology (ENT)",
    description: "Ear, nose, and throat care",
    palette: {
      primary: "#3498A2",
      primaryDark: "#267882",
      accent: "#D5F0F3",
      neutral: "#5A6B6E",
      neutralDark: "#2C3E3F",
    },
    defaultServices: [
      { title: "Ear Care", description: "Hearing loss, ear infections, tinnitus, ear tubes, cochlear implants.", icon: "👂", featured: false },
      { title: "Sinus & Nasal", description: "Chronic sinusitis, nasal polyps, deviated septum, balloon sinuplasty.", icon: "👃", featured: true },
      { title: "Throat & Voice", description: "Tonsillitis, voice disorders, swallowing problems, throat cancer screening.", icon: "🗣️", featured: false },
      { title: "Sleep Medicine", description: "Sleep apnea, snoring treatment, CPAP alternatives.", icon: "😴", featured: false },
      { title: "Head & Neck Surgery", description: "Thyroid surgery, parotid surgery, neck masses, cancer treatment.", icon: "⚕️", featured: false },
      { title: "Allergy Treatment", description: "Allergy testing, immunotherapy, sublingual allergy drops.", icon: "🌿", featured: false },
    ],
    subSpecialties: [
      "Rhinology",
      "Otology",
      "Laryngology",
      "Head & Neck Oncology",
      "Pediatric ENT",
      "Sleep Medicine",
    ],
    boardBodies: [
      { name: "American Board of Otolaryngology", abbreviation: "ABOto", url: "https://www.aboto.org" },
      { name: "American Academy of Otolaryngology", abbreviation: "AAO-HNS", url: "https://www.entnet.org" },
    ],
  },
};
