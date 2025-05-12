<?php

function getUserTeams($config)
{
    global $mysqli; // assuming you use global $mysqli
    $id = $config["where"]["user_id"] ?? null;
    if (!$id) return [];

    // Step 1: Get teams the user is in
    $sql = "
        SELECT 
            t.id AS team_id,
            t.organization_id,
            t.name AS team_name,
            t.description,
            t.settings,
            t.created_at,
            t.modified_at
        FROM team_users tu
        JOIN teams t ON tu.team_id = t.id
        WHERE tu.user_id = ?
    ";
    $teams = executeSQL($sql, [$id]);

    if (!$teams) return [];

    $teamIds = array_column($teams, 'team_id');

    // Step 2: Get all team_users for those teams
    $placeholders = implode(',', array_fill(0, count($teamIds), '?'));
    $sql_users = "
        SELECT 
            tu.team_id,
            tu.id,
            tu.user_id,
            tu.email,
            tu.role,
            tu.invite_status,
            tu.settings
        FROM team_users tu
        WHERE tu.team_id IN ($placeholders)
    ";
    $users = executeSQL($sql_users, $teamIds);

    // Step 3: Get all projects for those teams
    $sql_projects = "
        SELECT 
            p.team_id,
            p.id,
            p.name,
            p.description,
            p.settings
        FROM projects p
        WHERE p.team_id IN ($placeholders)
    ";
    $projects = executeSQL($sql_projects, $teamIds);

    // Step 4: Assemble data
    $teamsIndexed = [];
    foreach ($teams as $team) {
        $team['users'] = [];
        $team['projects'] = [];
        $teamsIndexed[$team['team_id']] = $team;
    }

    foreach ($users as $user) {
        $teamsIndexed[$user['team_id']]['users'][] = $user;
    }

    foreach ($projects as $project) {
        $teamsIndexed[$project['team_id']]['projects'][] = $project;
    }

    return array_values($teamsIndexed);
}


function getUserFocus($config)
{
    $user_id = $config["where"]["user_id"] ?? null;
    if (!$user_id) return [];

    $sql = "
        SELECT 
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', t.id,
                        'title', t.title,
                        'description', t.description,
                        'project_id', t.project_id,
                        'feature_id', t.feature_id,
                        'settings', t.settings
                    )
                )
                FROM tasks t
                WHERE t.assigned_to = ? AND t.status = 'Focus'
            ) AS focus_tasks,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', p.id,
                        'name', p.name,
                        'tasks', (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'id', t.id,
                                    'title', t.title,
                                    'description', t.description,
                                    'settings', t.settings
                                )
                            )
                            FROM tasks t
                            WHERE t.project_id = p.id AND t.status = 'Next'
                        )
                    )
                )
                FROM projects p
                WHERE p.team_id IN (
                    SELECT tu.team_id FROM team_users tu WHERE tu.user_id = ?
                )
            ) AS next_tasks_by_project
    ";

    return executeSQL($sql, [$user_id, $user_id], ["JSON" => ["focus_tasks", "next_tasks_by_project"]]);
}

function getUserProjectsWithDetails($config)
{
    $user_id = $config["where"]["user_id"] ?? null;
    if (!$user_id) return [];

    $sql = "
        SELECT 
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', p.id,
                    'name', p.name,
                    'description', p.description,
                    'settings', p.settings,
                    'features', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', f.id,
                                'name', f.name,
                                'description', f.description,
                                'settings', f.settings
                            )
                        )
                        FROM features f WHERE f.project_id = p.id
                    ),
                    'tasks', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', t.id,
                                'title', t.title,
                                'status', t.status,
                                'description', t.description,
                                'task_type', t.task_type,
                                'feature_id', t.feature_id,
                                'assigned_to', t.assigned_to,
                                'settings', t.settings
                            )
                        )
                        FROM tasks t WHERE t.project_id = p.id
                    )
                )
            ) AS projects
        FROM projects p
        WHERE p.team_id IN (
            SELECT tu.team_id FROM team_users tu WHERE tu.user_id = ?
        )
    ";

    return executeSQL($sql, [$user_id], ["JSON" => ["projects"]]);
}

function getUserOrganizations($config)
{
    $user_id = $config["where"]["user_id"] ?? null;
    if (!$user_id) return [];

    $sql = "
        SELECT 
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', o.id,
                    'name', o.name,
                    'description', o.description,
                    'settings', o.settings,
                    'users', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', ou.id,
                                'user_id', ou.user_id,
                                'email', ou.email,
                                'role', ou.role,
                                'invite_status', ou.invite_status,
                                'settings', ou.settings
                            )
                        )
                        FROM organization_users ou
                        WHERE ou.organization_id = o.id
                    ),
                    'teams', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', t.id,
                                'name', t.name,
                                'description', t.description,
                                'settings', t.settings
                            )
                        )
                        FROM teams t
                        WHERE t.organization_id = o.id
                    )
                )
            ) AS organizations
        FROM organizations o
        WHERE o.id IN (
            SELECT organization_id FROM organization_users WHERE user_id = ?
        )
    ";

    return executeSQL($sql, [$user_id], ["JSON" => ["organizations"]]);
}
