\c vistagram_posts;

-- =========================
-- POSTS
-- =========================
INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at) VALUES
-- Alice
('a0000001-0000-4000-8000-000000000001', '11111111-1111-1111-1111-111111111111', 'Beautiful sunset at the beach  #sunset #beach', 'Malibu, CA', 245, 18, NOW() - INTERVAL '2 days'),
('a0000002-0000-4000-8000-000000000002', '11111111-1111-1111-1111-111111111111', 'Morning coffee routine  #coffee #morning', 'Home', 156, 12, NOW() - INTERVAL '5 days'),
('a0000003-0000-4000-8000-000000000003', '11111111-1111-1111-1111-111111111111', 'New camera day!  #photography #gear', 'Camera Store', 189, 24, NOW() - INTERVAL '1 week'),

-- Bob
('b0000001-0000-4000-8000-000000000001', '22222222-2222-2222-2222-222222222222', 'Homemade pasta  #foodie #cooking', 'Kitchen', 312, 28, NOW() - INTERVAL '1 day'),
('b0000002-0000-4000-8000-000000000002', '22222222-2222-2222-2222-222222222222', 'Best pizza in town!  #pizza #foodporn', 'Downtown Pizza', 428, 35, NOW() - INTERVAL '3 days'),

-- Charlie
('c0000001-0000-4000-8000-000000000001', '33333333-3333-3333-3333-333333333333', 'Leg day complete  #fitness #gym', 'Gold''s Gym', 521, 42, NOW() - INTERVAL '6 hours'),
('c0000002-0000-4000-8000-000000000002', '33333333-3333-3333-3333-333333333333', 'Morning run through the park  #running #cardio', 'Central Park', 398, 31, NOW() - INTERVAL '2 days'),
('c0000003-0000-4000-8000-000000000003', '33333333-3333-3333-3333-333333333333', 'Meal prep Sunday!  #mealprep #healthy', 'Home Kitchen', 445, 38, NOW() - INTERVAL '4 days'),

-- Diana
('d0000001-0000-4000-8000-000000000001', '44444444-4444-4444-4444-444444444444', 'New digital painting  #art #digital', 'Studio', 267, 22, NOW() - INTERVAL '1 day'),
('d0000002-0000-4000-8000-000000000002', '44444444-4444-4444-4444-444444444444', 'Work in progress... #wip #artist', 'Studio', 189, 15, NOW() - INTERVAL '3 days'),

-- Eve
('e0000001-0000-4000-8000-000000000001', '55555555-5555-5555-5555-555555555555', 'New gaming setup!  #gaming #setup', 'Home', 334, 29, NOW() - INTERVAL '12 hours'),
('e0000002-0000-4000-8000-000000000002', '55555555-5555-5555-5555-555555555555', 'Finally beat the final boss! #gaming #victory', NULL, 256, 21, NOW() - INTERVAL '2 days'),

-- Frank
('f0000001-0000-4000-8000-000000000001', '66666666-6666-6666-6666-666666666666', 'Live set tonight!  #dj #music', 'Club Downtown', 612, 48, NOW() - INTERVAL '8 hours'),
('f0000002-0000-4000-8000-000000000002', '66666666-6666-6666-6666-666666666666', 'New track dropping soon  #producer #newmusic', 'Studio', 523, 41, NOW() - INTERVAL '3 days'),

-- Grace
('f7777777-0000-4000-8000-000000000001', '77777777-7777-7777-7777-777777777777', 'Spring collection preview  #fashion #style', 'Design Studio', 445, 36, NOW() - INTERVAL '1 day'),

-- Henry
('f8888888-0000-4000-8000-000000000001', '88888888-8888-8888-8888-888888888888', 'Summit sunrise  #hiking #mountains', 'Mount Whitney', 567, 44, NOW() - INTERVAL '5 days'),

-- Isabel
('f9999999-0000-4000-8000-000000000001', '99999999-9999-9999-9999-999999999999', 'Currently reading...  #books #reading', 'Home', 198, 16, NOW() - INTERVAL '2 days'),

-- Jack
('aaaaaaaa-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Perfect latte art ☕ #coffee #latteart', 'Coffee Shop', 289, 23, NOW() - INTERVAL '4 hours');

-- =========================
-- POST MEDIA
-- =========================
INSERT INTO post_media (post_id, media_type, media_url, thumbnail_url, width, height, order_index) VALUES
('a0000001-0000-4000-8000-000000000001', 'image', 'https://placeholder.com/sunset.jpg', 'https://placeholder.com/sunset_thumb.jpg', 1080, 1080, 0),
('a0000002-0000-4000-8000-000000000002', 'image', 'https://placeholder.com/coffee.jpg', 'https://placeholder.com/coffee_thumb.jpg', 1080, 1080, 0),
('a0000003-0000-4000-8000-000000000003', 'image', 'https://placeholder.com/camera.jpg', 'https://placeholder.com/camera_thumb.jpg', 1080, 1080, 0),
('b0000001-0000-4000-8000-000000000001', 'image', 'https://placeholder.com/pasta.jpg', 'https://placeholder.com/pasta_thumb.jpg', 1080, 1080, 0),
('b0000002-0000-4000-8000-000000000002', 'image', 'https://placeholder.com/pizza.jpg', 'https://placeholder.com/pizza_thumb.jpg', 1080, 1080, 0),
('c0000001-0000-4000-8000-000000000001', 'image', 'https://placeholder.com/gym.jpg', 'https://placeholder.com/gym_thumb.jpg', 1080, 1080, 0),
('c0000002-0000-4000-8000-000000000002', 'image', 'https://placeholder.com/running.jpg', 'https://placeholder.com/running_thumb.jpg', 1080, 1080, 0),
('c0000003-0000-4000-8000-000000000003', 'image', 'https://placeholder.com/mealprep.jpg', 'https://placeholder.com/mealprep_thumb.jpg', 1080, 1080, 0),
('d0000001-0000-4000-8000-000000000001', 'image', 'https://placeholder.com/art.jpg', 'https://placeholder.com/art_thumb.jpg', 1080, 1350, 0),
('d0000002-0000-4000-8000-000000000002', 'image', 'https://placeholder.com/wip.jpg', 'https://placeholder.com/wip_thumb.jpg', 1080, 1080, 0),
('e0000001-0000-4000-8000-000000000001', 'image', 'https://placeholder.com/setup.jpg', 'https://placeholder.com/setup_thumb.jpg', 1080, 1080, 0),
('e0000002-0000-4000-8000-000000000002', 'image', 'https://placeholder.com/gaming.jpg', 'https://placeholder.com/gaming_thumb.jpg', 1080, 1080, 0),
('f0000001-0000-4000-8000-000000000001', 'image', 'https://placeholder.com/dj.jpg', 'https://placeholder.com/dj_thumb.jpg', 1080, 1080, 0),
('f0000002-0000-4000-8000-000000000002', 'image', 'https://placeholder.com/studio.jpg', 'https://placeholder.com/studio_thumb.jpg', 1080, 1080, 0),
('f7777777-0000-4000-8000-000000000001', 'image', 'https://placeholder.com/fashion.jpg', 'https://placeholder.com/fashion_thumb.jpg', 1080, 1350, 0),
('f8888888-0000-4000-8000-000000000001', 'image', 'https://placeholder.com/mountain.jpg', 'https://placeholder.com/mountain_thumb.jpg', 1080, 1080, 0),
('f9999999-0000-4000-8000-000000000001', 'image', 'https://placeholder.com/books.jpg', 'https://placeholder.com/books_thumb.jpg', 1080, 1080, 0),
('aaaaaaaa-0000-4000-8000-000000000001', 'image', 'https://placeholder.com/latte.jpg', 'https://placeholder.com/latte_thumb.jpg', 1080, 1080, 0);

-- =========================
-- HASHTAGS (idempotent)
-- =========================
INSERT INTO hashtags (tag, post_count) VALUES
('sunset', 1), ('beach', 1), ('coffee', 2), ('morning', 1),
('photography', 1), ('gear', 1), ('foodie', 1), ('cooking', 1),
('pizza', 1), ('foodporn', 1), ('fitness', 1), ('gym', 1),
('running', 1), ('cardio', 1), ('mealprep', 1), ('healthy', 1),
('art', 1), ('digital', 1), ('wip', 1), ('artist', 1),
('gaming', 2), ('setup', 1), ('victory', 1), ('dj', 1),
('music', 1), ('producer', 1), ('newmusic', 1), ('fashion', 1),
('style', 1), ('hiking', 1), ('mountains', 1), ('books', 1),
('reading', 1), ('latteart', 1)
ON CONFLICT (tag) DO NOTHING;

-- =========================
-- POST ↔ HASHTAGS
-- =========================
INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT 'a0000001-0000-4000-8000-000000000001', hashtag_id FROM hashtags WHERE tag IN ('sunset', 'beach');

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT 'a0000002-0000-4000-8000-000000000002', hashtag_id FROM hashtags WHERE tag IN ('coffee', 'morning');

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT 'a0000003-0000-4000-8000-000000000003', hashtag_id FROM hashtags WHERE tag IN ('photography', 'gear');

-- =========================
-- VERIFY
-- =========================
SELECT p.caption, u.username, p.like_count, p.comment_count
FROM posts p
JOIN (VALUES 
    ('11111111-1111-1111-1111-111111111111', 'alice'),
    ('22222222-2222-2222-2222-222222222222', 'bob'),
    ('33333333-3333-3333-3333-333333333333', 'charlie'),
    ('44444444-4444-4444-4444-444444444444', 'diana'),
    ('55555555-5555-5555-5555-555555555555', 'eve'),
    ('66666666-6666-6666-6666-666666666666', 'frank'),
    ('77777777-7777-7777-7777-777777777777', 'grace'),
    ('88888888-8888-8888-8888-888888888888', 'henry'),
    ('99999999-9999-9999-9999-999999999999', 'isabel'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'jack')
) AS u(user_id, username)
ON p.user_id = u.user_id::uuid
ORDER BY p.created_at DESC;
