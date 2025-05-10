<?php
include_once dirname(__FILE__, 2) . "/../gapiv2/dbconn.php";
include_once dirname(__FILE__, 2) . "/../gapiv2/v2apicore.php";

function getUserFocus($config)
{
    global $gapiconn;
    $id = $config["where"]["user_id"] ?? null;
    $sql = "SELECT 
    JSON_OBJECT(
        'focus_area', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', fa.id,
                    'tasks', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', t.id,
                                'title', t.title,
                                'status', t.status,
                                'type', t.task_type,
                                'description', t.description,
                                'project_id', t.project_id,
                                'feature_id', t.feature_id
                            )
                        )
                        FROM tasks t
                        WHERE t.focus_area_id = fa.id
                    )
                )
            )
            FROM focus_areas fa
            WHERE fa.user_id = ?
        ),
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
                                'id', pu2.id
                            )
                        )
                        FROM project_users pu2
                        WHERE pu2.project_id = p.id
                    )
                )
            )
            FROM project_users pu
            JOIN projects p ON pu.project_id = p.id
            WHERE pu.user_id = ?
        )
    ) AS data;";
    $rows = executeSQL($sql, [$id,$id], ["JSON" => ["data"]]);
    return $rows[0]['data'] ?? [];
}
