-- SQL Database Schema for Modern Wedding Invitation CMS
-- Optimized for MySQL 8.0+

CREATE DATABASE IF NOT EXISTS `kheruvimovy_wedding` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kheruvimovy_wedding`;

-- 1. Table for global site settings (Visual Builder state)
CREATE TABLE IF NOT EXISTS `page_settings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `names_title` VARCHAR(255) NOT NULL DEFAULT 'Дениса & Дарьи',
    `subtitle` VARCHAR(255) NOT NULL DEFAULT 'Усадьба Херувимовых',
    `date_text` VARCHAR(255) NOT NULL DEFAULT 'Двадцать шестое сентября',
    `year_text` VARCHAR(50) NOT NULL DEFAULT 'две тысячи двадцать шестого года',
    `rsvp_deadline` VARCHAR(100) NOT NULL DEFAULT '1 сентября 2026',
    `location_name` VARCHAR(255) NOT NULL DEFAULT 'Усадьба Крекшино',
    `location_address` VARCHAR(255) NOT NULL DEFAULT 'Москва, пос. Первомайское, дер. Крекшино',
    `map_coordinates` VARCHAR(100) NOT NULL DEFAULT '55.5972,37.1104',
    `story_title` VARCHAR(255) NOT NULL DEFAULT 'Наша История',
    `story_subtitle` VARCHAR(255) NOT NULL DEFAULT 'Любовь сквозь время в усадебных аллеях',
    `story_text` TEXT NOT NULL,
    `active_theme` VARCHAR(50) NOT NULL DEFAULT 'antique-cream',
    `music_track_url` VARCHAR(512) DEFAULT 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    `custom_scripts` TEXT DEFAULT NULL, -- Allows adding custom frames/frameworks on-the-fly
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial values matching the original project
INSERT INTO `page_settings` (
    `names_title`, `subtitle`, `date_text`, `year_text`, `rsvp_deadline`, 
    `location_name`, `location_address`, `map_coordinates`, 
    `story_title`, `story_subtitle`, `story_text`, `active_theme`
) VALUES (
    'Денисъ & Дарья',
    'Усадьба Херувимовых',
    'Двадцать шестое сентября',
    'две тысячи двадцать шестого года',
    '1 сентября 2026',
    'Усадьба Херувимовых (Лесная Палата)',
    'Живописный усадебный комплекс, вековые сосны и свежий лесной воздух',
    '55.5972,37.1104',
    'История Одной Мечты',
    'Сплетение судеб у камина усадьбы',
    'Мы встретились в прохладе усадебных аллей осенним теплым вечером. Наша история — это история о долгих беседах за чаем, общих ценностях и большой любви, которая сегодня обретает новые, вечные семейные узы. С трепетом в сердце ждем встречи с нашими самыми близкими людьми в этот великий день.',
    'antique-cream'
) ON DUPLICATE KEY UPDATE `id`=`id`;


-- 2. Table for interactive Day Schedule / Plan
CREATE TABLE IF NOT EXISTS `schedule` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `event_time` VARCHAR(20) NOT NULL,
    `event_title` VARCHAR(255) NOT NULL,
    `event_desc` TEXT DEFAULT NULL,
    `icon_name` VARCHAR(50) NOT NULL DEFAULT 'sparkles',
    `sort_order` INT UNSIGNED DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default schedule items
INSERT INTO `schedule` (`event_time`, `event_title`, `event_desc`, `icon_name`, `sort_order`) VALUES
('15:00', 'Съезд благородных гостей', 'Встреча в тени вековых сосен усадьбы, легкий фуршет в сопровождении струнного квартета и усадебные забавы для дорогих гостей.', 'users', 1),
('16:00', 'Церемония союза', 'Торжественная регистрация нашего союза под столетним дубом. Клятвы, слезы радости и первый семейный вальс.', 'heart', 2),
('17:00', 'Усадебный Званый Ужин', 'Праздничный ужин в Лесной Палате. Вечер изысканной гастрономии, теплых семейных тостов и старинных традиций.', 'wine', 3),
('21:00', 'Светомузыкальное представление', 'Танцы под звездным небом, разрезание праздничного торта и запуск огней семейного очага.', 'cake', 4),
('22:30', 'Проводы благородных гостей', 'Прощальный чай у камина, объятия и трансфер для гостей в город.', 'moon', 5)
ON DUPLICATE KEY UPDATE `id`=`id`;


-- 3. Table for "Усадебный устав" (Rules of the estate)
CREATE TABLE IF NOT EXISTS `estate_rules` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `icon_name` VARCHAR(50) NOT NULL DEFAULT 'info',
    `sort_order` INT UNSIGNED DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default rules matching original mood
INSERT INTO `estate_rules` (`title`, `content`, `icon_name`, `sort_order`) VALUES
('Дресс-код: Дворянский шик', 'Мы будем несказанно рады видеть вас в нарядах благородных оттенков: глубокий изумрудный, теплое золото, пудрово-розовый и классический песочный.', 'shirt', 1),
('Подарки: Цветы увядают', 'Пожалуйста, вместо традиционных букетов отдайте предпочтение вашей любимой бутылке вина или книге для создания нашей семейной библиотеки.', 'gift', 2),
('Беззвучные призывы', 'Просим перевести ваши мобильные устройства в беззвучный режим во время торжественной церемонии союза у столетнего дуба.', 'bell-off', 3)
ON DUPLICATE KEY UPDATE `id`=`id`;


-- 4. Table for RSVP / Guests Responses
CREATE TABLE IF NOT EXISTS `rsvp_submissions` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `guest_name` VARCHAR(255) NOT NULL,
    `is_attending` TINYINT(1) NOT NULL DEFAULT 1, -- 1 = Yes, 0 = No
    `companion` VARCHAR(255) DEFAULT NULL,
    `drink_preferences` VARCHAR(512) DEFAULT NULL, -- JSON formatted array of selections
    `food_preferences` TEXT DEFAULT NULL, -- Special requests
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table for Linked Admin Yandex Accounts
CREATE TABLE IF NOT EXISTS `admin_yandex_links` (
    `yandex_id` VARCHAR(255) PRIMARY KEY,
    `login` VARCHAR(255) NOT NULL,
    `real_name` VARCHAR(255) DEFAULT NULL,
    `avatar_url` VARCHAR(512) DEFAULT NULL,
    `linked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
