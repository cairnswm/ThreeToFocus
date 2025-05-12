<?php 

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once dirname(__FILE__) . "/../corsheaders.php";
include_once dirname(__FILE__) . "/../gapiv2/dbconn.php";

function respondToInvite()
{
    $body = json_decode(file_get_contents("php://input"), true);

    $type = $body["type"] ?? null;
    $id = $body["id"] ?? null;
    $action = $body["action"] ?? null; // 'accepted' or 'declined'

    if (!$type || !$id || !in_array($action, ['accepted', 'declined'])) return [];

    $table_map = [
        "organization" => "organization_users",
        "team" => "team_users",
        "project" => "project_users"
    ];

    $table = $table_map[$type] ?? null;
    if (!$table) return [];

    $sql = "UPDATE `$table` SET invite_status = ? WHERE id = ?";
    return executeSQL($sql, [$action, $id]);
}

respondToInvite();