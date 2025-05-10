<?php
include_once dirname(__FILE__, 2) . "/../gapiv2/dbconn.php";
include_once dirname(__FILE__, 2) . "/../gapiv2/v2apicore.php";

function getAdminProjects($config)
{
    global $gapiconn;
    $id = $config["where"]["user_id"] ?? null;
    $sql = "SELECT 
    JSON_OBJECT(
        'projects', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', p.id,
                    'name', p.name,
                    'settings', p.settings,
                    'features', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', f.id,
                                'name', f.name,
                                'settings', f.settings
                            )
                        )
                        FROM features f
                        WHERE f.project_id = p.id
                    ),
                    'tasks', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', t.id,
                                'title', t.title,
                                'status', t.status,
                                'type', t.task_type,
                                'description', t.description,
                                'feature_id', t.feature_id,
                                'focus_area_id', t.focus_area_id,
                                'settings', t.settings
                            )
                        )
                        FROM tasks t
                        WHERE t.project_id = p.id
                    ),
                    'users', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'user_id', pu.user_id,
                                'settings', pu.settings
                            )
                        )
                        FROM project_users pu
                        WHERE pu.project_id = p.id
                    )
                )
            )
            FROM project_users pu_main
            JOIN projects p ON pu_main.project_id = p.id
            WHERE pu_main.user_id = ?
        ),
        'teams', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', t.id,
                    'name', t.name,
                    'settings', t.settings,
                    'users', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'user_id', tu.user_id,
                                'settings', tu.settings
                            )
                        )
                        FROM team_users tu
                        WHERE tu.team_id = t.id
                    ),
                    'projects', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'project_id', tp.project_id,
                                'name', p.name,
                                'settings', p.settings,
                                'feature_count', (
                                    SELECT COUNT(*) FROM features f WHERE f.project_id = p.id
                                ),
                                'task_counts', (
                                    SELECT JSON_OBJECT(
                                        'total', COUNT(*),
                                        'done', SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END),
                                        'not_done', SUM(CASE WHEN t.status != 'done' THEN 1 ELSE 0 END),
                                        'in_progress', SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END),
                                        'next', SUM(CASE WHEN t.status = 'next' THEN 1 ELSE 0 END),
                                        'empty', SUM(CASE WHEN t.status IS NULL OR t.status = '' THEN 1 ELSE 0 END)
                                    )
                                    FROM tasks t
                                    WHERE t.project_id = p.id
                                )
                            )
                        )
                        FROM team_projects tp
                        JOIN projects p ON tp.project_id = p.id
                        WHERE tp.team_id = t.id
                    )
                )
            )
            FROM team_users tu_main
            JOIN teams t ON tu_main.team_id = t.id
            WHERE tu_main.user_id = ?
        )
    ) AS data;
";
    $rows = executeSQL($sql, [$id, $id], ["JSON" => ["data"]]);
    return $rows[0]['data'] ?? [];
}
