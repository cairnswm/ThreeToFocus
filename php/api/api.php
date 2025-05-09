<?php

include_once dirname(__FILE__) . "/../corsheaders.php";
include_once dirname(__FILE__) . "/../gapiv2/dbconn.php";
include_once dirname(__FILE__) . "/../gapiv2/v2apicore.php";
include_once dirname(__FILE__) . "/../utils.php";
include_once dirname(__FILE__) . "/../security/security.config.php";

// Get authentication details
$appid = getAppId();
$token = getToken();

// if (validateJwt($token, false) == false) {
//     http_response_code(401);
//     echo json_encode([
//         'error' => true,
//         'message' => 'Unauthorized'
//     ]);
//     die();
// }

// $user = getUserFromToken($token);
// $userid = $user->id;

$threeToFocusConfig = [
    "users" => [
        "tablename" => "projects",
        "key" => "user_id",
        "select" => ["id", "username", "is_admin", "created_at", "modified_at"],
        "create" => ["username", "is_admin"],
        "update" => ["username", "is_admin"],
        "delete" => false,
        "subkeys" => [
            "focus_areas" => [
                "tablename" => "focus_areas",
                "key" => "user_id",
                "select" => ["id", "user_id", "created_at", "modified_at"]
            ],
            "tasks" => [
                "tablename" => "tasks",
                "key" => "assigned_user_id",
                "select" => ["id", "project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status", "created_at", "modified_at"]
            ],
            "project_users" => [
                "tablename" => "project_users",
                "key" => "user_id",
                "select" => ["id", "project_id", "user_id", "created_at", "modified_at"]
            ],
            "focus" => [
                "tablename" => "focus_areas",
                "key" => "user_id",
                "select" => "getUserFocus",
            ],
            "admin" => [
                "tablename" => "focus_areas",
                "key" => "user_id",
                "select" => "getAdminProjects",
            ],
        ]
    ],

    "focus_areas" => [
        "tablename" => "focus_areas",
        "key" => "id",
        "select" => ["id", "user_id", "created_at", "modified_at"],
        "create" => ["user_id"],
        "update" => ["user_id"],
        "delete" => false,
        "subkeys" => [
            "tasks" => [
                "tablename" => "tasks",
                "key" => "focus_area_id",
                "select" => ["id", "project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status", "created_at", "modified_at"]
            ]
        ]
    ],

    "projects" => [
        "tablename" => "projects",
        "key" => "id",
        "select" => ["id", "name", "owner_user_id", "created_at", "modified_at"],
        "create" => ["name", "owner_user_id"],
        "update" => ["name", "owner_user_id"],
        "delete" => false,
        "subkeys" => [
            "features" => [
                "tablename" => "features",
                "key" => "project_id",
                "select" => ["id", "project_id", "name", "created_at", "modified_at"]
            ],
            "tasks" => [
                "tablename" => "tasks",
                "key" => "project_id",
                "select" => ["id", "project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status", "created_at", "modified_at"]
            ],
            "project_users" => [
                "tablename" => "project_users",
                "key" => "project_id",
                "select" => ["id", "project_id", "user_id", "created_at", "modified_at"]
            ]
        ]
    ],

    "features" => [
        "tablename" => "features",
        "key" => "id",
        "select" => ["id", "project_id", "name", "created_at", "modified_at"],
        "create" => ["project_id", "name"],
        "update" => ["project_id", "name"],
        "delete" => false,
        "subkeys" => [
            "tasks" => [
                "tablename" => "tasks",
                "key" => "feature_id",
                "select" => ["id", "project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status", "created_at", "modified_at"]
            ]
        ]
    ],

    "tasks" => [
        "tablename" => "tasks",
        "key" => "id",
        "select" => ["id", "project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status", "created_at", "modified_at"],
        "create" => ["project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status"],
        "update" => ["project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status"],
        "delete" => false,
        "subkeys" => []
    ],

    "project_users" => [
        "tablename" => "project_users",
        "key" => "id",
        "select" => ["id", "project_id", "user_id", "created_at"],
        "create" => ["project_id", "user_id"],
        "update" => ["project_id", "user_id"],
        "delete" => false,
        "subkeys" => []
    ]
];


runAPI($threeToFocusConfig);



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
    ) AS data;
";

    $rows = executeSQL($sql, [$id,$id], ["JSON" => ["data"]]);
    
    return $rows[0]['data'] ?? [];
}

function getAdminProjects($config)
{

    global $gapiconn;

    // var_dump($config);

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
    ) AS data;
";

    $rows = executeSQL($sql, [$id], ["JSON" => ["data"]]);
    
    return $rows[0]['data']['projects'] ?? [];
}
