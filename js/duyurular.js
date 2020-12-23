let selectedSlide;
let announcement = {
	createLocalData: (data) => {
		localStorage.setItem('announcements', data);
	},

	add2LocalData: (line, data) => {
		let localData = announcement.getLocalData();
		if (localData == " " || localData == "" || localData === undefined || localData === null)
			localData = JSON.parse("{}");
		else
			localData = JSON.parse(announcement.getLocalData());

		if (localData[line] === undefined)
			localData[line] = [data];
		else
			localData[line].push(data);

		announcement.createLocalData(JSON.stringify(localData));
	},

	saveData: () => {
		$.ajax({
				url: 'announcements.php',
				type: 'POST',
				contentType: "application/json; charset=utf-8",
				data: announcement.getLocalData()
			})
			.done(function() {
				console.log("success");
			})
			.fail(function() {
				console.log("error");
			})
			.always(function() {
				console.log("complete");
			});

	},

	deleteData: ($parent, id) => {
		let parent = $parent.find('.line-no').text();
		let localData = JSON.parse(announcement.getLocalData());
		let arr = localData[parent];
		var index = arr.findIndex(function(o) {
			return o.id === id;
		})
		if (index !== -1) arr.splice(index, 1);
		if (arr.length == 0) {
			delete localData[parent];
			$parent.remove();

		}
		announcement.createLocalData(JSON.stringify(localData));
		announcement.saveData();
	},

	getAnnouncementData: (ilkMi = false) => {
		$.ajax({
				url: 'announcements.php?date=' + bugun("-", true),
				type: 'GET'
			})
			.done(function(data) {
				announcement.createLocalData(data);
				if (ilkMi) data2DOM();
				console.log("success");
			})
			.fail(function() {
				console.log("error");
			})
			.always(function() {
				console.log("complete");
			});

	},

	getLocalData: () => {
		return localStorage.getItem('announcements');
	},

	getLocalDataByLine: (line) => {
		// datadan line bilgisi parse edilerek geri döndürülür
	}
}

announcement.getAnnouncementData(true);

function data2DOM() {
	/*let announcements = announcements.getLocalData();
	let announcements = Object.keys(announcements)
		.sort().reduce(function(Obj, key) {
			Obj[key] = announcements[key];
			return Obj;
		}, {});*/

	let localDataJSON = announcement.getLocalData();
	if (localDataJSON === null ||
		localDataJSON === undefined || localDataJSON == " " ||
		localDataJSON == "")
		return;

	let localData = JSON.parse(localDataJSON); // local değilse formdan veri alınır
	let lines = Object.keys(localData);
	for (line of lines) {
		//if (isLocal) // local ise her lin eiçin yeniden bilgi çekilir.
		data = localData[line];

		$('#slides').append(generateParentSlide(line));

		for (datum of data) {

			let childSlide = generateChildSlide(datum, line);
			$('#' + line + '_ul').append(childSlide.slide);
			//window.location.hash = '#' + childSlide.uuid; // En alta gider
			$('#' + childSlide.uuid + ' [data-toggle="popover"]').popover({
				placement: 'top'
			}).click(function(event) {
				setTimeout(function() {
					$(event.target).popover('hide');
				}, 2000);
			});
		}
		//formReset();
	}
}

$.trumbowyg.svgPath = 'img/icons.svg';
formReset();
$('.trumbowyg').trumbowyg({
	lang: 'tr',
	btns: [
		['undo', 'redo'], // Only supported in Blink browsers
		['formatting'],
		['strong', 'em', 'del'],
		['superscript', 'subscript'],
		['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
		['unorderedList', 'orderedList'],
		['horizontalRule'],
		['removeformat'],
		['fullscreen'],
		['foreColor', 'backColor']
	]
});

function allowDrop(ev) {
	ev.preventDefault();
}

function drag(ev) {
	let line = $(ev.target).parents('.parent-slide').find('.line-no').text();
	let selectedSlideId = ev.target.id;

	let localDataJSON = announcement.getLocalData();
	let localData = JSON.parse(localDataJSON);
	let dataArr = localData[line];
	let selectedSlideIndex = dataArr.findIndex(function(o) {
		return o.id === selectedSlideId;
	});
	let selectedSlide = dataArr[selectedSlideIndex];
	localData[line].splice(selectedSlideIndex, 1);

	ev.dataTransfer.setData("selectedSlideId", selectedSlideId);
	ev.dataTransfer.setData("selectedSlide", JSON.stringify(selectedSlide));
	ev.dataTransfer.setData("selectedSlideIndex", selectedSlideIndex);
	ev.dataTransfer.setData("line", line);

	announcement.createLocalData(JSON.stringify(localData));
}

function drop(ev) {
	ev.preventDefault();
	ev.stopPropagation();
	let selectedSlideId = ev.dataTransfer.getData("selectedSlideId");
	let selectedSlide = JSON.parse(ev.dataTransfer.getData("selectedSlide"));
	let line = ev.dataTransfer.getData("line");

	let dragging = $('#' + selectedSlideId);

	let current = $(ev.target);
	let targetChildSlide = current.parents("li.child-slide");
	let targetChildSlideId = targetChildSlide.attr('id');
	let targetParentSlide = current.parents("li.parent-slide");
	let targetLine = current.parents("li.parent-slide").find('.line-no').text();
	let targetSlideIndex = undefined;
	// DOM
	if (targetChildSlide.length > 0) { // targetChildSlide içinde isek sadece yer değişir
		targetChildSlide.after(dragging);
	} else if (targetParentSlide.length > 0) {
		targetSlideIndex = targetParentSlide.find('.child-slide').length - 1; //Sona ekleme yapması için
		if (targetParentSlide.find('ul').length > 0) { // targetParentSlide altında ul varsa ona eklenir
			targetParentSlide.find('ul').append(dragging);
		} else { // targetParentSlide altında ul yoksa ul oluşturulur ona eklenir
			targetParentSlide.append('<ul></ul>');
			targetParentSlide.find('ul').append(dragging);
		}
	}

	// JSON
	let localDataJSON = announcement.getLocalData();
	let localData = JSON.parse(localDataJSON);
	let dataArr = localData[targetLine];
	targetSlideIndex !== undefined ? targetSlideIndex : targetSlideIndex = dataArr.findIndex(function(o) {
		return o.id === targetChildSlideId;
	});
	console.log(selectedSlide);
	dataArr.splice(targetSlideIndex + 1, 0, selectedSlide); // seçili slayt buraya eklendi
	localData[targetLine] = dataArr;
	if ($('#' + line + "_0 li.child-slide").length == 0) {
		delete localData[line];
		$('#' + line + "_0").remove();
	}
	announcement.createLocalData(JSON.stringify(localData));
	announcement.saveData();
}

function cloneChildSlide(cloneButton) {
	let templateSlide = cloneButton.parents('.child-slide');
	let cloneSlide = templateSlide.clone();
	let cloneSlideId = create_UUID();
	cloneSlide.attr('id', cloneSlideId);
	cloneSlide.find('[data-toggle="popover"]').popover({
		placement: 'top'
	}).click(function(event) {
		setTimeout(function() {
			$(event.target).popover('hide');
		}, 2000);
	});
	templateSlide.after(cloneSlide);
	event.stopPropagation();

	let templateSlideId = cloneButton.parents('.child-slide').attr('id');
	let line = cloneButton.parents('.parent-slide').find('.line-no').text();
	let localDataJSON = announcement.getLocalData();
	let localData = JSON.parse(localDataJSON);
	let dataArr = localData[line];
	let templateSlideIndex = dataArr.findIndex(function(o) {
		return o.id === templateSlideId;
	});
	console.log(localData);
	let cloneObj = JSON.parse(JSON.stringify(dataArr[templateSlideIndex])); // Nesne kopyalamak için kullanılıyor bu
	cloneObj.id = cloneSlideId;
	dataArr.splice(templateSlideIndex + 1, 0, cloneObj); // klon slayt buraya eklendi
	localData[line] = dataArr;
	announcement.createLocalData(JSON.stringify(localData));
	announcement.saveData();
	console.log(localData);
}

function deleteChildSlide(deleteButton) {
	let $childSlide = deleteButton.parents('.child-slide');
	let $parentSlide = deleteButton.parents('.parent-slide');
	announcement.deleteData($parentSlide, $childSlide.attr('id'));
	$childSlide.remove();
	event.stopPropagation();
}

function childSlideToForm(slide) {
	let line = slide.parents('.parent-slide').find('.line-no').text();
	selectedSlide = slide.attr('id');
	setSlideData(line, selectedSlide);
}

function create_UUID() {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (dt + Math.random() * 16) % 16 | 0;
		dt = Math.floor(dt / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}

function formReset() {
	$('.trumbowyg').val('');
	$('.duration').val(10);
	$('.jscolor').val('F0F8FF');
	$('.jscolor').css({
		"background-color": "#F0F8FF",
		"color": "rgb(0, 0, 0)"
	});
	$('#text_editor').trumbowyg('empty');
	$('#image_text_editor').trumbowyg('empty');
	$('#image_uploader #video_explaination').val('');
	changeLabel($('#image_uploader'), 'Dosya Seçiniz', "");
}

function selectAllChildren(parent) {
	if (event.target.localName != "optgroup") return;
	event.stopPropagation();
	parent.find('option').prop('selected', 'true');
}

function addNewChildSlides(isLocal = false) {
	if (inValid()) return;
	let lines = $('#line_no').val();
	let data = isLocal ? announcement.getAllLocalData() : getSlideData(); // local değilse formdan veri alınır
	for (line of lines) {
		if (lines.length > 0) // local ise her lin eiçin yeniden bilgi çekilir.
			data.id = create_UUID();

		announcement.add2LocalData(line, data);

		if (!isParentSlideGenerated(line)) {
			/*let setParent = new Promise(
			function(resolve, reject) {
			$('#slides').append(generateParentSlide(line));
			resolve();
			}
			);
			setParent.then(()=>{$('#' + line + "_0 ul").append(generateChildSlide(isLocal, line));});*/
			$('#slides').append(generateParentSlide(line));
		}
		let childSlide = generateChildSlide(data, line);
		$('#' + line + '_ul').append(childSlide.slide);
		window.location.hash = '#' + childSlide.uuid; // En alta gider
		$('#' + childSlide.uuid + ' [data-toggle="popover"]').popover({
			placement: 'top'
		}).click(function(event) {
			setTimeout(function() {
				$(event.target).popover('hide');
			}, 2000);
		});
		//formReset();
	}

	announcement.saveData();
}

function generateParentSlide(line) {
	return '<li class="slide parent-slide" id="' + line +
		'_0" ondrop="drop(event)" ondragover="allowDrop(event)"><div><span class="line-no">' + line +
		'</span></div><ul id="' + line + '_ul" /></li>';
}

function generateChildSlide(data, line) {
	let child = '<li class="slide child-slide" id="' + data.id + '" onclick="//childSlideToForm($(this))" ' +
		'draggable="true" ondragstart="drag(event)" ondrop="drop(event)" ondragover="allowDrop(event)">' +
		generateSlideIndicator(data) +
		'<span class="toolbox">' +
		'<button class="btn btn-sm btn-secondary" onclick="cloneChildSlide($(this))"><i class="fas fa-clone"></i></button>' +
		'<button class="btn btn-sm btn-secondary" onclick="deleteChildSlide($(this))"><i class="fas fa-trash"></i></button>' +
		'</span></div></span>' +
		'<span class="slide-explaination">';
	if (data.uText !== undefined) {
		child += "<span class='text'>" + data.uText + "</span>";
	}
	if (data.explaination !== undefined) {
		child += "<span class='explaination'>" + data.explaination + "</span>";
	}
	child += '<span class="ek-bilgiler">' +
		'<span class="duration badge badge-primary mx-1">' + data.duration + '</span>' +
		'<span class="periods badge badge-info mx-1" title="' + data.periods +
		'" data-toggle="popover">' + data.editedPeriods + '</span></span></span>'
	child += '<span></span></li>';
	return {
		slide: child,
		uuid: data.id
	};
}

function isParentSlideGenerated(line) {
	return $('#slides #' + line + "_0").length > 0 ? true : false;
}

function getSlideData() {
	let tur = $('.tab-pane.active').attr('id');
	switch (tur) {
		case "text":
			return getTextSlideData();
		case "image":
			return getImageSlideData();
		case "video":
			return getVideoSlideData();
		case "external":
			return getExternalSlideData();
		default:
			break;
	}
	return "";
}

function getTextSlideData() {
	return {
		id: create_UUID(),
		type: "text",
		text: $('#text_editor').val(),
		uText: $('#text_editor').siblings('.trumbowyg-editor').text(),
		duration: $('#text_duration').val(),
		bg: $('#bg').val(),
		periods: $('#periods').val().toString().replace(/,/g, ' | '),
		editedPeriods: utils.editPeriods($('#periods').val())
	}
}

function getImageSlideData() {
	return {
		id: create_UUID(),
		type: "image",
		text: $('#image_text_editor').val(),
		uText: $('#image_text_editor').siblings('.trumbowyg-editor').text(),
		duration: $('#image_duration').val(),
		bg: $('#image_bg').val(),
		periods: $('#periods').val().toString().replace(/,/g, ' | '),
		editedPeriods: utils.editPeriods($('#periods').val()),
		link: "upload.php?i=" + encodeURIComponent($('#image_uploader').siblings('label').text())
	}
}

function getVideoSlideData() {
	return {
		id: create_UUID(),
		type: "video",
		vidType: "video/mp4",
		explaination: $('#video_explaination').val(),
		duration: $('#video_duration').val(),
		bg: $('#video_bg').val(),
		periods: $('#periods').val().toString().replace(/,/g, ' | '),
		editedPeriods: utils.editPeriods($('#periods').val()),
		link: "upload.php?i=" + encodeURIComponent($('#video_uploader').siblings('label').text()),
		thumbnail: $('#video_thumbnail_image').attr('src')
	}
}

function getExternalSlideData() {
	return {
		id: create_UUID(),
		type: "external",
		explaination: $('#external_explaination').val(),
		duration: $('#external_duration').val(),
		bg: $('#external_bg').val(),
		periods: $('#periods').val().toString().replace(/,/g, ' | '),
		editedPeriods: utils.editPeriods($('#periods').val()),
		link: generateExternalLink($('#external_link').val())
	}
}

function generateExternalLink(url) {
	if (url.includes("youtube.com") || url.includes("youtu.be")) {
		return "https://www.youtube.com/embed/" +
			utils.parseYoutubeUrl(url) + "?autoplay=1&mute=1";
	}
	return url;
}

function setSlideData(line, slideId) {
	let localDataJSON = announcement.getLocalData();
	let localData = JSON.parse(localDataJSON);
	let dataArr = localData[line];
	var index = dataArr.findIndex(function(o) {
		return o.id === slideId;
	});
	let data = dataArr[index];
	switch (data.type) {
		case "text":
			return setTextSlideData(data);
		case "image":
			return setImageSlideData(data);
		case "video":
			return setVideoSlideData(data);
		case "external":
			return setExternalSlideData(data);
		default:
			break;
	}
	istenilenTabiAc(tur);
}

function setTextSlideData(data) {
	selectedSlideId = data.id;
	$('#text_editor').val(data.text);
	$('#text_editor').siblings('.trumbowyg-editor').text(data.uText);
	$('#text_duration').val(data.duration);
	$('#bg').val(data.bg);
	$('#periods').val(periods);

}

function setImageSlideData(data) {
	return {
		id: create_UUID(),
		type: "image",
		text: $('#image_text_editor').val(),
		uText: $('#image_text_editor').siblings('.trumbowyg-editor').text(),
		duration: $('#image_duration').val(),
		bg: $('#image_bg').val(),
		periods: $('#periods').val().toString().replace(/,/g, ' | '),
		editedPeriods: utils.editPeriods($('#periods').val()),
		link: "upload.php?i=" + encodeURIComponent($('#image_uploader').siblings('label').text())
	}
}

function setVideoSlideData(data) {
	return {
		id: create_UUID(),
		type: "video",
		vidType: "video/mp4",
		explaination: $('#video_explaination').val(),
		duration: $('#video_duration').val(),
		bg: $('#video_bg').val(),
		periods: $('#periods').val().toString().replace(/,/g, ' | '),
		editedPeriods: utils.editPeriods($('#periods').val()),
		link: "upload.php?i=" + encodeURIComponent($('#video_uploader').siblings('label').text())
	}
}

function setExternalSlideData(data) {
	return {
		id: create_UUID(),
		type: "external",
		explaination: $('#external_explaination').val(),
		duration: $('#external_duration').val(),
		bg: $('#external_bg').val(),
		periods: $('#periods').val().toString().replace(/,/g, ' | '),
		editedPeriods: utils.editPeriods($('#periods').val()),
		link: $('#external_link').val() + "?autoplay=1&mute=1"
	}
}

function generateSlideIndicator(data) {
	let tur = data.type === undefined ? $('.tab-pane.active').attr('id') : data.type;
	let indicator = '<span class="slide-indicator">';
	let text = "";
	switch (tur) {
		case "text":
			indicator = '<span class="slide-indicator" style="background:#' + data.bg + '; font-size:.5rem">';
			text = data.text;
			break;
		case "image":
			indicator = '<span class="slide-indicator" style="background-color:#' + data.bg +
				';background-image:url(' + data.link + ')">';
			text = data.text;
			break;
		case "video":
			indicator = '<span class="slide-indicator" style="background-color:#' + data.bg +
				';background-image:url(' + data.thumbnail + ')">';
			text = "";
			break;
		case "external":
			let url = data.link;
			if (url.includes("youtube.com") || url.includes("youtu.be"))
				url = utils.setYoutubeThumb(utils.parseYoutubeUrl(url));
			else
				url = utils.setFavicon(new URL(url).hostname);
			indicator = '<span class="slide-indicator" style="background:#' + data.bg + ' url(' + url + ')">';
			text = "";
			break;
		default:
			break;
	}
	return indicator + '<div class="cssreset" style="' +
		'overflow: hidden !important;all: initial;font-size: .5rem !important;">' + text;
}

function uploadSetter(uploadButton, type) { //dosya seçildiğinde
	var id = uploadButton.parents(".input-group").find('[type="file"]').attr('id');
	var uploadableFile = document.getElementById(id); //file_upload id li elemanı al, file input
	var fileName = uploadableFile.value.split("\\");
	fileName = fileName[fileName.length - 1];
	if (uploadableFile.files && uploadableFile.files[0]) { //dosya var ve resim türünde ise
		if (!uploadableFile.files[0].type.match(type + '.*')) {
			alert("Dosya Türü Yanlış!\nİstenen: " + type + ".*\nBulunan: " + uploadableFile.files[0].type);
			return;
		}
		var reader = new FileReader(); //FileReader class kur
		reader.onload = function(file) { //veriyi yükle
			if (type == "video") {
				setVideoDuration(file);
			}
			var fileData = reader.result; //dosya verisi

			upload(fileName, fileData).then((data) => {
				if (data == "success") {
					changeLabel($(uploadableFile), fileName, "bg-success");
					alert("Dosya başarıyla yüklendi");
				} else {
					changeLabel($(uploadableFile), "Bir Hata Meydana Geldi", "bg-danger");
					alert("Video/Resim: " + data); //hata mesajini goster
				}
			});
		}
		reader.readAsDataURL(uploadableFile.files[0]); //oku
	} else {
		alert('Yüklenecek Dosya Bulunamadı!')
	}
};

function upload(fileName, fileData) {
	return new Promise((resolve, reject) => {
		$.ajax({ //dosya data sını ajax.php ye postala
			url: "upload.php",
			type: "POST",
			data: {
				"dosyaAdi": fileName,
				"veri": fileData
			},
			dataType: "json",
			success: function(data) {
				resolve(data);
			}
		});
	});
}

function changeLabel(fileInput, label, labelClass) {
	fileInput.siblings('label').text(label);
	fileInput.siblings('label').removeClass().addClass('custom-file-label ' + labelClass);
}
let utils = {
	setFavicon: (url) => {
		if (!navigator.onLine) {
			return 'img/link.png'; // Converts string to base64
		}
		return "https://icons.duckduckgo.com/ip3/" + url + ".ico";
	},
	setYoutubeThumb: (id) => {
		if (!navigator.onLine) {
			return 'img/link.png'; // Converts string to base64
		}
		return "https://img.youtube.com/vi/" + id + "/1.jpg";
	},
	parseYoutubeUrl: (url) => {
		if (url.includes("embed"))
			return url.split("?")[0].substring(url.indexOf("embed/") + 6);
		else if (url.includes("youtu.be"))
			return url.substring(url.indexOf("youtu.be") + 9);
		else if (url.includes("youtube.com"))
			return new URL(url).searchParams.get('v'); // Youtube ?v= değeri alınır
		return ""
	},
	editPeriods: (periods) => {
		let periodString = "";
		let $optgroups = $('#periods optgroup');
		for ($optgroup of $optgroups) {
			let $opts = $($optgroup).find('option');
			let groupSelected = true;
			let optVals = "";
			for ($opt of $opts) {
				if ($($opt).prop('selected')) {
					optVals += $($opt).val() + ",";
				} else {
					groupSelected = false;
				}
			}
			if (groupSelected) {
				periodString += $($optgroup).attr('label').substring(1) + ",";
			} else {
				periodString += optVals; // group adı gelmezse seçililer stringe eklenir
			}
		}
		let periodArray = periodString.split(',');
		let periodArrayLength = periodArray.length;
		periodArray.pop();
		if (periodArrayLength > 4) {
			return periodArray[0] + "," + periodArray[1] + " ... " + periodArray[periodArrayLength - 2];
		}
		return periodArray;
	}
}
var intval = null;
var percentage = 0;

function startMonitor() {
	$.getJSON('uploadCheck.php',
		function(data) {
			if (data) {
				percentage = Math.round((data.bytes_processed / data.content_length) * 100);
				$("#progressbar").progressbar({
					value: percentage
				});
				$('#progress-txt').html('Uploading ' + percentage + '%');
			}
			if (!data || percentage == 100) {
				$('#progress-txt').html('Complete');
				stopInterval();
			}
		}
	);
}

function startInterval() {
	if (intval == null) {
		intval = window.setInterval(function() {
			startMonitor()
		}, 200)
	} else {
		stopInterval()
	}
}

function stopInterval() {
	if (intval != null) {
		window.clearInterval(intval)
		intval = null;
		$("#progressbar").hide();
		$('#progress-txt').html('Complete');
	}
}
//startInterval();

function inValid() {

	let tur = $('.tab-pane.active').attr('id');
	if (tur == "text") {
		if (durationValidity($('#text_duration')))
			return true;
		if ($('#text_editor').val() == "")
			return validityMessage("Yazı Boş Geçilemez!");
		if (hexColorValidity($('#bg').val()))
			return validityMessage("Renk Değeri Geçerli Değil!");
	} else if (tur == "image") {
		if (durationValidity($('#image_duration')))
			return true;
		if (hexColorValidity($('#image_bg').val()))
			return validityMessage("Renk Değeri Geçerli Değil!");
		if (fileControl($('#image_uploader')))
			return true;
	} else if (tur == "video") {
		if (durationValidity($('#video_duration')))
			return true;
		if ($('#video_explaination').val() == "")
			return validityMessage("Açıklama Boş Geçilemez!");
		if (hexColorValidity($('#video_bg').val()))
			return validityMessage("Renk Değeri Geçerli Değil!");
		if (fileControl($('#video_uploader')))
			return true;
	} else if (tur == "external") {
		if (durationValidity($('#external_duration')))
			return true;
		if ($('#external_explaination').val() == "")
			return validityMessage("Açıklama Boş Geçilemez!");
		if (hexColorValidity($('#external_bg').val()))
			return validityMessage("Renk Değeri Geçerli Değil!");
	}
}

function validityMessage(message) {
	alert(message);
	return true;
}

function hexColorValidity(hex) {
	return /^#[0-9A-F]{6}$/i.test(hex);
}

function fileControl(fileInput) {
	if (!fileInput.val())
		return validityMessage("Dosya Boş Geçilemez!");
	if (!fileInput.siblings('label').hasClass('bg-success'))
		return validityMessage("Dosya Yüklenmeden Devam Edilemez!");
}

function durationValidity(durationInput) {
	// Duration validity
	duration = durationInput.val();
	if (!duration)
		return validityMessage("Süre Boş Geçilemez!");
	if (duration <= 0)
		return validityMessage("Süre 0'dan Büyük Olmalıdır");

}

function setVideoDuration(file) {
	var fileContent = file.target.result;
	$('body').append('<video id="vid" hidden duration="" onloadeddata="getVideoDuration()" metadata src="' +
		fileContent + '"></video>');

}

function getVideoDuration() {
	let $video = document.getElementById('vid');
	let newDuration = Math.ceil(parseFloat($video.duration));
	document.getElementById('video_duration').value = newDuration + 3;
	createPoster($video);
	$('#vid').remove();
}

function createPoster($video) {
	//here you can set anytime you want
	$video.currentTime = 5;
	var canvas = document.getElementById('video_thumbnail');
	canvas.getContext("2d").drawImage($video, 0, 0, canvas.width, canvas.height);
	let drawnImage = canvas.toDataURL("image/jpeg");
	let drawnImageName = "thumbnail_" + new Date().getTime() + ".jpg";
	upload(drawnImageName, drawnImage).then((data) => {
		if (data == "success") {
			$('#video_thumbnail_image').attr('src', "upload.php?i=" + drawnImageName);
		} else {
			$('#video_thumbnail_image').attr('src', "img/broken-image.jpg");

			alert("Küçük Video Resmi: " + data); //hata mesajini goster
		}
	});
	return drawnImage;
}

function syncAll($syncButton) {
	let syncDate = $('#tarih').val();
	$.ajax({
			url: 'announcements.php',
			type: 'PUT',
			data: JSON.stringify({
				date: syncDate
			})
		})
		.done(function() {
			$('#slides').html("");
			announcement.getAnnouncementData(true);
			console.log("success");
		})
		.fail(function() {
			console.log("error");
		})
		.always(function() {
			console.log("complete");
		});

}