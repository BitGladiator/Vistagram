\c vistagram_posts;

UPDATE post_media SET media_url = 'https://picsum.photos/seed/' || post_id || '/1080/1080', thumbnail_url = 'https://picsum.photos/seed/' || post_id || '/400/400' WHERE media_url LIKE '%placeholder.com%';

UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/11111111-1111-1111-1111-111111111111/a0000001-0000-4000-8000-000000000001/229625d8-13fa-4fbb-89f0-90e07feaab2f/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/11111111-1111-1111-1111-111111111111/a0000001-0000-4000-8000-000000000001/229625d8-13fa-4fbb-89f0-90e07feaab2f/thumbnail.jpg' WHERE post_id = 'a0000001-0000-4000-8000-000000000001';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT 'a0000001-0000-4000-8000-000000000001', '11111111-1111-1111-1111-111111111111', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = 'a0000001-0000-4000-8000-000000000001');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '229625d8-13fa-4fbb-89f0-90e07feaab2f', 'a0000001-0000-4000-8000-000000000001', 'image', 'http://localhost:9000/vistagram-media/posts/11111111-1111-1111-1111-111111111111/a0000001-0000-4000-8000-000000000001/229625d8-13fa-4fbb-89f0-90e07feaab2f/large.jpg', 'http://localhost:9000/vistagram-media/posts/11111111-1111-1111-1111-111111111111/a0000001-0000-4000-8000-000000000001/229625d8-13fa-4fbb-89f0-90e07feaab2f/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = 'a0000001-0000-4000-8000-000000000001');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/11111111-1111-1111-1111-111111111111/c66ef247-2392-4fcd-8f12-1079b3470dff/052971a7-4e40-4321-b01d-76a1e0b04b9e/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/11111111-1111-1111-1111-111111111111/c66ef247-2392-4fcd-8f12-1079b3470dff/052971a7-4e40-4321-b01d-76a1e0b04b9e/thumbnail.jpg' WHERE post_id = 'c66ef247-2392-4fcd-8f12-1079b3470dff';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT 'c66ef247-2392-4fcd-8f12-1079b3470dff', '11111111-1111-1111-1111-111111111111', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = 'c66ef247-2392-4fcd-8f12-1079b3470dff');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '052971a7-4e40-4321-b01d-76a1e0b04b9e', 'c66ef247-2392-4fcd-8f12-1079b3470dff', 'image', 'http://localhost:9000/vistagram-media/posts/11111111-1111-1111-1111-111111111111/c66ef247-2392-4fcd-8f12-1079b3470dff/052971a7-4e40-4321-b01d-76a1e0b04b9e/large.jpg', 'http://localhost:9000/vistagram-media/posts/11111111-1111-1111-1111-111111111111/c66ef247-2392-4fcd-8f12-1079b3470dff/052971a7-4e40-4321-b01d-76a1e0b04b9e/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = 'c66ef247-2392-4fcd-8f12-1079b3470dff');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/11111111-1111-1111-1111-111111111111/d648fe4f-4e7d-41df-8aa2-c08de1a735f7/c42419df-8658-45f8-ab05-73c1350a2a04/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/11111111-1111-1111-1111-111111111111/d648fe4f-4e7d-41df-8aa2-c08de1a735f7/c42419df-8658-45f8-ab05-73c1350a2a04/thumbnail.jpg' WHERE post_id = 'd648fe4f-4e7d-41df-8aa2-c08de1a735f7';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT 'd648fe4f-4e7d-41df-8aa2-c08de1a735f7', '11111111-1111-1111-1111-111111111111', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = 'd648fe4f-4e7d-41df-8aa2-c08de1a735f7');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT 'c42419df-8658-45f8-ab05-73c1350a2a04', 'd648fe4f-4e7d-41df-8aa2-c08de1a735f7', 'image', 'http://localhost:9000/vistagram-media/posts/11111111-1111-1111-1111-111111111111/d648fe4f-4e7d-41df-8aa2-c08de1a735f7/c42419df-8658-45f8-ab05-73c1350a2a04/large.jpg', 'http://localhost:9000/vistagram-media/posts/11111111-1111-1111-1111-111111111111/d648fe4f-4e7d-41df-8aa2-c08de1a735f7/c42419df-8658-45f8-ab05-73c1350a2a04/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = 'd648fe4f-4e7d-41df-8aa2-c08de1a735f7');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/55555555-5555-5555-5555-555555555555/3782d577-7f96-4999-9974-73a71324142d/00182e28-baf9-4cfc-9fe3-5f36ab98d755/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/55555555-5555-5555-5555-555555555555/3782d577-7f96-4999-9974-73a71324142d/00182e28-baf9-4cfc-9fe3-5f36ab98d755/thumbnail.jpg' WHERE post_id = '3782d577-7f96-4999-9974-73a71324142d';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT '3782d577-7f96-4999-9974-73a71324142d', '55555555-5555-5555-5555-555555555555', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = '3782d577-7f96-4999-9974-73a71324142d');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '00182e28-baf9-4cfc-9fe3-5f36ab98d755', '3782d577-7f96-4999-9974-73a71324142d', 'image', 'http://localhost:9000/vistagram-media/posts/55555555-5555-5555-5555-555555555555/3782d577-7f96-4999-9974-73a71324142d/00182e28-baf9-4cfc-9fe3-5f36ab98d755/large.jpg', 'http://localhost:9000/vistagram-media/posts/55555555-5555-5555-5555-555555555555/3782d577-7f96-4999-9974-73a71324142d/00182e28-baf9-4cfc-9fe3-5f36ab98d755/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = '3782d577-7f96-4999-9974-73a71324142d');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/55555555-5555-5555-5555-555555555555/a21991cb-0fe0-4f1c-9440-47b9c778f2de/5aebcbb0-2bc5-4b2a-ab9d-56e3986b29d9/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/55555555-5555-5555-5555-555555555555/a21991cb-0fe0-4f1c-9440-47b9c778f2de/5aebcbb0-2bc5-4b2a-ab9d-56e3986b29d9/thumbnail.jpg' WHERE post_id = 'a21991cb-0fe0-4f1c-9440-47b9c778f2de';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT 'a21991cb-0fe0-4f1c-9440-47b9c778f2de', '55555555-5555-5555-5555-555555555555', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = 'a21991cb-0fe0-4f1c-9440-47b9c778f2de');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '5aebcbb0-2bc5-4b2a-ab9d-56e3986b29d9', 'a21991cb-0fe0-4f1c-9440-47b9c778f2de', 'image', 'http://localhost:9000/vistagram-media/posts/55555555-5555-5555-5555-555555555555/a21991cb-0fe0-4f1c-9440-47b9c778f2de/5aebcbb0-2bc5-4b2a-ab9d-56e3986b29d9/large.jpg', 'http://localhost:9000/vistagram-media/posts/55555555-5555-5555-5555-555555555555/a21991cb-0fe0-4f1c-9440-47b9c778f2de/5aebcbb0-2bc5-4b2a-ab9d-56e3986b29d9/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = 'a21991cb-0fe0-4f1c-9440-47b9c778f2de');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/55ff75f1-0872-4ce8-a5fc-2445acf5053c/c911932a-4be7-442c-afff-59f7ff6d6590/4965fa82-84ac-405d-88bc-c0e11f628373/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/55ff75f1-0872-4ce8-a5fc-2445acf5053c/c911932a-4be7-442c-afff-59f7ff6d6590/4965fa82-84ac-405d-88bc-c0e11f628373/thumbnail.jpg' WHERE post_id = 'c911932a-4be7-442c-afff-59f7ff6d6590';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT 'c911932a-4be7-442c-afff-59f7ff6d6590', '55ff75f1-0872-4ce8-a5fc-2445acf5053c', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = 'c911932a-4be7-442c-afff-59f7ff6d6590');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '4965fa82-84ac-405d-88bc-c0e11f628373', 'c911932a-4be7-442c-afff-59f7ff6d6590', 'image', 'http://localhost:9000/vistagram-media/posts/55ff75f1-0872-4ce8-a5fc-2445acf5053c/c911932a-4be7-442c-afff-59f7ff6d6590/4965fa82-84ac-405d-88bc-c0e11f628373/large.jpg', 'http://localhost:9000/vistagram-media/posts/55ff75f1-0872-4ce8-a5fc-2445acf5053c/c911932a-4be7-442c-afff-59f7ff6d6590/4965fa82-84ac-405d-88bc-c0e11f628373/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = 'c911932a-4be7-442c-afff-59f7ff6d6590');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/66666666-6666-6666-6666-666666666666/ea8f4206-abaf-4259-a89d-1215226a90c3/4a44134e-4cea-42e8-a6d5-9683c4437d15/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/66666666-6666-6666-6666-666666666666/ea8f4206-abaf-4259-a89d-1215226a90c3/4a44134e-4cea-42e8-a6d5-9683c4437d15/thumbnail.jpg' WHERE post_id = 'ea8f4206-abaf-4259-a89d-1215226a90c3';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT 'ea8f4206-abaf-4259-a89d-1215226a90c3', '66666666-6666-6666-6666-666666666666', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = 'ea8f4206-abaf-4259-a89d-1215226a90c3');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '4a44134e-4cea-42e8-a6d5-9683c4437d15', 'ea8f4206-abaf-4259-a89d-1215226a90c3', 'image', 'http://localhost:9000/vistagram-media/posts/66666666-6666-6666-6666-666666666666/ea8f4206-abaf-4259-a89d-1215226a90c3/4a44134e-4cea-42e8-a6d5-9683c4437d15/large.jpg', 'http://localhost:9000/vistagram-media/posts/66666666-6666-6666-6666-666666666666/ea8f4206-abaf-4259-a89d-1215226a90c3/4a44134e-4cea-42e8-a6d5-9683c4437d15/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = 'ea8f4206-abaf-4259-a89d-1215226a90c3');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/77777777-7777-7777-7777-777777777777/35d103e0-437d-404d-80ea-0c686041e60c/143a23bf-0d1a-43ee-b095-6cf0aecbeabc/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/77777777-7777-7777-7777-777777777777/35d103e0-437d-404d-80ea-0c686041e60c/143a23bf-0d1a-43ee-b095-6cf0aecbeabc/thumbnail.jpg' WHERE post_id = '35d103e0-437d-404d-80ea-0c686041e60c';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT '35d103e0-437d-404d-80ea-0c686041e60c', '77777777-7777-7777-7777-777777777777', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = '35d103e0-437d-404d-80ea-0c686041e60c');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '143a23bf-0d1a-43ee-b095-6cf0aecbeabc', '35d103e0-437d-404d-80ea-0c686041e60c', 'image', 'http://localhost:9000/vistagram-media/posts/77777777-7777-7777-7777-777777777777/35d103e0-437d-404d-80ea-0c686041e60c/143a23bf-0d1a-43ee-b095-6cf0aecbeabc/large.jpg', 'http://localhost:9000/vistagram-media/posts/77777777-7777-7777-7777-777777777777/35d103e0-437d-404d-80ea-0c686041e60c/143a23bf-0d1a-43ee-b095-6cf0aecbeabc/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = '35d103e0-437d-404d-80ea-0c686041e60c');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/476b0b26-905a-4b4c-9474-a4ba9f8ab6cf/06d16086-e689-4741-8b3b-7a006e90b98b/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/476b0b26-905a-4b4c-9474-a4ba9f8ab6cf/06d16086-e689-4741-8b3b-7a006e90b98b/thumbnail.jpg' WHERE post_id = '476b0b26-905a-4b4c-9474-a4ba9f8ab6cf';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT '476b0b26-905a-4b4c-9474-a4ba9f8ab6cf', '88888888-8888-8888-8888-888888888888', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = '476b0b26-905a-4b4c-9474-a4ba9f8ab6cf');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '06d16086-e689-4741-8b3b-7a006e90b98b', '476b0b26-905a-4b4c-9474-a4ba9f8ab6cf', 'image', 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/476b0b26-905a-4b4c-9474-a4ba9f8ab6cf/06d16086-e689-4741-8b3b-7a006e90b98b/large.jpg', 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/476b0b26-905a-4b4c-9474-a4ba9f8ab6cf/06d16086-e689-4741-8b3b-7a006e90b98b/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = '476b0b26-905a-4b4c-9474-a4ba9f8ab6cf');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/5b96d693-7d52-4ff0-9eed-f832f6f1d73e/00912759-b352-4f62-ae48-c8c60eb51ff6/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/5b96d693-7d52-4ff0-9eed-f832f6f1d73e/00912759-b352-4f62-ae48-c8c60eb51ff6/thumbnail.jpg' WHERE post_id = '5b96d693-7d52-4ff0-9eed-f832f6f1d73e';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT '5b96d693-7d52-4ff0-9eed-f832f6f1d73e', '88888888-8888-8888-8888-888888888888', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = '5b96d693-7d52-4ff0-9eed-f832f6f1d73e');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '00912759-b352-4f62-ae48-c8c60eb51ff6', '5b96d693-7d52-4ff0-9eed-f832f6f1d73e', 'image', 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/5b96d693-7d52-4ff0-9eed-f832f6f1d73e/00912759-b352-4f62-ae48-c8c60eb51ff6/large.jpg', 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/5b96d693-7d52-4ff0-9eed-f832f6f1d73e/00912759-b352-4f62-ae48-c8c60eb51ff6/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = '5b96d693-7d52-4ff0-9eed-f832f6f1d73e');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/a3d45f30-e7da-43bc-b87d-a752a19c5a13/7237ff45-9236-46a1-8a58-6f8675fca573/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/a3d45f30-e7da-43bc-b87d-a752a19c5a13/7237ff45-9236-46a1-8a58-6f8675fca573/thumbnail.jpg' WHERE post_id = 'a3d45f30-e7da-43bc-b87d-a752a19c5a13';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT 'a3d45f30-e7da-43bc-b87d-a752a19c5a13', '88888888-8888-8888-8888-888888888888', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = 'a3d45f30-e7da-43bc-b87d-a752a19c5a13');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '7237ff45-9236-46a1-8a58-6f8675fca573', 'a3d45f30-e7da-43bc-b87d-a752a19c5a13', 'image', 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/a3d45f30-e7da-43bc-b87d-a752a19c5a13/7237ff45-9236-46a1-8a58-6f8675fca573/large.jpg', 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/a3d45f30-e7da-43bc-b87d-a752a19c5a13/7237ff45-9236-46a1-8a58-6f8675fca573/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = 'a3d45f30-e7da-43bc-b87d-a752a19c5a13');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/b494a507-a956-408f-a1f9-4031424483fd/a134bcbd-7579-466c-a480-ef8832c8efed/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/b494a507-a956-408f-a1f9-4031424483fd/a134bcbd-7579-466c-a480-ef8832c8efed/thumbnail.jpg' WHERE post_id = 'b494a507-a956-408f-a1f9-4031424483fd';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT 'b494a507-a956-408f-a1f9-4031424483fd', '88888888-8888-8888-8888-888888888888', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = 'b494a507-a956-408f-a1f9-4031424483fd');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT 'a134bcbd-7579-466c-a480-ef8832c8efed', 'b494a507-a956-408f-a1f9-4031424483fd', 'image', 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/b494a507-a956-408f-a1f9-4031424483fd/a134bcbd-7579-466c-a480-ef8832c8efed/large.jpg', 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/b494a507-a956-408f-a1f9-4031424483fd/a134bcbd-7579-466c-a480-ef8832c8efed/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = 'b494a507-a956-408f-a1f9-4031424483fd');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/ea510ab5-65d1-4c89-9212-fc111c3c23ce/1ff9894a-8178-4d3b-ba86-c33a4c13b92c/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/ea510ab5-65d1-4c89-9212-fc111c3c23ce/1ff9894a-8178-4d3b-ba86-c33a4c13b92c/thumbnail.jpg' WHERE post_id = 'ea510ab5-65d1-4c89-9212-fc111c3c23ce';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT 'ea510ab5-65d1-4c89-9212-fc111c3c23ce', '88888888-8888-8888-8888-888888888888', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = 'ea510ab5-65d1-4c89-9212-fc111c3c23ce');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '1ff9894a-8178-4d3b-ba86-c33a4c13b92c', 'ea510ab5-65d1-4c89-9212-fc111c3c23ce', 'image', 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/ea510ab5-65d1-4c89-9212-fc111c3c23ce/1ff9894a-8178-4d3b-ba86-c33a4c13b92c/large.jpg', 'http://localhost:9000/vistagram-media/posts/88888888-8888-8888-8888-888888888888/ea510ab5-65d1-4c89-9212-fc111c3c23ce/1ff9894a-8178-4d3b-ba86-c33a4c13b92c/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = 'ea510ab5-65d1-4c89-9212-fc111c3c23ce');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/25580114-038b-4bd1-a576-75aef81fc65e/018f4df4-639f-42ad-8702-992560791816/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/25580114-038b-4bd1-a576-75aef81fc65e/018f4df4-639f-42ad-8702-992560791816/thumbnail.jpg' WHERE post_id = '25580114-038b-4bd1-a576-75aef81fc65e';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT '25580114-038b-4bd1-a576-75aef81fc65e', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = '25580114-038b-4bd1-a576-75aef81fc65e');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '018f4df4-639f-42ad-8702-992560791816', '25580114-038b-4bd1-a576-75aef81fc65e', 'image', 'http://localhost:9000/vistagram-media/posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/25580114-038b-4bd1-a576-75aef81fc65e/018f4df4-639f-42ad-8702-992560791816/large.jpg', 'http://localhost:9000/vistagram-media/posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/25580114-038b-4bd1-a576-75aef81fc65e/018f4df4-639f-42ad-8702-992560791816/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = '25580114-038b-4bd1-a576-75aef81fc65e');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/378d1838-a21f-4b11-b87f-04b43c23e0e5/ceee1a16-6c07-4649-a1c7-3557e9eaaa1c/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/378d1838-a21f-4b11-b87f-04b43c23e0e5/ceee1a16-6c07-4649-a1c7-3557e9eaaa1c/thumbnail.jpg' WHERE post_id = '378d1838-a21f-4b11-b87f-04b43c23e0e5';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT '378d1838-a21f-4b11-b87f-04b43c23e0e5', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = '378d1838-a21f-4b11-b87f-04b43c23e0e5');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT 'ceee1a16-6c07-4649-a1c7-3557e9eaaa1c', '378d1838-a21f-4b11-b87f-04b43c23e0e5', 'image', 'http://localhost:9000/vistagram-media/posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/378d1838-a21f-4b11-b87f-04b43c23e0e5/ceee1a16-6c07-4649-a1c7-3557e9eaaa1c/large.jpg', 'http://localhost:9000/vistagram-media/posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/378d1838-a21f-4b11-b87f-04b43c23e0e5/ceee1a16-6c07-4649-a1c7-3557e9eaaa1c/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = '378d1838-a21f-4b11-b87f-04b43c23e0e5');
UPDATE post_media SET media_url = 'http://localhost:9000/vistagram-media/posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/51bcdf4a-c75a-4846-876f-7756bf312704/013f07b4-f8fb-4e4f-9a3c-e912cd2f40e7/large.jpg', thumbnail_url = 'http://localhost:9000/vistagram-media/posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/51bcdf4a-c75a-4846-876f-7756bf312704/013f07b4-f8fb-4e4f-9a3c-e912cd2f40e7/thumbnail.jpg' WHERE post_id = '51bcdf4a-c75a-4846-876f-7756bf312704';

INSERT INTO posts (post_id, user_id, caption, location, like_count, comment_count, created_at)
SELECT '51bcdf4a-c75a-4846-876f-7756bf312704', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Recovered post', 'Unknown', 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE post_id = '51bcdf4a-c75a-4846-876f-7756bf312704');

INSERT INTO post_media (media_id, post_id, media_type, media_url, thumbnail_url, width, height, order_index)
SELECT '013f07b4-f8fb-4e4f-9a3c-e912cd2f40e7', '51bcdf4a-c75a-4846-876f-7756bf312704', 'image', 'http://localhost:9000/vistagram-media/posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/51bcdf4a-c75a-4846-876f-7756bf312704/013f07b4-f8fb-4e4f-9a3c-e912cd2f40e7/large.jpg', 'http://localhost:9000/vistagram-media/posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/51bcdf4a-c75a-4846-876f-7756bf312704/013f07b4-f8fb-4e4f-9a3c-e912cd2f40e7/thumbnail.jpg', 1080, 1080, 0
WHERE NOT EXISTS (SELECT 1 FROM post_media WHERE post_id = '51bcdf4a-c75a-4846-876f-7756bf312704');
