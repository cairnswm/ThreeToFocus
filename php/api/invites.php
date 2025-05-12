<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once dirname(__FILE__) . "/../corsheaders.php";
include_once dirname(__FILE__) . "/../gapiv2/dbconn.php";

function getInvites()
{
  $email = $_GET["email"] ?? null;
  if (!$email) return [];

  $sql = "
    SELECT 
      'organization' AS type,
      ou.id,
      ou.organization_id AS type_id,
      JSON_OBJECT(
        'id', o.id,
        'name', o.name,
        'description', o.description
      ) AS entity,
      NULL AS parents
    FROM organization_users ou
    JOIN organizations o ON o.id = ou.organization_id
    WHERE ou.email = ? AND ou.invite_status = 'invited'

    UNION ALL

    SELECT 
      'team' AS type,
      tu.id,
      tu.team_id AS type_id,
      JSON_OBJECT(
        'id', t.id,
        'name', t.name,
        'description', t.description
      ) AS entity,
      JSON_OBJECT(
        'organization', JSON_OBJECT(
          'id', o.id,
          'name', o.name
        )
      ) AS parents
    FROM team_users tu
    JOIN teams t ON t.id = tu.team_id
    JOIN organizations o ON o.id = t.organization_id
    WHERE tu.email = ? AND tu.invite_status = 'invited'

    UNION ALL

    SELECT 
      'project' AS type,
      pu.id,
      pu.project_id AS type_id,
      JSON_OBJECT(
        'id', p.id,
        'name', p.name,
        'description', p.description
      ) AS entity,
      JSON_OBJECT(
        'team', JSON_OBJECT(
          'id', t.id,
          'name', t.name
        ),
        'organization', JSON_OBJECT(
          'id', o.id,
          'name', o.name
        )
      ) AS parents
    FROM project_users pu
    JOIN projects p ON p.id = pu.project_id
    JOIN teams t ON t.id = p.team_id
    JOIN organizations o ON o.id = t.organization_id
    WHERE pu.email = ? AND pu.invite_status = 'invited'
  ";

  return executeSQL($sql, [$email, $email, $email], ["JSON" => ["entity", "parents"]]);
}

$invites = getInvites();

header('Content-Type: application/json');
echo json_encode($invites);
