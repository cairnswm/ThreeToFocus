<?php


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once dirname(__FILE__) . "/../corsheaders.php";
include_once dirname(__FILE__) . "/../gapiv2/dbconn.php";
include_once dirname(__FILE__) . "/../gapiv2/v2apicore.php";
include_once dirname(__FILE__) . "/../utils.php";
include_once dirname(__FILE__) . "/../security/security.config.php";

include_once dirname(__FILE__) . "/functions/user_functions.php";

// Get authentication details
$appid = getAppId();
$token = getToken();
$userid = 1493;

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
                "key" => "user_id",
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
            "projects" => [
                "tablename" => "projects",
                "key" => "user_id",
                "select" => "getUserProjects"
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
        "aftercreate" => "afterCreateTeam",
        "afterupdate" => "afterUpdateTeam",
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
        "aftercreate" => "afterCreateProject",
        "afterupdate" => "afterUpdateProject",
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
        "aftercreate" => "afterCreateFeature",
        "afterupdate" => "afterUpdateFeature",
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
        "aftercreate" => "afterCreateTask",
        "afterupdate" => "afterUpdateTask",
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

function afterCreateTeam($config, $data, $newRecord) {
    global $userid;
    $record = $newRecord[0];
    $team_id = $record["id"];
    $user_id = $userid;

    // Add the user to the team
    $sql = "INSERT INTO team_users (team_id, user_id, role, invite_status) VALUES (?, ?, ?, ?)";
    executeSQL($sql, [$team_id, $user_id, "Admin", "Owner"]);

    $sql = "INSERT INTO team_audit_log (team_id, changed_by, change_type, new_data) VALUES (?, ?, 'create', ?)";    
    executeSQL($sql, [$team_id, $user_id, json_encode($record)]);

    // Return the new record
    return [$config, $data, $newRecord];
}

function afterCreateProject($config, $data, $newRecord) {
    global $userid;
    $record = $newRecord[0];
    $project_id = $record["id"];
    $user_id = $userid;

    // Add the user to the project
    $sql = "INSERT INTO project_users (project_id, user_id, role, invite_status) VALUES (?, ?, ?, ?)";
    executeSQL($sql, [$project_id, $user_id, "Admin", "Owner"]);


    $sql = "INSERT INTO project_audit_log (project_id, changed_by, change_type, new_data) VALUES (?, ?, 'create', ?)";
    executeSQL($sql, [$record['id'], $user_id, json_encode($record)]);

    // Return the new record
    return [$config, $data, $newRecord];
}

function afterUpdateTeam($config, $newRecord) {
    global $userid;
    $record = $newRecord[0];
    $team_id = $record["id"];
    $user_id = $userid;

    // Update the team audit log
    $sql = "INSERT INTO team_audit_log (team_id, changed_by, change_type, new_data) VALUES (?, ?, 'update', ?)";
    executeSQL($sql, [$team_id, $user_id, json_encode($record)]);

    // Return the new record
    return [$config, $newRecord];
}

function afterUpdateProject($config, $newRecord) {
    global $userid;
    $record = $newRecord[0];
    $project_id = $record["id"];
    $user_id = $userid;

    // Update the project audit log
    $sql = "INSERT INTO project_audit_log (project_id, changed_by, change_type, new_data) VALUES (?, ?, 'update', ?)";
    executeSQL($sql, [$project_id, $user_id, json_encode($record)]);

    // Return the new record
    return [$config, $newRecord];
}

function afterCreateTask($config, $data, $newRecord) {
    global $userid;
    $record = $newRecord[0];
    $task_id = $record["id"];
    $user_id = $userid;

    // Update the task audit log
    $sql = "INSERT INTO task_audit_log (task_id, changed_by, change_type, new_data) VALUES (?, ?, 'create', ?)";
    executeSQL($sql, [$task_id, $user_id, json_encode($record)]);

    // Return the new record
    return [$config, $data, $newRecord];
}

function afterUpdateTask($config, $newRecord) {
    global $userid;
    $record = $newRecord[0];
    $task_id = $record["id"];
    $user_id = $userid;

    // Update the task audit log
    $sql = "INSERT INTO task_audit_log (task_id, changed_by, change_type, new_data) VALUES (?, ?, 'update', ?)";
    executeSQL($sql, [$task_id, $user_id, json_encode($record)]);

    // Return the new record
    return [$config, $newRecord];
}

function afterCreateFeature($config, $data, $newRecord) {
    global $userid;
    $record = $newRecord[0];
    $feature_id = $record["id"];
    $user_id = $userid;

    // Update the feature audit log
    $sql = "INSERT INTO feature_audit_log (feature_id, changed_by, change_type, new_data) VALUES (?, ?, 'create', ?)";
    executeSQL($sql, [$feature_id, $user_id, json_encode($record)]);

    // Return the new record
    return [$config, $data, $newRecord];
}

function afterUpdateFeature($config, $newRecord) {
    global $userid;
    $record = $newRecord[0];
    $feature_id = $record["id"];
    $user_id = $userid;

    // Update the feature audit log
    $sql = "INSERT INTO feature_audit_log (feature_id, changed_by, change_type, new_data) VALUES (?, ?, 'update', ?)";
    executeSQL($sql, [$feature_id, $user_id, json_encode($record)]);

    // Return the new record
    return [$config, $newRecord];
}

function afterCreateOrganization($config, $data, $newRecord) {
    global $userid;
    $record = $newRecord[0];
    $organization_id = $record["id"];
    $user_id = $userid;

    // Add the user to the organization
    $sql = "INSERT INTO organization_users (organization_id, user_id, role) VALUES (?, ?, ?)";
    executeSQL($sql, [$organization_id, $user_id, "Admin"]);

    // Update the organization audit log
    $sql = "INSERT INTO organization_audit_log (organization_id, changed_by, change_type, new_data) VALUES (?, ?, 'create', ?)";
    executeSQL($sql, [$organization_id, $user_id, json_encode($record)]);

    // Return the new record
    return [$config, $data, $newRecord];
}

function afterUpdateOrganization($config, $newRecord) {
    global $userid;
    $record = $newRecord[0];
    $organization_id = $record["id"];
    $user_id = $userid;

    // Update the organization audit log
    $sql = "INSERT INTO organization_audit_log (organization_id, changed_by, change_type, new_data) VALUES (?, ?, 'update', ?)";
    executeSQL($sql, [$organization_id, $user_id, json_encode($record)]);

    // Return the new record
    return [$config, $newRecord];
}