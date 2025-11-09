-- تحديث كلمة السر إلى نص عادي بسيط
UPDATE settings SET value = 'admin123' WHERE key = 'admin_password';

-- إضافة منتجات مشويات اللحوم
INSERT INTO products (name, category, weights, is_available, display_order) VALUES 
('كباب ضاني', 'grilled_meat', '{"quarter": 200, "half": 270, "three_quarter": 400, "full": 800}'::jsonb, true, 1),
('كفتة ضاني', 'grilled_meat', '{"quarter": 140, "half": 290, "three_quarter": 280, "full": 560}'::jsonb, true, 2),
('مشكل', 'grilled_meat', '{"quarter": 170, "half": 230, "three_quarter": 340, "full": 680}'::jsonb, true, 3),
('طرب ضاني', 'grilled_meat', '{"quarter": 150, "half": 200, "three_quarter": 300, "full": 600}'::jsonb, true, 4),
('ممبار بلدي', 'grilled_meat', '{"quarter": 100, "half": 150, "three_quarter": 200, "full": 400}'::jsonb, true, 5),
('كبدة', 'grilled_meat', '{"full": 300}'::jsonb, true, 6);

-- إضافة منتجات مشويات الدجاج
INSERT INTO products (name, category, weights, is_available, display_order) VALUES 
('شيش طاووق', 'grilled_chicken', '{"quarter": 125, "half": 210, "three_quarter": 250, "full": 500}'::jsonb, true, 1),
('حمام مشوي', 'grilled_chicken', '{"full": 400}'::jsonb, true, 2),
('بانية مشوي', 'grilled_chicken', '{"quarter": 100, "half": 200, "three_quarter": 300, "full": 400}'::jsonb, true, 3),
('جناح مشوي', 'grilled_chicken', '{"quarter": 90, "half": 180}'::jsonb, true, 4),
('فراخ مشوية', 'grilled_chicken', '{"quarter": 75, "half": 140, "three_quarter": 280}'::jsonb, true, 5),
('فراخ على الفحم', 'grilled_chicken', '{"quarter": 80, "half": 150, "three_quarter": 300}'::jsonb, true, 6),
('فراخ تكا', 'grilled_chicken', '{"quarter": 80, "half": 150, "three_quarter": 300}'::jsonb, true, 7);

-- إضافة السندوتشات
INSERT INTO products (name, category, weights, is_available, display_order) VALUES 
('سندوتش كفتة صغير', 'sandwiches', '{"piece": 40}'::jsonb, true, 1),
('سندوتش كفتة كبير', 'sandwiches', '{"piece": 50}'::jsonb, true, 2),
('سندوتش شيش طاووق صغير', 'sandwiches', '{"piece": 40}'::jsonb, true, 3),
('سندوتش شيش طاووق كبير', 'sandwiches', '{"piece": 50}'::jsonb, true, 4),
('سندوتش كباب صغير', 'sandwiches', '{"piece": 100}'::jsonb, true, 5),
('سندوتش كباب كبير', 'sandwiches', '{"piece": 110}'::jsonb, true, 6),
('سندوتش حواوشي', 'sandwiches', '{"piece": 35}'::jsonb, true, 7);

-- إضافة الوجبات الفردية
INSERT INTO products (name, category, weights, description, is_available, display_order) VALUES 
('وجبة سنجل', 'single_meals', '{"piece": 100}'::jsonb, 'نصف فرخة + أرز بسمتي', true, 1),
('وجبة الفرحة', 'single_meals', '{"piece": 160}'::jsonb, 'نصف فرخة + كفتة + أرز بسمتي', true, 2),
('وجبة الريق', 'single_meals', '{"piece": 140}'::jsonb, '¼ شيش طاووق + 2 صباع كفتة', true, 3),
('وجبة المزاج', 'single_meals', '{"piece": 140}'::jsonb, '¼ كفتة + أرز بسمتي', true, 4);

-- إضافة الوجبات العائلية
INSERT INTO products (name, category, weights, description, is_available, display_order) VALUES 
('وجبة رقم 1', 'family_meals', '{"piece": 1100}'::jsonb, '½ كفتة + ½ كباب + ½ طرب + فرخة مشوية + أرز بسمتي', true, 1),
('وجبة رقم 2', 'family_meals', '{"piece": 1250}'::jsonb, '½ كفتة + ½ كباب + ½ طرب + فرخة مشوية + أرز بسمتي', true, 2),
('وجبة رقم 3', 'family_meals', '{"piece": 700}'::jsonb, '¼ كفتة + ¼ كباب + ¼ طرب + شيش طاووق + فرخة مشوية + أرز بسمتي', true, 3),
('وجبة رقم 4', 'family_meals', '{"piece": 750}'::jsonb, '¼ كفتة + ¼ كباب + ¼ طرب + شيش طاووق + فرخة مشوية + أرز بسمتي', true, 4);

-- إضافة الإضافات
INSERT INTO products (name, category, weights, is_available, display_order) VALUES 
('سلطة خضراء', 'extras', '{"piece": 5}'::jsonb, true, 1),
('سلطة طحينة', 'extras', '{"piece": 5}'::jsonb, true, 2),
('مخلل', 'extras', '{"piece": 5}'::jsonb, true, 3);