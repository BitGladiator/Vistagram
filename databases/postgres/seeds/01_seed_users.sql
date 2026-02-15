-- Connect to users database
\c vistagram_users;

-- Insert test users
-- Password for all users: "password123" (hashed with bcrypt, cost 10)


INSERT INTO users (user_id, username, email, password_hash, full_name, bio, is_verified, follower_count, following_count, post_count) VALUES
('11111111-1111-1111-1111-111111111111', 'alice', 'alice@vistagram.com', '$2b$10$FCxNVi3BAYysQlrM.wrKfuNSuYdEonSzMg52hco3rDL54kUy3VV7a', 'Alice Johnson', 'Photography enthusiast | Travel lover', true, 1500, 200, 45),
('22222222-2222-2222-2222-222222222222', 'bob', 'bob@vistagram.com', '$2b$10$FCxNVi3BAYysQlrM.wrKfuNSuYdEonSzMg52hco3rDL54kUy3VV7a', 'Bob Smith', 'Food blogger  | Chef in training', false, 850, 300, 32),
('33333333-3333-3333-3333-333333333333', 'charlie', 'charlie@vistagram.com', '$2b$10$FCxNVi3BAYysQlrM.wrKfuNSuYdEonSzMg52hco3rDL54kUy3VV7a', 'Charlie Brown', 'Fitness coach  | Motivational speaker', true, 5200, 150, 128),
('44444444-4444-4444-4444-444444444444', 'diana', 'diana@vistagram.com', '$2b$10$FCxNVi3BAYysQlrM.wrKfuNSuYdEonSzMg52hco3rDL54kUy3VV7a', 'Diana Prince', 'Artist  | Digital creator', false, 620, 180, 24),
('55555555-5555-5555-5555-555555555555', 'eve', 'eve@vistagram.com', '$2b$10$FCxNVi3BAYysQlrM.wrKfuNSuYdEonSzMg52hco3rDL54kUy3VV7a', 'Eve Davis', 'Tech enthusiast  | Gamer', false, 420, 250, 18),
('66666666-6666-6666-6666-666666666666', 'frank', 'frank@vistagram.com', '$2b$10$FCxNVi3BAYysQlrM.wrKfuNSuYdEonSzMg52hco3rDL54kUy3VV7a', 'Frank Miller', 'Music producer  | DJ', true, 3100, 100, 67),
('77777777-7777-7777-7777-777777777777', 'grace', 'grace@vistagram.com', '$2b$10$FCxNVi3BAYysQlrM.wrKfuNSuYdEonSzMg52hco3rDL54kUy3VV7a', 'Grace Lee', 'Fashion designer  | Style blogger', false, 980, 220, 41),
('88888888-8888-8888-8888-888888888888', 'henry', 'henry@vistagram.com', '$2b$10$FCxNVi3BAYysQlrM.wrKfuNSuYdEonSzMg52hco3rDL54kUy3VV7a', 'Henry Wilson', 'Adventure seeker  | Outdoor photographer', false, 710, 190, 29),
('99999999-9999-9999-9999-999999999999', 'isabel', 'isabel@vistagram.com', '$2b$10$FCxNVi3BAYysQlrM.wrKfuNSuYdEonSzMg52hco3rDL54kUy3VV7a', 'Isabel Martinez', 'Book lover  | Writer', false, 540, 160, 22),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'jack', 'jack@vistagram.com', '$2b$10$FCxNVi3BAYysQlrM.wrKfuNSuYdEonSzMg52hco3rDL54kUy3VV7a', 'Jack Robinson', 'Coffee addict | Barista', false, 340, 210, 15);

-- Insert user settings for all users
INSERT INTO user_settings (user_id) 
SELECT user_id FROM users;

-- Display created users
SELECT username, full_name, follower_count, post_count FROM users ORDER BY username;