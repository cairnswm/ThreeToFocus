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
                    'features', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', f.id,
                                'name', f.name
                            )
                        )
                        FROM features f
                        WHERE f.project_id = p.id
                    ),
                    'tasks', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', t3.id,
                                'title', t3.title,
                                'status', t3.status,
                                'type', t3.task_type,       
                                'description', t3.description,                         
                                'feature_id', t3.feature_id,
                                'focus_area_id', t3.focus_area_id
                            )
                        )
                        FROM tasks t3
                        WHERE t3.project_id = p.id
                    ),
                    'users', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', pu2.id,
                                'user_id', pu2.user_id
                            )
                        )
                        FROM project_users pu2
                        WHERE pu2.project_id = p.id
                    )
                )
            )
            FROM projects p
            WHERE p.owner_user_id = ?
        )
    ) AS data;";
    $rows = executeSQL($sql, [$id], ["JSON" => ["data"]]);
    return $rows[0]['data']['projects'] ?? [];
}
