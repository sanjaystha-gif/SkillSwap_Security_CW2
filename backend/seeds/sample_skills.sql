-- Insert sample skill categories
INSERT INTO skills (name, category) VALUES
('Tutoring - Math', 'Tutoring'),
('Tutoring - English', 'Tutoring'),
('Guitar Lessons', 'Music'),
('Piano Lessons', 'Music'),
('French Language', 'Languages'),
('Spanish Language', 'Languages'),
('Home Repair - Plumbing', 'Repair'),
('Home Repair - Electrical', 'Repair'),
('Personal Training', 'Fitness'),
('Yoga Instruction', 'Fitness'),
('Logo Design', 'Design'),
('Web Design', 'Design'),
('Photography', 'Photography'),
('Video Editing', 'Video'),
('Coding - JavaScript', 'Tech'),
('Coding - Python', 'Tech'),
('Gardening', 'Gardening'),
('Cooking', 'Cooking'),
('Babysitting', 'Childcare'),
('Pet Sitting', 'Pets')
ON CONFLICT DO NOTHING;
