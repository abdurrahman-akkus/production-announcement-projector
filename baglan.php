<?php
$host="localhost";
$veritabani = "sinaps";
$kullanici = "root";
$sifre = "Beybo++42";

try{
	$db = new PDO("mysql:host=$host;dbname=$veritabani;charset=utf8",$kullanici,$sifre);
	echo "Bağlantı Başarılı";

}catch(PDOException $error) {
   
   echo $error->getMessage();
}

?>
