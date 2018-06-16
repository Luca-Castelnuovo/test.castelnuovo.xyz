<?php require_once ($_SERVER['DOCUMENT_ROOT'] . "/functions.php"); login(); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta content="width=device-width,initial-scale=1,shrink-to-fit=no" name="viewport">

    <link href=https://lucacastelnuovo.nl/images/favicon.ico rel="shortcut icon">
    <title>
        <?= $_SESSION['user_name'] ?>
    </title>

    <link as="style" href="//fonts.googleapis.com/css?family=Open+Sans:400,700" onload='this.rel="stylesheet"' rel="preload">
    <link as="style" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" onload='this.rel="stylesheet"' rel="preload">
    <link as="style" href="/css/style.css" onload='this.rel="stylesheet"' rel="preload">
</head>

<body>
    <div class="wrapper">
        <div class="login">
            <h2>Your Projects:</h2>
            <?php ($_GET['project']) ? $_GET['project'] : null; my_projects($project); ?>
            <button id="submit"><i class="spinner"></i> <span class="state">Log in</span></button>
        </div>
    </div>

</body>

</html>
