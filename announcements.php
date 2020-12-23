<?php 
if ($_SERVER['REQUEST_METHOD'] == "POST") {

	$posts = file_get_contents('php://input');	
	$fp = fopen('/opt/sinapsTV/announcements/'.date('Y-m-d').'.json', 'w') or die("Unable to open file!"); // Dosya yoksa oluşturur
	fwrite($fp, $posts); // İçeriği dosyaya yazar
	fclose($fp);

}
if ($_SERVER['REQUEST_METHOD'] == "GET") {

	$date = $_GET['date'];
	$dir = '/opt/sinapsTV/announcements/'; //dosyalarin kaydedileceği klasor yolu
	$file_out = $dir.$date.'.json'; // The image to return
	echo file_get_contents($file_out, FILE_USE_INCLUDE_PATH); // Dosyanın tamamını okumak için en uygun yöntem bu. değilse fread falan kullanılacak.

}
if ($_SERVER['REQUEST_METHOD'] == "PUT") {
	$posts = json_decode(trim(file_get_contents('php://input')), true);	
	$fpOld = file_get_contents('/opt/sinapsTV/announcements/'.$posts["date"].'.json', FILE_USE_INCLUDE_PATH); 
	
	$fp = fopen('/opt/sinapsTV/announcements/'.date('Y-m-d').'.json', 'w') or die("Unable to open file!"); // Dosya yoksa oluşturur
	fwrite($fp, $fpOld); // İçeriği dosyaya yazar
	fclose($fp);
	echo "Aktarma Başarılı";
}

?> 