-- ResQ AI: Development Seed Data
-- Run these in sequence AFTER schema migrations are applied
-- Last updated: 2026-03-22

-- ================================================================
-- SECTION 1: Safe Zones
-- ================================================================
INSERT INTO safe_zones (name, type, location, address, capacity, current_occupancy, contact_number, amenities, is_active)
VALUES
  -- DELHI
  ('AIIMS Delhi', 'hospital', ST_MakePoint(77.2090, 28.5672)::geography, 'Ansari Nagar East, New Delhi 110029', 2478, 1200, '011-26588500', ARRAY['emergency','icu','blood_bank','pharmacy'], true),
  ('Safdarjung Hospital', 'hospital', ST_MakePoint(77.2076, 28.5706)::geography, 'Ansari Nagar West, New Delhi 110029', 1531, 900, '011-26173012', ARRAY['emergency','surgery','pediatrics'], true),
  ('Delhi Disaster Shelter - Yamuna Sports Complex', 'shelter', ST_MakePoint(77.2487, 28.6258)::geography, 'Yamuna Sports Complex, Delhi Gate, Delhi 110002', 5000, 0, '1077', ARRAY['food','water','electricity','first_aid'], true),
  ('NDRF 3rd Battalion Delhi', 'rescue_station', ST_MakePoint(77.3178, 28.6619)::geography, 'Vasant Kunj, New Delhi', 200, 0, '011-25092001', ARRAY['rescue_equipment','boats','rope_rescue','medical'], true),

  -- MUMBAI
  ('KEM Hospital Mumbai', 'hospital', ST_MakePoint(72.8453, 18.9967)::geography, 'Acharya Donde Marg, Parel, Mumbai 400012', 1800, 950, '022-24136051', ARRAY['emergency','trauma','icu','blood_bank'], true),
  ('NSCI Dome Shelter Mumbai', 'shelter', ST_MakePoint(72.8478, 19.0177)::geography, 'NSCI, Dr Annie Besant Road, Worli, Mumbai 400018', 3000, 0, '1916', ARRAY['food','water','blankets','first_aid'], true),
  ('NDRF 4th Battalion Pune', 'rescue_station', ST_MakePoint(73.8567, 18.5204)::geography, 'Dighi, Pune 411015', 180, 0, '020-27650152', ARRAY['flood_rescue','boats','medical','communication'], true),

  -- CHENNAI
  ('Government General Hospital Chennai', 'hospital', ST_MakePoint(80.2785, 13.0843)::geography, 'Park Town, Chennai 600003', 2600, 1400, '044-25305000', ARRAY['emergency','icu','burn_unit','blood_bank'], true),
  ('Jawaharlal Nehru Indoor Stadium Shelter', 'shelter', ST_MakePoint(80.2593, 13.0712)::geography, 'Jawaharlal Nehru Salai, Chennai 600014', 4000, 0, '044-22350000', ARRAY['food','water','electricity','sanitation'], true),
  ('NDRF 6th Battalion Chennai', 'rescue_station', ST_MakePoint(80.2707, 13.0827)::geography, 'Aranganathan Nagar, Chennai', 200, 0, '044-25360001', ARRAY['cyclone_rescue','boats','flood_rescue','medical'], true),

  -- KOLKATA
  ('SSKM Hospital Kolkata', 'hospital', ST_MakePoint(88.3462, 22.5385)::geography, 'A J C Bose Road, Kolkata 700020', 2000, 1100, '033-22043220', ARRAY['emergency','icu','trauma','pharmacy'], true),
  ('Salt Lake Stadium Shelter', 'shelter', ST_MakePoint(88.3997, 22.5748)::geography, 'Salt Lake, Kolkata 700098', 6000, 0, '1070', ARRAY['food','water','electricity','flood_blankets'], true),

  -- BHUBANESWAR / ODISHA (cyclone prone)
  ('AIIMS Bhubaneswar', 'hospital', ST_MakePoint(85.8245, 20.2961)::geography, 'Sijua, Bhubaneswar 751019', 850, 400, '0674-2476789', ARRAY['emergency','cyclone_trauma','icu'], true),
  ('Cuttack Central Cyclone Shelter', 'shelter', ST_MakePoint(85.8830, 20.4625)::geography, 'CDA, Cuttack 753014', 8000, 0, '1070', ARRAY['cyclone_rated','food','water','generator'], true),
  ('ODRAF Headquarters Bhubaneswar', 'rescue_station', ST_MakePoint(85.8314, 20.2961)::geography, 'Bhubaneswar 751001', 300, 0, '0674-2534177', ARRAY['cyclone_rescue','boats','chainsaw','medical'], true),

  -- KERALA (flood prone)
  ('Thrissur Medical College Hospital', 'hospital', ST_MakePoint(76.2144, 10.5276)::geography, 'Marayamuttom, Thrissur 680596', 750, 380, '0487-2201900', ARRAY['emergency','flood_trauma','icu'], true),
  ('KSRTC Bus Terminal Shelter Ernakulam', 'shelter', ST_MakePoint(76.2673, 9.9948)::geography, 'High Court Junction, Ernakulam', 2000, 0, '0484-2361185', ARRAY['food','water','boats_nearby'], true),

  -- DEHRADUN / UTTARAKHAND (landslide prone)
  ('Doon Hospital Dehradun', 'hospital', ST_MakePoint(78.0322, 30.3165)::geography, 'Shubhash Nagar, Dehradun 248001', 500, 250, '0135-2714225', ARRAY['emergency','landslide_trauma','orthopedic'], true),
  ('SDRF Base Camp Dehradun', 'rescue_station', ST_MakePoint(78.0419, 30.3255)::geography, 'Police Lines, Dehradun', 150, 0, '0135-2710610', ARRAY['landslide_rescue','rope_rescue','helicopter_coordination','medical'], true);

-- ================================================================
-- SECTION 2: Disaster Events (Sample)
-- ================================================================
INSERT INTO disaster_events (name, description, type, severity, status, source, confidence_pct, epicenter, affected_radius_km, start_time)
VALUES
  (
    'Gandak River Flooding - West Champaran',
    'Heavy monsoon rainfall causing Gandak river to overflow. Villages in West Champaran district affected.',
    'flood', 'critical', 'active', 'official_warning', 100,
    ST_MakePoint(84.5013, 26.8894)::geography,
    45, NOW() - INTERVAL '6 hours'
  ),
  (
    'Cyclone Asani Alert - Odisha Coast',
    'Deep depression in Bay of Bengal intensifying into cyclone.',
    'cyclone', 'high', 'active', 'official_warning', 100,
    ST_MakePoint(85.9012, 19.8134)::geography,
    200, NOW() - INTERVAL '2 hours'
  );

-- ================================================================
-- SECTION 3: User Reports (Sample)
-- ================================================================
INSERT INTO user_reports (type, description, location, severity, status, verification_count)
VALUES
  ('flood', 'Waterlogging on MG Road, knee-deep water near Rajiv Chowk Metro.', ST_MakePoint(77.2196, 28.6328)::geography, 'medium', 'community_verified', 12);
