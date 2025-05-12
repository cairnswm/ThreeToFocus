<?php

include_once dirname(__FILE__) . "/../corsheaders.php";
include_once dirname(__FILE__) . "/../gapiv2/dbconn.php";
include_once dirname(__FILE__) . "/../gapiv2/v2apicore.php";
include_once dirname(__FILE__) . "/../utils.php";
include_once dirname(__FILE__) . "/../security/security.config.php";

include_once dirname(__FILE__) . "/functions/user_functions.php";

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
        "tablename" => "tasks",
        "key" => "id",
        "select" => ["id"],
        "create" => false,
        "update" => false,
        "delete" => false,
        "subkeys" => [
            "tasks" => [
                "tablename" => "tasks",
                "key" => "assigned_to",
                "select" => ["id", "project_id", "feature_id", "assigned_to", "title", "description", "task_type", "status", "settings", "created_at", "modified_at"]
            ],
            "project_users" => [
                "tablename" => "project_users",
                "key" => "user_id",
                "select" => ["id", "project_id", "user_id", "email", "role", "invite_status", "settings", "created_at", "modified_at"]
            ],
            "focus" => [
                "tablename" => "tasks",
                "key" => "assigned_to",
                "select" => "getUserFocus"
            ],
            "admin" => [
                "tablename" => "projects",
                "key" => "user_id",
                "select" => "getAdminProjects"
            ],
            "teams" => [
                "tablename" => "teams",
                "key" => "user_id",
                "select" => "getUserTeams"
            ],
            "organizations" => [
                "tablename" => "organizations",
                "key" => "user_id",
                "select" => "getUserOrganizations"
            ],
        ]
    ],
    "organization_users" => [
        "tablename" => "organization_users",
        "key" => "id",
        "select" => ["id", "organization_id", "user_id", "email", "role", "invite_status", "settings", "created_at", "modified_at"],
        "create" => ["organization_id", "user_id", "email", "role", "invite_status", "settings"],
        "update" => ["role", "invite_status", "settings"],
        "delete" => true
    ],
    "organizations" => [
        "tablename" => "organizations",
        "key" => "id",
        "select" => ["id", "name", "description", "settings", "created_at", "modified_at"],
        "create" => ["name", "description", "settings"],
        "update" => ["name", "description", "settings"],
        "delete" => true,
        "subkeys" => [
            "organization_users" => [
                "tablename" => "organization_users",
                "key" => "organization_id",
                "select" => ["id", "organization_id", "user_id", "email", "role", "invite_status", "settings", "created_at", "modified_at"]
            ],
            "teams" => [
                "tablename" => "teams",
                "key" => "organization_id",
                "select" => ["id", "organization_id", "name", "description", "settings", "created_at", "modified_at"]
            ]
        ]
    ],
    "team_users" => [
        "tablename" => "team_users",
        "key" => "id",
        "select" => ["id", "team_id", "user_id", "email", "role", "invite_status", "settings", "created_at", "modified_at"],
        "create" => ["team_id", "user_id", "email", "role", "invite_status", "settings"],
        "update" => ["role", "invite_status", "settings"],
        "delete" => true
    ],
    "project_users" => [
        "tablename" => "project_users",
        "key" => "id",
        "select" => ["id", "project_id", "user_id", "email", "role", "invite_status", "settings", "created_at", "modified_at"],
        "create" => ["project_id", "user_id", "email", "role", "invite_status", "settings"],
        "update" => ["role", "invite_status", "settings"],
        "delete" => true
    ],
    "teams" => [
        "tablename" => "teams",
        "key" => "id",
        "select" => ["id", "organization_id", "name", "description", "settings", "created_at", "modified_at"],
        "create" => ["organization_id", "name", "description", "settings"],
        "update" => ["name", "description", "settings"],
        "delete" => true,
        "subkeys" => [
            "team_users" => [
                "tablename" => "team_users",
                "key" => "team_id",
                "select" => ["id", "team_id", "user_id", "email", "role", "invite_status", "settings", "created_at", "modified_at"]
            ],
            "projects" => [
                "tablename" => "projects",
                "key" => "team_id",
                "select" => ["id", "team_id", "name", "description", "settings", "created_at", "modified_at"]
            ],
            "audit_log" => [
                "tablename" => "team_audit_log",
                "key" => "team_id",
                "select" => ["id", "team_id", "changed_by", "change_type", "old_data", "new_data", "created_at"]
            ]
        ]
    ],
    "projects" => [
        "tablename" => "projects",
        "key" => "id",
        "select" => ["id", "team_id", "name", "description", "settings", "created_at", "modified_at"],
        "create" => ["team_id", "name", "description", "settings"],
        "update" => ["name", "description", "settings"],
        "delete" => true,
        "subkeys" => [
            "project_users" => [
                "tablename" => "project_users",
                "key" => "project_id",
                "select" => ["id", "project_id", "user_id", "email", "role", "invite_status", "settings", "created_at", "modified_at"]
            ],
            "features" => [
                "tablename" => "features",
                "key" => "project_id",
                "select" => ["id", "project_id", "name", "description", "settings", "created_at", "modified_at"]
            ],
            "tasks" => [
                "tablename" => "tasks",
                "key" => "project_id",
                "select" => ["id", "project_id", "feature_id", "title", "description", "task_type", "status", "assigned_to", "settings", "created_at", "modified_at"]
            ],
            "audit_log" => [
                "tablename" => "project_audit_log",
                "key" => "project_id",
                "select" => ["id", "project_id", "changed_by", "change_type", "old_data", "new_data", "created_at"]
            ]
        ]
    ],
    "features" => [
        "tablename" => "features",
        "key" => "id",
        "select" => ["id", "project_id", "name", "description", "settings", "created_at", "modified_at"],
        "create" => ["project_id", "name", "description", "settings"],
        "update" => ["name", "description", "settings"],
        "delete" => true,
        "subkeys" => [
            "tasks" => [
                "tablename" => "tasks",
                "key" => "feature_id",
                "select" => ["id", "project_id", "feature_id", "title", "description", "task_type", "status", "assigned_to", "settings", "created_at", "modified_at"]
            ],
            "audit_log" => [
                "tablename" => "feature_audit_log",
                "key" => "feature_id",
                "select" => ["id", "feature_id", "changed_by", "change_type", "old_data", "new_data", "created_at"]
            ]
        ]
    ],
    "tasks" => [
        "tablename" => "tasks",
        "key" => "id",
        "select" => ["id", "project_id", "feature_id", "title", "description", "task_type", "status", "assigned_to", "settings", "created_at", "modified_at"],
        "create" => ["project_id", "feature_id", "title", "description", "task_type", "status", "assigned_to", "settings"],
        "update" => ["title", "description", "task_type", "status", "assigned_to", "settings"],
        "delete" => true,
        "subkeys" => [
            "audit_log" => [
                "tablename" => "task_audit_log",
                "key" => "task_id",
                "select" => ["id", "task_id", "changed_by", "change_type", "old_status", "new_status", "old_data", "new_data", "created_at"]
            ]
        ]
    ]
];

runAPI($threeToFocusConfig);
