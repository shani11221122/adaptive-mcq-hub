-- ============================================================
--  MDCAT App - Seed Data
--  Run this after migrations to populate sample questions
-- ============================================================

-- Sample Biology Questions
INSERT INTO public.questions (id, subject, question, options, correct_answer, difficulty)
VALUES
('be1', 'biology', 'Which organelle is known as the powerhouse of the cell?', ARRAY['Ribosome', 'Nucleus', 'Mitochondria', 'Endoplasmic Reticulum'], 2, 'easy'),
('be2', 'biology', 'DNA replication occurs during which phase?', ARRAY['G1 Phase', 'S Phase', 'G2 Phase', 'M Phase'], 1, 'easy'),
('be3', 'biology', 'The process of mRNA formation from DNA is called?', ARRAY['Translation', 'Transcription', 'Replication', 'Transduction'], 1, 'easy'),
('be4', 'biology', 'Which blood group is known as the universal donor?', ARRAY['A', 'B', 'AB', 'O'], 3, 'easy'),
('be5', 'biology', 'Which hormone regulates blood sugar levels?', ARRAY['Thyroxine', 'Insulin', 'Adrenaline', 'Glucagon'], 1, 'easy'),
('bi1', 'biology', 'Which enzyme unwinds the DNA double helix during replication?', ARRAY['DNA Polymerase', 'Helicase', 'Ligase', 'Primase'], 1, 'intermediate'),
('bi2', 'biology', 'Krebs cycle occurs in which part of the cell?', ARRAY['Cytoplasm', 'Nucleus', 'Mitochondrial matrix', 'Ribosome'], 2, 'intermediate'),
('bi3', 'biology', 'What is the basic structural unit of the kidney?', ARRAY['Neuron', 'Nephron', 'Alveoli', 'Villi'], 1, 'intermediate'),
('bh1', 'biology', 'Which nitrogenous base is not found in RNA?', ARRAY['Adenine', 'Thymine', 'Uracil', 'Cytosine'], 1, 'hard'),
('bh2', 'biology', 'Crossing over occurs during which stage of meiosis?', ARRAY['Prophase I', 'Metaphase I', 'Anaphase II', 'Telophase II'], 0, 'hard')
ON CONFLICT (id) DO NOTHING;

-- Sample Chemistry Questions
INSERT INTO public.questions (id, subject, question, options, correct_answer, difficulty)
VALUES
('ce1', 'chemistry', 'What is the pH of pure water at 25°C?', ARRAY['5', '7', '8', '14'], 1, 'easy'),
('ce2', 'chemistry', 'Which element has the highest electronegativity?', ARRAY['Oxygen', 'Chlorine', 'Fluorine', 'Nitrogen'], 2, 'easy'),
('ce3', 'chemistry', 'The chemical formula of methane is?', ARRAY['CH3', 'CH4', 'C2H6', 'C2H4'], 1, 'easy'),
('ci1', 'chemistry', 'Which orbital has the lowest energy in a multi-electron atom?', ARRAY['3s', '3p', '3d', '4s'], 0, 'intermediate'),
('ci2', 'chemistry', 'The rate of reaction is independent of the concentration of reactants for?', ARRAY['Zero order', 'First order', 'Second order', 'Third order'], 0, 'intermediate'),
('ch1', 'chemistry', 'The crystal field stabilization energy for [Fe(CN)6]4- is?', ARRAY['-2.4', '-0.4', '-1.2', '-0.6'], 0, 'hard')
ON CONFLICT (id) DO NOTHING;

-- Sample Physics Questions
INSERT INTO public.questions (id, subject, question, options, correct_answer, difficulty)
VALUES
('pe1', 'physics', 'What is the SI unit of force?', ARRAY['Joule', 'Watt', 'Newton', 'Pascal'], 2, 'easy'),
('pe2', 'physics', 'Speed of light in vacuum is approximately?', ARRAY['3 x 10^8 m/s', '3 x 10^6 m/s', '3 x 10^10 m/s', '3 x 10^4 m/s'], 0, 'easy'),
('pi1', 'physics', 'Which law states that energy cannot be created or destroyed?', ARRAY['Newton First Law', 'Law of Conservation of Energy', 'Ohm Law', 'Faraday Law'], 1, 'intermediate'),
('pi2', 'physics', 'In a simple harmonic motion, maximum acceleration occurs at?', ARRAY['Mean position', 'Extreme position', 'Both', 'None'], 1, 'intermediate'),
('ph1', 'physics', 'The de Broglie wavelength of a particle is inversely proportional to?', ARRAY['Velocity', 'Momentum', 'Energy', 'Frequency'], 1, 'hard')
ON CONFLICT (id) DO NOTHING;

-- Sample English Questions
INSERT INTO public.questions (id, subject, question, options, correct_answer, difficulty)
VALUES
('ee1', 'english', 'Choose the correct spelling:', ARRAY['Accomodate', 'Accommodate', 'Acommodate', 'Acommadate'], 1, 'easy'),
('ee2', 'english', 'Synonym of ABUNDANT:', ARRAY['Scarce', 'Plentiful', 'Rare', 'Meager'], 1, 'easy'),
('ei1', 'english', 'Choose the correct sentence:', ARRAY['He don''t like apples', 'He doesn''t likes apples', 'He doesn''t like apples', 'He not like apples'], 2, 'intermediate'),
('eh1', 'english', 'The idiom ''break the ice'' means:', ARRAY['To shatter ice', 'To initiate conversation', 'To cool down', 'To be rude'], 1, 'hard')
ON CONFLICT (id) DO NOTHING;

-- Sample Reasoning Questions
INSERT INTO public.questions (id, subject, question, options, correct_answer, difficulty)
VALUES
('re1', 'reasoning', 'If A is taller than B and B is taller than C, who is shortest?', ARRAY['A', 'B', 'C', 'Cannot determine'], 2, 'easy'),
('re2', 'reasoning', 'Complete the series: 2, 6, 12, 20, ?', ARRAY['28', '30', '32', '36'], 1, 'easy'),
('ri1', 'reasoning', 'If all roses are flowers and some flowers fade quickly, then?', ARRAY['All roses fade quickly', 'Some roses fade quickly', 'No roses fade quickly', 'Cannot determine'], 3, 'intermediate')
ON CONFLICT (id) DO NOTHING;

-- Admin settings default values
INSERT INTO public.admin_settings (key, value)
VALUES
('premium_code', '{"code": "MDCAT2024"}'::jsonb),
('admin_credentials', '{"username": "admin", "password_hash": "admin123"}'::jsonb),
('app_config', '{"quiz_time_per_question": 60, "mock_test_duration": 900}'::jsonb)
ON CONFLICT (key) DO NOTHING;
