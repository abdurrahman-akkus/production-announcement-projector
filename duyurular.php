<?php
session_start();
?>
<!DOCTYPE html>
<html>
	<head>
		<title>SinapsTV·Duyurular</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link href="css/bootstrap.css" rel="stylesheet" type="text/css"/>
		<link href="css/all.css" rel="stylesheet" type="text/css"/>
		<link rel="stylesheet" href="css/reset.min.css">
		<link rel="stylesheet" href="css/trumbowyg.min.css">
		<link rel="stylesheet" href="css/trumbowyg.colors.min.css">
		<link rel="stylesheet" href="css/duyurular.css">
		<link rel="shortcut icon" type="image/svg" href="img/sinapsTVfav.svg" />
	</head>
	<body>
		<h2 class="text-center">DUYURULAR</h2>
		<div class="container-fluid">
			<div class="row">
				<h3 class="col-lg-6 text-center">Veri Girişi</h3>
				<h3 class="col-lg-6 text-center">Slaytlar</h3>
				<div class="col-lg-6" style="overflow: scroll;max-height: 80vh;">
					<div class="row">
						<div class="col-10">
							<ul class="nav nav-tabs">
								<li class="nav-item">
									<a href="#text" class="nav-link active" data-toggle="tab"><i class="fas fa-paragraph"></i></a>
								</li>
								<li class="nav-item">
									<a href="#image" class="nav-link" data-toggle="tab"><i class="fas fa-image"></i></a>
								</li>
								<li class="nav-item">
									<a href="#video" class="nav-link" data-toggle="tab"><i class="fas fa-video"></i></a>
								</li>
								<li class="nav-item">
									<a href="#external" class="nav-link" data-toggle="tab"><i class="fab fa-youtube"></i></a>
								</li>
							</ul>
							<div class="tab-content">
								<div id="text" class="tab-pane fade show active">
									<div class="row justify-content-around mt-1">
										<label for="text_duration" class="mt-2">Süre</label>
										<input type="number" id="text_duration" class="w-25 duration" value="10">
										<label for="bg" class="mt-2">Renk</label>
										<input type="text" id="bg" class="jscolor form-control w-25">
									</div>
									<textarea id="text_editor" class="trumbowyg"></textarea>
								</div>
								<div id="image" class="tab-pane fade">
									<div class="row justify-content-around mt-1">
										<label for="image_duration" class="mt-2">Süre</label>
										<input type="number" id="image_duration" class="w-25 duration" value="10">
										<label for="image_bg" class="mt-2">Renk</label>
										<input type="text" id="image_bg" class="jscolor form-control w-25">
									</div>
									<div class="input-group m-1 pr-3">
										<div class="custom-file">
											<input type="file" class="custom-file-input" id="image_uploader" onchange="changeLabel($(this),'Dosyayı Yükleyiniz =>','bg-warning')" accept=".png, .jpeg, .gif, .jpg">
											<label class="custom-file-label" for="image_uploader">Dosya Seçiniz</label>
										</div>
										<div class="input-group-append">
											<button class="input-group-text" onclick="uploadSetter($(this), 'image')">Yükle</button>
										</div>
									</div>
									<textarea id="image_text_editor" class="trumbowyg"></textarea>
								</div>
								<div id="video" class="tab-pane fade">
									<div class="row justify-content-around mt-1">
										<label for="video_duration" class="mt-2">Süre</label>
										<input type="number" id="video_duration" class="w-25 duration" value="10">
										<label for="video_bg" class="mt-2">Renk</label>
										<input type="text" id="video_bg" class="jscolor form-control w-25">
									</div>
									<div class="input-group my-1">
										<div class="custom-file">
											<input type="file" class="custom-file-input" id="video_uploader" onchange="changeLabel($(this),'Dosyayı Yükleyiniz =>','bg-warning')" accept=".mp4">
											<label class="custom-file-label" for="video_uploader">Dosya Seçiniz</label>
										</div>
										<div class="input-group-append">
											<button class="input-group-text" onclick="uploadSetter($(this), 'video')">Yükle</button>
										</div>
									</div>
									<textarea id="video_explaination" class="form-control" style="width: 100%;" placeholder="Açıklama"></textarea>
									<canvas hidden id="video_thumbnail" style="width: 100%"></canvas>
									<img id="video_thumbnail_image" ssrc="" alt="" class="w-100">
								</div>
								<div id="external" class="tab-pane fade">
									<div class="row justify-content-around mt-1">
										<label for="external_duration" class="mt-2">Süre</label>
										<input type="number" id="external_duration" class="w-25 duration" value="10">
										<label for="external_bg" class="mt-2">Renk</label>
										<input type="text" id="external_bg" class="jscolor form-control w-25">
									</div>
									<input type="url" id="external_link" class="form-control  my-1" placeholder="Bağlantı Adresi">
									<textarea id="external_explaination" class="form-control" style="width: 100%;" placeholder="Açıklama"></textarea>
									<img id="external_thumbnail_image" ssrc="" alt="" class="w-100">
								</div>
							</div>
						</div> 
						<div class="col-2">
							<div class="upside-down" style="background:#6c757d;padding-top:1rem; height: 32vh;overflow:hidden">
								<select id="line_no" multiple="" style="width: 100%;height:100%;background:gainsboro;color:#555;border:1px solid lightgrey;">
									<option disabled="">Bant</option>
									<option value="G" class="" selected="">Genel</option>
									<optgroup label="&nbsp;Yeni" onmousedown="selectAllChildren($(this))">
										<option value="A01">A01</option>
										<option value="A02">A02</option>
										<option value="A03">A03</option>
										<option value="A04">A04</option>
										<option value="A05">A05</option>
										<option value="A06">A06</option>
										<option value="A07">A07</option>
										<option value="A08">A08</option>
										<option value="A09">A09</option>
										<option value="A10">A10</option>
										<option value="A11">A11</option>
										<option value="A12">A12</option>
										<option value="A13">A13</option>
										<option value="A14">A14</option>
										<option value="A15">A15</option>
										<option value="A16">A16</option>
									</optgroup>
									<optgroup label="&nbsp;Eski" onmousedown="selectAllChildren($(this))">
										<option value="B01">B01</option>
										<option value="B02">B02</option>
										<option value="B03">B03</option>
										<option value="B04">B04</option>
										<option value="B05">B05</option>
										<option value="B06">B06</option>
										<option value="B07">B07</option>
										<option value="B08">B08</option>
										<option value="B09">B09</option>
									</optgroup>
								</select>
							</div>
							<button onclick="addNewChildSlides()" class="btn btn-primary w-100 my-0" style="border-radius: 0 !important;"><i class="fas fa-chevron-right"></i></button>
							<button class="btn btn-success w-100" style="margin-bottom: 2px;border-radius: 0 !important;" data-toggle="modal" data-target="#sync"><i class="fas fa-sync"></i></button>
							<div class="downside-up" style="background:#6c757d;padding-bottom:1rem; height: 32vh;overflow:hidden">
								<select multiple="" style="width: 100%;height: 100%;background:gainsboro;color:#555;border:1px solid lightgrey;" id="periods">
									<option disabled="">Dönem</option>
									<optgroup label="&nbsp;ÖÖ" onmousedown="selectAllChildren($(this))">
										<option value="08:00" selected>08:00</option>
										<option value="09:00">09:00</option>
										<option value="10:00">10:00</option>
										<option value="11:00">11:00</option>
										<option value="12:00">12:00</option>
									</optgroup>
									<optgroup label="&nbsp;ÖS" onmousedown="selectAllChildren($(this))">
										<option value="13:00">13:00</option>
										<option value="14:00">14:00</option>
										<option value="15:00">15:00</option>
										<option value="16:00">16:00</option>
										<option value="17:00">17:00</option>
										<option value="18:00">18:00</option>
									</optgroup>
									<optgroup label="&nbsp;Ek Mesai" onmousedown="selectAllChildren($(this))">
										<option value="19:00">19:00</option>
										<option value="20:00">20:00</option>
										<option value="21:00">21:00</option>
										<option value="22:00">22:00</option>
										<option value="23:00">23:00</option>
										<option value="24:00">24:00</option>
										<option value="00:00">00:00</option>
										<option value="01:00">01:00</option>
										<option value="02:00">02:00</option>
										<option value="03:00">03:00</option>
										<option value="04:00">04:00</option>
										<option value="05:00">05:00</option>
										<option value="06:00">06:00</option>
										<option value="07:00">07:00</option>
									</optgroup>
								</select>
							</div>
							
						</div>
					</div>
				</div>
				<div id="slides_container" class="col-lg-6" style="overflow: scroll;max-height: 80vh;">
					<ul id="slides" class="slides">
						
					</ul>
				</div>
			</div>
		</div>

		<!-- Modal -->
		<div class="modal fade" id="sync" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
		  <div class="modal-dialog" role="document">
		    <div class="modal-content">
		      <div class="modal-header">
		        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
		        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
		          <span aria-hidden="true">&times;</span>
		        </button>
		      </div>
		      <div class="modal-body">
		        <input type="date" id="tarih" class="form-control" pattern="YYYY-mm-dd">
		      </div>
		      <div class="modal-footer">
		        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
		        <button type="button" class="btn btn-primary" onclick="syncAll($(this))">Senkronize Et</button>
		      </div>
		    </div>
		  </div>
		</div>
		<!-- Optional JavaScript -->
		<!-- jQuery first, then Popper.js(Dropdownlar için), then Bootstrap JS -->
		<script src="js/jquery-3.4.0.min.js"></script>
		<script src="js/popper.min.js"></script>
		<script src="js/bootstrap.js"></script>
		<script src="js/trumbowyg.min.js"></script>
		<script src="js/trumbowyg.colors.min.js"></script>
		<script type="text/javascript" src="js/tr.min.js"></script>
		<script src="js/jscolor.js"></script>
		<script src="js/util.js"></script>
		<script src="js/duyurular.js"></script>
	</body>
</html>