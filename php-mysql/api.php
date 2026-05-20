<?php
/**
 * Modern Wedding CMS - Visual Builder & JSON REST API Backend
 * Handled elegantly with modern architecture (routing, prepared statements, and transaction safety).
 */

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';
$db = getDatabaseConnection();

try {
    switch ($action) {
        case 'get_content':
            // 1. Fetch page settings (Fallback to default if empty)
            $stmt = $db->query("SELECT * FROM `page_settings` ORDER BY `id` DESC LIMIT 1");
            $settings = $stmt->fetch();
            if (!$settings) {
                $settings = [
                    'names_title' => 'Денисъ & Дарья',
                    'subtitle' => 'Усадьба Херувимовых',
                    'date_text' => 'Двадцать шестое сентября',
                    'year_text' => 'две тысячи двадцать шестого года',
                    'rsvp_deadline' => '1 сентября 2026',
                    'location_name' => 'Усадьба Херувимовых (Лесная Палата)',
                    'location_address' => 'Живописный усадебный комплекс, вековые сосны и свежий лесной воздух',
                    'map_coordinates' => '55.5972,37.1104',
                    'story_title' => 'История Одной Мечты',
                    'story_subtitle' => 'Сплетение судеб у камина усадьбы',
                    'story_text' => 'Мы встретились в прохладе усадебных аллей...',
                    'active_theme' => 'antique-cream',
                    'music_track_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    'custom_scripts' => ''
                ];
            }

            // 2. Fetch timeline schedule
            $scheduleStmt = $db->query("SELECT * FROM `schedule` ORDER BY `sort_order` ASC, `id` ASC");
            $schedule = $scheduleStmt->fetchAll();

            // 3. Fetch estate rules
            $rulesStmt = $db->query("SELECT * FROM `estate_rules` ORDER BY `sort_order` ASC, `id` ASC");
            $rules = $rulesStmt->fetchAll();

            echo json_encode([
                'success' => true,
                'data' => [
                    'settings' => $settings,
                    'schedule' => $schedule,
                    'rules' => $rules
                ]
            ]);
            break;

        case 'save_content':
            $headers = getallheaders();
            $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
            if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            }
            if ($authHeader !== "Bearer denis_wedding_admin_secure_token_2026") {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            // Visual Builder save handler
            // Reads stream input (JSON payload)
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                throw new Exception("Invalid JSON request body.");
            }

            // Begin transaction to ensure atomic updates across all visual sections
            $db->beginTransaction();

            // A. Update page settings
            $s = $input['settings'] ?? [];
            $settingsStmt = $db->prepare("
                UPDATE `page_settings` 
                SET 
                    `names_title` = :names_title,
                    `subtitle` = :subtitle,
                    `date_text` = :date_text,
                    `year_text` = :year_text,
                    `rsvp_deadline` = :rsvp_deadline,
                    `location_name` = :location_name,
                    `location_address` = :location_address,
                    `map_coordinates` = :map_coordinates,
                    `story_title` = :story_title,
                    `story_subtitle` = :story_subtitle,
                    `story_text` = :story_text,
                    `active_theme` = :active_theme,
                    `music_track_url` = :music_track_url,
                    `custom_scripts` = :custom_scripts
                WHERE `id` = 1
            ");
            $settingsStmt->execute([
                ':names_title' => $s['names_title'] ?? 'Денисъ & Дарья',
                ':subtitle' => $s['subtitle'] ?? 'Усадьба Херувимовых',
                ':date_text' => $s['date_text'] ?? 'Двадцать шестое сентября',
                ':year_text' => $s['year_text'] ?? 'две тысячи двадцать шестого года',
                ':rsvp_deadline' => $s['rsvp_deadline'] ?? '1 сентября 2026',
                ':location_name' => $s['location_name'] ?? 'Усадьба Херувимовых',
                ':location_address' => $s['location_address'] ?? '',
                ':map_coordinates' => $s['map_coordinates'] ?? '55.5972,37.1104',
                ':story_title' => $s['story_title'] ?? 'История',
                ':story_subtitle' => $s['story_subtitle'] ?? '',
                ':story_text' => $s['story_text'] ?? '',
                ':active_theme' => $s['active_theme'] ?? 'antique-cream',
                ':music_track_url' => $s['music_track_url'] ?? '',
                ':custom_scripts' => $s['custom_scripts'] ?? ''
            ]);

            // B. Update Timeline Schedule
            if (isset($input['schedule']) && is_array($input['schedule'])) {
                // To support live deletion and updates simply: clear schedule and recreate, or optimize updates
                $db->exec("DELETE FROM `schedule` WHERE 1");
                $scheduleInsert = $db->prepare("
                    INSERT INTO `schedule` (`event_time`, `event_title`, `event_desc`, `icon_name`, `sort_order`)
                    VALUES (:time, :title, :desc, :icon, :order)
                ");
                foreach ($input['schedule'] as $idx => $item) {
                    $scheduleInsert->execute([
                        ':time' => $item['event_time'] ?? '12:00',
                        ':title' => $item['event_title'] ?? 'Событие',
                        ':desc' => $item['event_desc'] ?? '',
                        ':icon' => $item['icon_name'] ?? 'sparkles',
                        ':order' => $idx
                    ]);
                }
            }

            // C. Update Estate Rules
            if (isset($input['rules']) && is_array($input['rules'])) {
                $db->exec("DELETE FROM `estate_rules` WHERE 1");
                $rulesInsert = $db->prepare("
                    INSERT INTO `estate_rules` (`title`, `content`, `icon_name`, `sort_order`)
                    VALUES (:title, :content, :icon, :order)
                ");
                foreach ($input['rules'] as $idx => $rule) {
                    $rulesInsert->execute([
                        ':title' => $rule['title'] ?? 'Правило',
                        ':content' => $rule['content'] ?? '',
                        ':icon' => $rule['icon_name'] ?? 'info',
                        ':order' => $idx
                    ]);
                }
            }

            $db->commit();
            echo json_encode(['success' => true, 'message' => 'Visual changes saved successfully!']);
            break;

        case 'rsvp':
            // RSVP form submissions handler from the main frontend page
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                throw new Exception("Invalid form payload.");
            }

            $guestName = trim($input['guest_name'] ?? '');
            if (empty($guestName)) {
                throw new Exception("Пожалуйста, впишите Ваше имя для занесения в усадебную гостевую книгу.");
            }

            $isAttending = isset($input['is_attending']) ? (int)$input['is_attending'] : 1;
            $companion = trim($input['companion'] ?? '');
            
            // Preferences
            $drinks = isset($input['drink_preferences']) ? json_encode($input['drink_preferences'], JSON_UNESCAPED_UNICODE) : '[]';
            $food = trim($input['food_preferences'] ?? '');

            $rsvpStmt = $db->prepare("
                INSERT INTO `rsvp_submissions` (`guest_name`, `is_attending`, `companion`, `drink_preferences`, `food_preferences`)
                VALUES (:guest_name, :is_attending, :companion, :drink_preferences, :food_preferences)
            ");
            
            $rsvpStmt->execute([
                ':guest_name' => $guestName,
                ':is_attending' => $isAttending,
                ':companion' => empty($companion) ? null : $companion,
                ':drink_preferences' => $drinks,
                ':food_preferences' => empty($food) ? null : $food
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Ваш ответъ принятъ благосклонно. Мы с нетерпением ждем Вас на торжестве!'
            ]);
            break;

        case 'get_rsvps':
            $headers = getallheaders();
            $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
            if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            }
            if ($authHeader !== "Bearer denis_wedding_admin_secure_token_2026") {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            // Simple display of the RSVP list inside the Admin dashboard view
            $stmt = $db->query("SELECT * FROM `rsvp_submissions` ORDER BY `submitted_at` DESC");
            $rsvps = $stmt->fetchAll();
            
            // Decode drink arrays on flight for clean formatting
            foreach ($rsvps as &$rsvp) {
                $rsvp['drink_preferences'] = json_decode($rsvp['drink_preferences'] ?? '[]', true);
            }

            echo json_encode([
                'success' => true,
                'data' => $rsvps
            ]);
            break;

        case 'admin_login':
            $input = json_decode(file_get_contents('php://input'), true);
            $login = trim($input['login'] ?? '');
            $password = trim($input['password'] ?? '');
            
            if ($login === 'denis' && $password === '335464542Ltybc') {
                echo json_encode([
                    'success' => true,
                    'token' => 'denis_wedding_admin_secure_token_2026'
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Неверный логин или пароль'
                ]);
            }
            break;

        case 'admin_check_yandex':
            $input = json_decode(file_get_contents('php://input'), true);
            $yandexId = isset($input['yandexId']) ? (string)$input['yandexId'] : '';
            $email = isset($input['email']) ? (string)$input['email'] : '';
            
            // Hardcoded failsafes
            $hardcodedAdmins = ["d.kheruvimov@ya.ru", "d.kheruvimov@gmail.com", "rusillusion@gmail.com"];
            $normalizedEmail = empty($email) ? "" : str_replace("@yandex.ru", "@ya.ru", strtolower(trim($email)));
            
            if (in_array($normalizedEmail, $hardcodedAdmins)) {
                echo json_encode([
                    'success' => true,
                    'isAdmin' => true,
                    'token' => 'denis_wedding_admin_secure_token_2026'
                ]);
                break;
            }
            
            $stmt = $db->prepare("SELECT COUNT(*) as cnt FROM `admin_yandex_links` WHERE `yandex_id` = :yandex_id");
            $stmt->execute([':yandex_id' => $yandexId]);
            $row = $stmt->fetch();
            
            if ($row && $row['cnt'] > 0) {
                echo json_encode([
                    'success' => true,
                    'isAdmin' => true,
                    'token' => 'denis_wedding_admin_secure_token_2026'
                ]);
            } else {
                echo json_encode([
                    'success' => true,
                    'isAdmin' => false
                ]);
            }
            break;

        case 'admin_get_linked':
            $headers = getallheaders();
            $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
            if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            }
            if ($authHeader !== "Bearer denis_wedding_admin_secure_token_2026") {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }
            
            $stmt = $db->query("SELECT `yandex_id` as `yandexId`, `login`, `real_name` as `realName`, `avatar_url` as `avatarUrl`, `linked_at` as `linkedAt` FROM `admin_yandex_links` ORDER BY `linked_at` DESC");
            $linked = $stmt->fetchAll();
            echo json_encode($linked);
            break;

        case 'admin_link':
            $headers = getallheaders();
            $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
            if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            }
            if ($authHeader !== "Bearer denis_wedding_admin_secure_token_2026") {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $yandexId = isset($input['yandexId']) ? (string)$input['yandexId'] : '';
            $login = isset($input['login']) ? (string)$input['login'] : '';
            $realName = isset($input['realName']) ? (string)$input['realName'] : '';
            $avatarUrl = isset($input['avatarUrl']) ? (string)$input['avatarUrl'] : '';
            
            if (empty($yandexId)) {
                throw new Exception("Missing yandexId");
            }
            
            $stmt = $db->prepare("
                INSERT INTO `admin_yandex_links` (`yandex_id`, `login`, `real_name`, `avatar_url`)
                VALUES (:yandex_id, :login, :real_name, :avatar_url)
                ON DUPLICATE KEY UPDATE `login` = :login, `real_name` = :real_name, `avatar_url` = :avatar_url
            ");
            $stmt->execute([
                ':yandex_id' => $yandexId,
                ':login' => $login,
                ':real_name' => $realName,
                ':avatar_url' => $avatarUrl
            ]);
            
            echo json_encode(['success' => true]);
            break;

        case 'admin_unlink':
            $headers = getallheaders();
            $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
            if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            }
            if ($authHeader !== "Bearer denis_wedding_admin_secure_token_2026") {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $yandexId = isset($input['yandexId']) ? (string)$input['yandexId'] : '';
            
            if (empty($yandexId)) {
                throw new Exception("Missing yandexId");
            }
            
            $stmt = $db->prepare("DELETE FROM `admin_yandex_links` WHERE `yandex_id` = :yandex_id");
            $stmt->execute([':yandex_id' => $yandexId]);
            
            echo json_encode(['success' => true]);
            break;

        default:
            throw new Exception("Unknown backend API action.");
    }
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
