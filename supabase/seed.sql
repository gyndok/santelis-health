-- ============================================================
-- Santelis Health — Seed Data
-- Demo practice: Klein's Women's Care (OBGYN, Webster TX)
-- ============================================================

-- Use a fixed UUID so foreign keys can reference it
INSERT INTO practices (
  id, name, specialty, sub_specialties, subdomain, domain, plan, status,
  branding, seo_config, integrations, insurances_accepted
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Klein''s Women''s Care',
  'obgyn',
  ARRAY['obstetrics', 'gynecology', 'menopause', 'minimally-invasive-surgery'],
  'kleins-womens-care',
  NULL,
  'professional',
  'live',
  '{
    "logoUrl": null,
    "colorPalette": {
      "primary": "#0d9488",
      "primaryDark": "#0f766e",
      "accent": "#f0abfc",
      "neutral": "#f8fafc",
      "neutralDark": "#334155"
    },
    "heroImageUrl": null,
    "tagline": "Compassionate, comprehensive women''s healthcare in the Clear Lake area.",
    "fontFamily": "Inter"
  }'::jsonb,
  '{
    "siteTitle": "Klein''s Women''s Care | OBGYN in Webster, TX",
    "siteDescription": "Board-certified OBGYN providing obstetric, gynecologic, and wellness care in Webster, Texas. Now accepting new patients.",
    "keywords": ["obgyn webster tx", "gynecologist clear lake", "obstetrician houston", "womens health webster texas"],
    "ogImageUrl": null,
    "structuredData": {}
  }'::jsonb,
  '{
    "appointmentBooking": {
      "type": "intakeq",
      "url": null
    },
    "intakeForms": [],
    "consentForms": [],
    "patientPortalUrl": null,
    "telemedicineUrl": null,
    "socialMedia": {
      "facebook": null,
      "instagram": null
    },
    "googleBusinessProfileId": null
  }'::jsonb,
  ARRAY[
    'Aetna', 'Blue Cross Blue Shield', 'Cigna', 'United Healthcare',
    'Humana', 'Medicare', 'Medicaid', 'Tricare', 'Oscar Health',
    'Ambetter', 'Molina Healthcare'
  ]
);

-- ============================================================
-- Provider: Dr. Geffrey Klein
-- ============================================================
INSERT INTO providers (
  practice_id, first_name, last_name, credentials, title, bio, photo_url,
  education, board_certifications, languages, display_order
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Geffrey',
  'Klein',
  'MD',
  'Board Certified Obstetrician & Gynecologist',
  'Dr. Geffrey Klein is a board-certified OB/GYN dedicated to providing compassionate, evidence-based care for women at every stage of life. From routine wellness exams and prenatal care to advanced minimally invasive surgery, Dr. Klein combines clinical expertise with a patient-centered approach. He is committed to building lasting relationships with his patients and ensuring they feel heard, informed, and empowered in their healthcare decisions.',
  NULL,
  '[
    {"institution": "University of Texas Medical Branch", "degree": "Doctor of Medicine", "year": null},
    {"institution": "University of Texas Medical Branch", "degree": "Residency in Obstetrics & Gynecology", "year": null}
  ]'::jsonb,
  '[
    {
      "board": "ABOG",
      "specialty": "Obstetrics and Gynecology",
      "verificationUrl": "https://www.abog.org",
      "badgeImageUrl": null
    }
  ]'::jsonb,
  ARRAY['English', 'Spanish'],
  0
);

-- ============================================================
-- Services
-- ============================================================
INSERT INTO services (practice_id, title, description, icon, featured, link_url, display_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Obstetric Care',
   'Comprehensive prenatal, delivery, and postpartum care for healthy pregnancies.',
   'Baby', true, NULL, 0),

  ('11111111-1111-1111-1111-111111111111', 'Well-Woman Exams',
   'Annual wellness visits including Pap smears, breast exams, and preventive screenings.',
   'HeartPulse', true, NULL, 1),

  ('11111111-1111-1111-1111-111111111111', 'Gynecologic Surgery',
   'Minimally invasive laparoscopic and robotic-assisted procedures for fibroids, endometriosis, and more.',
   'Stethoscope', true, NULL, 2),

  ('11111111-1111-1111-1111-111111111111', 'Family Planning',
   'Contraception counseling, IUD placement, and fertility guidance.',
   'Shield', false, NULL, 3),

  ('11111111-1111-1111-1111-111111111111', 'Menopause Management',
   'Hormone therapy, symptom management, and bone health for women in perimenopause and menopause.',
   'Thermometer', false, NULL, 4),

  ('11111111-1111-1111-1111-111111111111', 'Adolescent Gynecology',
   'Age-appropriate gynecologic care and education for teens and young women.',
   'Users', false, NULL, 5),

  ('11111111-1111-1111-1111-111111111111', 'In-Office Procedures',
   'Colposcopy, endometrial biopsy, LEEP, and other in-office diagnostic and treatment procedures.',
   'Activity', false, NULL, 6),

  ('11111111-1111-1111-1111-111111111111', 'Ultrasound Services',
   'On-site diagnostic and obstetric ultrasound imaging.',
   'Monitor', false, NULL, 7);

-- ============================================================
-- Location
-- ============================================================
INSERT INTO locations (
  practice_id, name, address, city, state, zip, phone, fax, email,
  hours, google_maps_embed_url, lat, lng
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Main Office',
  '250 Blossom St, Suite 200',
  'Webster',
  'TX',
  '77598',
  '(281) 555-0192',
  '(281) 555-0193',
  'info@kleinswomenscare.com',
  '{
    "monday": "8:00 AM - 5:00 PM",
    "tuesday": "8:00 AM - 5:00 PM",
    "wednesday": "8:00 AM - 5:00 PM",
    "thursday": "8:00 AM - 5:00 PM",
    "friday": "8:00 AM - 12:00 PM",
    "saturday": "Closed",
    "sunday": "Closed"
  }'::jsonb,
  NULL,
  29.5374,
  -95.1183
);

-- ============================================================
-- Reviews
-- ============================================================
INSERT INTO reviews (practice_id, author_name, rating, text, review_date, source) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sarah M.',    5,
   'Dr. Klein is the most caring and thorough OB/GYN I have ever seen. He took the time to explain everything and made me feel completely at ease. Highly recommend!',
   '2025-11-15', 'google'),

  ('11111111-1111-1111-1111-111111111111', 'Jessica R.',  5,
   'I switched to Dr. Klein for my second pregnancy and it was the best decision. The office is modern, wait times are short, and the staff is wonderful.',
   '2025-10-22', 'google'),

  ('11111111-1111-1111-1111-111111111111', 'Amanda T.',   5,
   'Outstanding experience from start to finish. The online check-in was easy and Dr. Klein really listens to his patients.',
   '2025-09-08', 'google'),

  ('11111111-1111-1111-1111-111111111111', 'Lauren W.',   4,
   'Great doctor and very knowledgeable. The only reason for 4 stars is the parking situation, but the care itself is five-star.',
   '2025-08-30', 'google'),

  ('11111111-1111-1111-1111-111111111111', 'Christina P.', 5,
   'Dr. Klein performed my laparoscopic surgery and I was back to normal in less than a week. He explained the entire process and followed up personally. Cannot say enough good things.',
   '2025-07-12', 'healthgrades');

-- ============================================================
-- Blog Posts
-- ============================================================
INSERT INTO blog_posts (
  practice_id, title, slug, content, meta_description, status, published_at
) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'What to Expect at Your First Prenatal Visit',
   'what-to-expect-first-prenatal-visit',
   'Your first prenatal visit is one of the most important appointments of your pregnancy. During this visit, we will review your medical history, perform an initial exam, order lab work, and discuss your due date and care plan. Most first visits happen between 8 and 10 weeks of pregnancy. We encourage you to bring a list of any medications you are taking and questions you would like to discuss.',
   'Learn what happens at your first prenatal appointment at Klein''s Women''s Care in Webster, TX.',
   'published',
   '2025-09-01 10:00:00+00'),

  ('11111111-1111-1111-1111-111111111111',
   'Understanding Your Options for Birth Control',
   'understanding-birth-control-options',
   'Choosing the right birth control method is a personal decision that depends on your lifestyle, health history, and future family plans. At Klein''s Women''s Care, we offer comprehensive counseling on all FDA-approved contraceptive options including oral contraceptives, IUDs, implants, and permanent sterilization. Schedule a consultation to discuss which method is right for you.',
   'Explore birth control options available at Klein''s Women''s Care, your OBGYN in Webster, Texas.',
   'published',
   '2025-10-15 10:00:00+00');
