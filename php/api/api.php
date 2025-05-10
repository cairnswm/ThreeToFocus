<?php

include_once dirname(__FILE__) . "/../corsheaders.php";
include_once dirname(__FILE__) . "/../gapiv2/dbconn.php";
include_once dirname(__FILE__) . "/../gapiv2/v2apicore.php";
include_once dirname(__FILE__) . "/../utils.php";
include_once dirname(__FILE__) . "/../security/security.config.php";
include_once dirname(__FILE__) . "/functions/getUserFocus.php";
include_once dirname(__FILE__) . "/functions/getAdminProjects.php";
include_once dirname(__FILE__) . "/functions/getUserTeams.php";

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
                "select" => ["id", "user_id", "settings", "created_at", "modified_at"]
            ],
            "tasks" => [
                "tablename" => "tasks",
                "key" => "assigned_user_id",
                "select" => ["id", "project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status", "settings", "created_at", "modified_at"]
            ],
            "project_users" => [
                "tablename" => "project_users",
                "key" => "user_id",
                "select" => ["id", "project_id", "user_id", "settings", "created_at", "modified_at"]
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
            "teams" => [
                "tablename" => "teams",
                "key" => "user_id",
                "select" => "getUserTeams",
            ],
        ]
    ],

    "focus_areas" => [
        "tablename" => "focus_areas",
        "key" => "id",
        "select" => ["id", "user_id", "settings", "created_at", "modified_at"],
        "create" => ["user_id", "settings"],
        "update" => ["user_id", "settings"],
        "delete" => false,
        "subkeys" => [
            "tasks" => [
                "tablename" => "tasks",
                "key" => "focus_area_id",
                "select" => ["id", "project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status", "settings", "created_at", "modified_at"]
            ]
        ]
    ],

    "projects" => [
        "tablename" => "projects",
        "key" => "id",
        "select" => ["id", "name", "owner_user_id", "settings", "created_at", "modified_at"],
        "create" => ["name", "owner_user_id", "settings"],
        "update" => ["name", "owner_user_id", "settings"],
        "delete" => false,
        "subkeys" => [
            "features" => [
                "tablename" => "features",
                "key" => "project_id",
                "select" => ["id", "project_id", "name", "settings", "created_at", "modified_at"]
            ],
            "tasks" => [
                "tablename" => "tasks",
                "key" => "project_id",
                "select" => ["id", "project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status", "settings", "created_at", "modified_at"]
            ],
            "project_users" => [
                "tablename" => "project_users",
                "key" => "project_id",
                "select" => ["id", "project_id", "user_id", "settings", "created_at", "modified_at"]
            ]
        ]
    ],

    "features" => [
        "tablename" => "features",
        "key" => "id",
        "select" => ["id", "project_id", "name", "settings", "created_at", "modified_at"],
        "create" => ["project_id", "name", "settings"],
        "update" => ["project_id", "name", "settings"],
        "delete" => false,
        "subkeys" => [
            "tasks" => [
                "tablename" => "tasks",
                "key" => "feature_id",
                "select" => ["id", "project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status", "settings", "created_at", "modified_at"]
            ]
        ]
    ],

    "tasks" => [
        "tablename" => "tasks",
        "key" => "id",
        "select" => ["id", "project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status", "settings", "created_at", "modified_at"],
        "create" => ["project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status", "settings"],
        "update" => ["project_id", "feature_id", "focus_area_id", "assigned_user_id", "title", "description", "task_type", "status", "settings"],
        "delete" => false,
        "subkeys" => []
    ],

    "project_users" => [
        "tablename" => "project_users",
        "key" => "id",
        "select" => ["id", "project_id", "user_id", "settings", "created_at"],
        "create" => ["project_id", "user_id", "settings"],
        "update" => ["project_id", "user_id", "settings"],
        "delete" => false,
        "subkeys" => []
    ],
    "teams" => [
        "tablename" => "teams",
        "key" => "id",
        "select" => ["id", "name", "settings", "created_at", "modified_at"],
        "create" => ["name", "settings"],
        "update" => ["name", "settings"],
        "delete" => false,
        "subkeys" => [
            "team_users" => [
                "tablename" => "team_users",
                "key" => "team_id",
                "select" => ["id", "team_id", "user_id", "role", "settings", "created_at", "modified_at"]
            ],
            "team_projects" => [
                "tablename" => "team_projects",
                "key" => "team_id",
                "select" => ["id", "team_id", "project_id", "settings", "created_at", "modified_at"]
            ]
        ]
    ],

    "team_users" => [
        "tablename" => "team_users",
        "key" => "id",
        "select" => ["id", "team_id", "user_id", "role", "settings", "created_at", "modified_at"],
        "create" => ["team_id", "user_id", "role", "settings"],
        "update" => ["team_id", "user_id", "role", "settings"],
        "delete" => false,
        "subkeys" => []
    ],

    "team_projects" => [
        "tablename" => "team_projects",
        "key" => "id",
        "select" => ["id", "team_id", "project_id", "settings", "created_at", "modified_at"],
        "create" => ["team_id", "project_id", "settings"],
        "update" => ["team_id", "project_id", "settings"],
        "delete" => false,
        "subkeys" => []
    ]
];

runAPI($threeToFocusConfig);
