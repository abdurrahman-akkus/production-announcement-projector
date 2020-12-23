<!DOCTYPE html>
<html lang="tr">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link href="css/bootstrap.css" rel="stylesheet" type="text/css"/>
		<link href="css/all.css" rel="stylesheet" type="text/css"/>
		<link rel="shortcut icon" type="image/svg" href="img/sinapsTVfav.svg" />
		<title>SinapsTV·Beautiful Product Puanları</title>
		<style>
			#altmenu {
				position: relative;
				display: flex;
				justify-content: center;
			}
			#menu_container {
				position: fixed;
				bottom: -1px;
				z-index: 1000;
				background-image: url('img/menu_container.png');
				background-size: 100% 100%;
				padding: .26rem 2rem;
				display: flex;
				min-width: 12.3rem;
			}
			.bant-satiri {
				border-radius:.25rem;
				margin-left: 0px;
				background-color: #6ab97c !important;
			}
			#sonuc_alert {    
				position: fixed;
				bottom: 0;
				right: 50px;
				z-index: 99999;
				height: 200px;
				min-width: 200px;
				display: flex;
				align-items: center;
			}

		</style>
	</head>
	<body>
		<h2 class="text-center">BEAUTIFUL PRODUCT PUANLARI</h2>
		<div class="container-fluid">
			<div class="row">
				<div id="kapsayici" class="offset-md-4 col-md-4">
					<input id="tarih" type="date" class="form-control w-100" onchange="inputlariDoldur($(this).val())">
				</div>
			</div>
		</div>
		<div id="sonuc_alert" style="display: none;"></div>
		<br><br>
		<div id="altmenu">
			<div id="menu_container">
				<div class="m-auto">
					<button class="btn btn-success" style="border-radius: 50%;" onclick="saveData()"><i class="fas fa-check"></i></button>
				</div>
			</div>
		</div>
		<!-- Optional JavaScript -->
		<!-- jQuery first, then Popper.js(Dropdownlar için), then Bootstrap JS -->
		<script src="js/jquery-3.4.0.min.js"></script>
		<script src="js/popper.min.js"></script>
		<script src="js/bootstrap.js"></script>
		<script src="js/bppuanlari.js"></script>
	</body>
</html>