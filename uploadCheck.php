<?php
session_start();
header('Content-type: application/json');
echo json_encode($_SESSION["upload_progress_upload"]);
?>