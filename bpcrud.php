<?php 
if ($_SERVER['REQUEST_METHOD'] == "POST") {

	$data =  $_POST['data'];//file_get_contents('php://input');	
	$date =  $_POST['date'];//file_get_contents('php://input');	
	$fp = fopen('/opt/sinapsTV/bp/'.$date.'.json', 'w') or die("Unable to open file!"); // Dosya yoksa oluşturur
	fwrite($fp, $data); // İçeriği dosyaya yazar
	fclose($fp);
	echo "success";

}

if ($_SERVER['REQUEST_METHOD'] == "GET") {

	$date = $_GET['date'];
	$dir = '/opt/sinapsTV/bp/'; //dosyalarin kaydedileceği klasor yolu
	$file_out = $dir.$date.'.json'; // The image to return
	echo file_get_contents($file_out, FILE_USE_INCLUDE_PATH); 

}

?> 