<?php

function login($access_token) {
    try {
        $user = api_get_user($access_token);
    } catch (Exception $error) {
        response(false, $error->getMessage());
    }

    $_SESSION['logged_in'] = true;
    $_SESSION['ip'] = $_SERVER['REMOTE_ADDR'];
    $_SESSION['access_token'] = $access_token;
    $_SESSION['id'] = $user['id'];
    $_SESSION['username'] = $user['username'];

    $user_db = sql_select('users', 'username', "user_id='{$user['id']}'", true);

    if (empty($user_db['username'])) {
        // insert user in db
        //     user_id and username
        // new directory
        //     /users/USERNAME
    }

    redirect('/home', 'You are logged in');
}


function loggedin()
{
    try {
        api_get_token($_SESSION['access_token']);
    } catch (Exception $error) {
        // redirect('/?reset', 'Please login');
        redirect('/?reset', $error);
    }

    if ((!$_SESSION['logged_in']) || ($_SESSION['ip'] != $_SERVER['REMOTE_ADDR']) || (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 1800))) {
        redirect("/?reset", 'Please login');
    } else {
        $_SESSION['LAST_ACTIVITY'] = time();
    }
}


function reset_session()
{
    if (isset($_SESSION['alert'])) {
        $alert = $_SESSION['alert'];
    }

    session_destroy();
    session_start();

    redirect('/', $alert);
}
