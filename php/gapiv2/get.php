<?php

include_once dirname(__FILE__) . "/getselect.php";

// Function to handle limit and order by from query string
function getLimitAndOrderBy()
{
    $limit = '';
    $orderBy = '';

    $page = getParam('page', 1);
    $pageSize = getParam('pageSize', 20);
    $order = getParam('order', null);

    if ($page && $pageSize) {
        $offset = ($page - 1) * $pageSize;
        $limit = "LIMIT $offset, $pageSize";
    }

    if ($order) {
        $orderDirection = strtoupper(getParam('orderDirection', "ASC")) === 'DESC' ? 'DESC' : 'ASC';
        $orderBy = "ORDER BY $order $orderDirection";
    }

    return [$limit, $orderBy];
}

function SelectData($config, $id = null)
{
    if (!isset($config['select']) || !$config['select']) {
        die("Select operation not allowed");
    }

    if (isset($config['beforeselect']) && function_exists($config['beforeselect'])) {
        $res = call_user_func($config['beforeselect'], $config, []);
        $config = $res[0];
    }

    $types = "";
    $params = [];

    if (is_string($config['select'])) {
        if (function_exists($config['select'])) {
            return call_user_func($config['select'], $config, $id);
        } else {
            if (!isset($config['where'])) {
                $config['where'] = [];
            }
            $info = buildQuery($config);
            $query = $info['query'];
            $params = $info['params'];
            $rows = executeSQL($query, $params);
        }
    } elseif (is_array($config['select'])) {
        $fields = implode(", ", $config['select']);
        $where = "1=1";
        if (isset($config['where'])) {
            foreach ($config['where'] as $key => $value) {
                $where .= " AND $key = ?";
            }
        }
        if ($id) {
            $where .= " AND " . $config['key'] . " = ?";
        }
        if (!isset($config['orderBy'])) {
            $config['orderBy'] = '';
        }
        if (!isset($config['limit'])) {
            $config['limit'] = '';
        }
        $query = "SELECT $fields FROM " . $config['tablename'] . " WHERE $where " . $config['orderBy'] . " " . $config['limit'];

        $params = [];
        if (isset($config['where']) && count($config['where']) > 0) {
            $params = array_values($config['where']);
            if ($id) {
                $params[] = $id;
            }
        } elseif ($id) {
            $params[] = $id;
        }
        $rows = executeSQL($query, $params);
    }

    if (isset($config['afterselect']) && function_exists($config['afterselect'])) {
        $rows = call_user_func($config['afterselect'], $config, $rows);
    }

    return $rows;
}
