let BEYBOWS_URL = "http://120.120.16.148:8080/beyboWS/";

tarihAyarla();
inputlariOlustur();

function inputlariOlustur() {
	bantlariAl().then((bantNolari) => {
		for (bant of bantNolari) {
			$('#kapsayici').append(
				'<div class="w-100 row mt-1 p-1 bant-satiri">' +
				'<label for="' + bant + '" class="col text-center" style="align-self: end;">' + bant + '</label>' +
				'<input id="' + bant + '" type="number" class="col form-control deger" step="0.01" min="0" max="5">' +
				'</div>');
		}
		$(".deger").focus(function() {
			$(this).select();
		});
		inputlariDoldur();
	});
}

function inputlariDoldur(tarih) {
	tarih = (tarih === undefined) ? $('#tarih').val() : tarih;
	bpGetir(tarih).then((bpler) => {
		$('.deger').val("");
		let bantlar = Object.keys(bpler);
		for (bant of bantlar) {
			$("#" + bant).val(bpler[bant]);
		}
	});
}

function bantlariAl() {
	return new Promise((resolve, reject) => {
		let bantNolari = [];
		$.ajax({
				url: BEYBOWS_URL + "bantlar",
				type: "GET"
			})
			.done(function(response) {
				for (r of response) {
					bantNolari.push(r.bantNo);
				}
				console.log("success");
			})
			.fail(function() {
				console.log("error");
				resolve(bantNolari);
			})
			.always(function() {
				console.log("complete");
				resolve(bantNolari);
			});
	});
}

function tarihAyarla(argument) {
	Date.prototype.toDateInputValue = (function() {
		var local = new Date(this);
		local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
		return local.toJSON().slice(0, 10);
	});
	$('input[type=date]').val(new Date().toDateInputValue());
}

function oncekiHaftayiGetir(tarih) {
	tarih = new Date(tarih);
	let year = tarih.getFullYear();
	let onejan = new Date(tarih.getFullYear(), 0, 1);
	let week = Math.ceil((((tarih.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() - 1) / 7);
	week--;
	if (week != 0)
		return year + "_" + week;
	else
		return (year - 1) + "_52"; // yıl bir eksiye düşer, hafta 52 olur
}

function bpGetir(tarih) {
	return new Promise((resolve, reject) => {
		fetch('bpcrud.php?date=' + oncekiHaftayiGetir(tarih))
			.then(res => res.json())
			.then((out) => {
				let bpler;
				if (out == "")
					bpler = {};
				else
					bpler = out;
				resolve(bpler);
			}).catch(() => {
				bpler = {};
				resolve(bpler);
			});
	})
}

function saveData() {
	let invalidMi = false;
	let data = {};
	let tarih = $('#tarih').val();
	$('.deger').each(function(index, el) {
		if (!el.checkValidity()) {
			el.reportValidity();
			invalidMi = true;
		}
		data[el.id] = el.value;
	});
	if (invalidMi) {
		alert("Geçersiz Girişleri Kontrol Ediniz!");
		return;
	}
	console.log(data);
	$.ajax({
			url: 'bpcrud.php',
			type: 'POST',
			data: {
				"data": JSON.stringify(data),
				"date": oncekiHaftayiGetir(tarih)
			}
		})
		.done(function() {
			$("#sonuc_alert").removeClass('alert-danger').addClass('alert').addClass('alert-success').show('fast', function() {});
			$("#sonuc_alert").html('<strong>Başarılı!</strong> İşlem Tamamalandı! &nbsp;');
			console.log("success");
		})
		.fail(function() {
			$("#sonuc_alert").removeClass('alert-success').addClass('alert').addClass('alert-danger').show('fast', function() {});
    		$("#sonuc_alert").html('<strong>HATA!</strong> Bir Hata Gerçekleşti!&nbsp');
			console.log("error");
		})
		.always(function() {
			setTimeout(function() {
				$("#sonuc_alert").hide('slow', function() {});
			}, 3000);
			console.log("complete");
		});
}