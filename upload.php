<?php error_reporting(0);
if ($_SERVER['REQUEST_METHOD'] == "POST") {
$data = $_POST['veri']; //post edilen dosya verisi
$file_name = $_POST['dosyaAdi'];
if (isset($data)){
	$dir = '/opt/sinapsTV/uploads/'; //dosyalarin kaydedileceği klasor yolu
	$size_limit = 50000000; //dosya boyutu en fazla kac KB boyutunda olmali
	$extension = explode('/',explode(';',$data)[0])[1]; //dosya uzantisi
	if ($extension == 'jpeg' || $extension == 'jpg' || $extension == 'png' || $extension == 'gif' || $extension == 'mp4'){ //dosya uzantisi jped, png veya gif olmalı
		$image = file_get_contents($data); //veriyi oku
		if (strlen($image) < $size_limit){ //dosya boyutu uygunsa
			$file_name = $dir.$file_name; //
			$create_file = touch($file_name); //belirtilen klasöre belirtilen isimde icerigi bos bir dosya oluştur
			if ($create_file){ //dosya olusturma basarili ise
				$create_image = file_put_contents($file_name,$image); //olusturulan dosyanin içerigine resim verilerini isle, ekle
				if ($create_image){ //eklendiyse
					$result = 'success';
				}else{
					$result = 'error';
				}
			}else{
				$result = '{ERROR} Dosya oluşturulamadı';
			}
		}else{
			$result = '{ERROR} Dosya boyutu '.$size_limit.' byte\'dan küçük olmalı';
		}
	}else{
		$result = '{ERROR} Dosya uzantısı uygun değil';
	}
}else{
	$result = 'POST sırasında bir hata meydana geldi';
}
echo json_encode($result); //json formatında veriyi geri gönder
}

if ($_SERVER['REQUEST_METHOD'] == "GET") {
	$param = $_GET['i'];
	$dir = '/opt/sinapsTV/uploads/'; //dosyalarin kaydedileceği klasor yolu
	$file_out = $dir.$param; // The image to return

if (file_exists($file_out)) {

   $image_info = getimagesize($file_out);

   //Set the content-type header as appropriate
   header('Content-Type: ' . $image_info['mime']);

   //Set the content-length header
   header('Content-Length: ' . filesize($file_out));

   //Write the image bytes to the client
   readfile($file_out);
}
else { // Image file not found

    header($_SERVER["SERVER_PROTOCOL"] . " 404 Not Found");

}
}
?>