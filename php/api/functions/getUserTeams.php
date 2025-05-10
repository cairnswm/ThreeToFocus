<?php
include_once dirname(__FILE__, 2) . "/../gapiv2/dbconn.php";
include_once dirname(__FILE__, 2) . "/../gapiv2/v2apicore.php";

function getUserTeams($config)
{
    global $gapiconn;
    $id = $config["where"]["user_id"] ?? null;
    $sql = "SELECT 
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', t.id,
            'name', t.name,
            'user_ids', (
                SELECT JSON_ARRAYAGG(tu2.user_id)
                FROM team_users tu2
                WHERE tu2.team_id = t.id
            ),
            'projects', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', p.id,
                        'name', p.name,
                        'owner_user_id', p.owner_user_id,
                        'created_at', p.created_at,
                        'modified_at', p.modified_at
                    )
                )
                FROM team_projects tp
                JOIN projects p ON tp.project_id = p.id
                WHERE tp.team_id = t.id
            )
        )
    ) AS teams
FROM teams t
JOIN team_users tu ON tu.team_id = t.id
WHERE tu.user_id = ?;";
    $rows = executeSQL($sql, [$id], ["JSON" => ["teams"]]);
    return $rows[0]['teams'] ?? [];
}
