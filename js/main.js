// FACTOR ile yavaşlatma ve hızlandırma yapılabilir
let FACTOR = 1;
let TEXT_FILL_ARGS = {
  innerTag: "p",
  minFontPixels: 50,
  maxFontPixels: 100
};
let URETIM_BILGISI, PERSONEL_DATA, BANT_SONU_DATA, GOREVLER, HATALAR;
let DONEM;
let BANTLAR = [];
let BANT_NOLARI = [];
let SAYAC = new Date().getTime();
let BEYBOWS_URL = "http://120.120.16.148:8080/beyboWS/";
let DUYURULAR;
duyurulariAl();
setInterval(() => {
  duyurulariAl();
}, 5 * 60 * 1000);

let BP;
let BIRINCILER = [];
bpAl(); // Günde bir kez alınması yeter.

setInterval(() => {
  if (BP === undefined || BP === null || Object.keys(BP).length == 0 || new Date().getTime() - SAYAC > 600000) {
    bpAl();
  }
}, 5 * 60 * 1000);

// Değişken Bilgiler
gorevleriAl(); // GOREVLER ayarlanır

// Sabit Bilgiler
hatalariCek(); // HATLAR ayarlanır

// Bant Verisi Slide
bantData(true);

// Ara Kontrol Slide & Data
araKontrol(true);



function bantData(baslangicMi) {
  BANTLAR = [];
  BANT_NOLARI = [];
  $.ajax({
      url: BEYBOWS_URL + "bantlar",
      type: "GET"
    })
    .done(function(response) {
      for (r of response) {
        BANTLAR.push(r.bantAdi);
        BANT_NOLARI.push(r.bantNo);
      }
      // Ara Kontrol Slide & Data
      araKontrol(false);
      periyotData(baslangicMi);
      bantSonu();
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });
}

function periyotData(baslangicMi) {
  $.ajax({
      url: BEYBOWS_URL + "donemler",
      type: "GET",
    })
    .done(function(response) {
      let simdi = new Date();
      simdi.setMinutes(simdi.getMinutes() - 10); //10dk gecikmeli
      let simdiSaat = sifirEkleme(simdi.getHours());
      let simdiDakika = sifirEkleme(simdi.getMinutes());
      let simdiStr = simdiSaat + ":" + simdiDakika;

      for (r in response) {
        // Dönem Bulma
        if (r == response.length - 1) {
          DONEM = response[r - 1].baslangic + "-" + response[r - 1].bitis;
          break;
        } else if (r != 0) {
          if (
            simdiStr > response[r - 1].bitis &&
            simdiStr < response[r].bitis
          ) {
            DONEM = response[r - 1].baslangic + "-" + response[r - 1].bitis;
            break;
          }
        } else if (response.length == 1) {
          DONEM = response[r].baslangic + "-" + response[r].bitis;
          break;
        }
      }
      donemlikDataAl(baslangicMi);
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });
}

function donemlikDataAl(baslangicMi) {
  $.ajax({
      url: BEYBOWS_URL + "saatlik_takip/" + bugun("-", true) + "/" + DONEM,
      type: "GET",
    })
    .done(function(response) {
      gunlukData(response, baslangicMi);
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });
}

function gunlukData(donemlikData, baslangicMi) {
  $.ajax({
      url: BEYBOWS_URL + "saatlik_takip/" + bugun("-", true),
      type: "GET",
    })
    .done(function(response) {
      /*if (response.length == 0) {

			}*/
      for (bant of BANTLAR) {
        // Herbir bant için değerler sıfırlanır.
        var toplamDikim = 0;
        var toplamHedef = 0;
        var kayitSayisi = 0;
        // Tüm değerler içinde ilgili bant için bantAdı aranır.
        for (r of response) {
          // Bant Adı bulunur
          if (bant.turkishToLower() == r.bantNo.turkishToLower()) {
            // Elde edilen değerler toplama işlenir.
            toplamDikim += parseInt(r.dikimAdet);
            if (r.dikimHedef != "0") {
              toplamHedef += parseInt(r.dikimHedef);
              kayitSayisi++;
            }
          }
        }

        // Toplam Hedef toplam kayıt sayısı ile aritmetik ortalama yapılır.
        topHedef /= kayitSayisi;

        // Dönemlik datanın ilgili kayıdının topDikim,topHedef değerine kayıt edilir
        for (d of donemlikData) {
          if (bant.turkishToLower() == d.bantNo.turkishToLower()) {
            d["topDikim"] = toplamDikim;
            d["topHedef"] = toplamHedef;
          }
        }
      }
      URETIM_BILGISI = donemlikData;

      if (baslangicMi) {
        slide();
      }
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });
}

function araKontrol(baslangicMi) {
  var simdi = new Date();
  $.ajax({
      url: BEYBOWS_URL + "mevcut_ara_kontrol/" + bugun("-", true),
      type: "GET",
    })
    .done(function(response) {
      response.sort((a, b) =>
        a.operator > b.operator ? 1 : b.operator > a.operator ? -1 : 0
      ); // Personel adları sıralı olmalı
      bantIciData = {};
      for (bant of BANT_NOLARI) {
        var bantBilgisi = [];
        for (r of response) {
          // Görevler içerisinden mevcut görevId'nin bant nosu döner
          if (GOREVLER[r.gorevId] == bant) {
            bantBilgisi.push(r);
          }
        }
        bantIciData[bant] = getAraKontrolVerileri(bantBilgisi);
      }

      PERSONEL_DATA = []; // response;
      //console.log("RESP:" + JSON.stringify(response));
      for (var r = 0; r < response.length; r++) {
        if (r == 0) {
          PERSONEL_DATA.push({
            operator: response[r].operator,
            periyot: response[r].kontrol.periyot,
          });
        } else if (response[r].operator == response[r - 1].operator) {
          var geciciData = {
            operator: response[r - 1].operator,
            periyot: response[r - 1].kontrol.periyot,
          };

          while (response[r].operator == response[r - 1].operator) {
            //response.splice(r, 1);
            for (i in response[r].kontrol.periyot) {
              if (
                geciciData.periyot[i].puan == "" &&
                response[r].kontrol.periyot[i].puan != ""
              ) {
                // Puan içeren kayıdın bilgisi önceki kayıda eklenir.
                geciciData.periyot[i].puan =
                  response[r].kontrol.periyot[i].puan;
              }
            }
            // Response'un sonuna gelince artırma yapma, çıkış yap.
            if (r < response.length - 1) r++;
            else break;
          }
          if (r < response.length - 1) r--;

          PERSONEL_DATA.pop();
          PERSONEL_DATA.push(geciciData);
          // Bilgisi çekilen kayıt silinir
          //response.splice(r, 1);
        } else {
          PERSONEL_DATA.push({
            operator: response[r].operator,
            periyot: response[r].kontrol.periyot,
          });
        }
      }
      //console.log("pData:" + JSON.stringify(PERSONEL_DATA));
      if (baslangicMi) {
        personelSlide();
      }
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });
}

var bilgilendirmeMi = true;

async function slide() {
  //setInterval(bantData(), 3000);
  while (true) {
    if (bilgilendirmeMi) {
      aciklamaAyarla();
      bilgilendirmeMi = false;
    }

    // ÜRETİM BİLGİSİ VARSA
    if (URETIM_BILGISI.length > 0) {
      for (bantNo of BANT_NOLARI) {
        let datum = URETIM_BILGISI.find(e => e.bantNo == bantNo);

        if (datum !== undefined) {
          // Üretim
          uretimBilgisindenDOMa(datum)
          if (BP[bantNo] !== undefined) {
            // BP
            bpAyarla(BP[bantNo], bantNo);
          }
          // Bant Sonu
          // Üç kere deneme yapılır
          bantSonuDeneme(datum);

          await sleep(5000);

          adetFlipFlap(datum);

          await sleep(5000);
        }

        await duyuruAyarla(bantNo);
      }

      await duyuruAyarla("G");

      saatGoster();
      await sleep(10000);
      saatGizle();

      // Eğer veri varsa her on dakikada bir günceller
      if (new Date().getTime() - SAYAC > 600000) {
        bantData(false);
        SAYAC = new Date().getTime();
      }
    }
    // SADECE BANT SONU DATA VARSA
    else if (
      BANT_SONU_DATA != undefined &&
      BANT_SONU_DATA != null &&
      BANT_SONU_DATA != ""
    ) {
      ekranSifirla();

      for (var b = 0; b < BANT_NOLARI.length; b++) {
        // Bant numaraları üzerinden değer çağrılır.
        var bantNo = BANT_NOLARI[b];
        if (BANT_SONU_DATA[bantNo].toplamKontrol > 0) { // undefined değilse çalışır

          // Bant adları üzerinden değer çağrılır. Bant no ile aynı indise ait olduğu için aynı indis ile çekilir
          $("#bantAd").text(BANTLAR[b]);

          bantSonundanDOMa(bantNo);
          if (BP[bantNo] !== undefined) {
            // BP
            bpAyarla(BP[bantNo], bantNo);
          }
          await sleep(5000);
        }
        await duyuruAyarla(bantNo);
      }
      // Eğer veri varsa her on dakikada bir günceller
      if (new Date().getTime() - SAYAC > 6000) {
        bantData(false);
        SAYAC = new Date().getTime();
      }
      await duyuruAyarla("G");
      saatGoster();
      await sleep(10000);
      saatGizle();
    } else {

      saatGoster();

      // Eğer veri yoksa her dakikada bir kere veri çekmeye çalışır.
      await sleep(60000);
      bantData(false);
      // Data'nın toplanabilmesi için bekleme süresi
      await sleep(2000);
      saatGizle();
    }

  }
}

async function personelSlide() {
  while (true) {
    if (PERSONEL_DATA.length > 0) {
      for (datum1 of PERSONEL_DATA) {
        $("#operator").fadeTo("slow", 0.5).fadeTo("slow", 1.0);
        $("#operator").text(datum1.operator);
        $(".puan").each(function(index, el) {
          switch (datum1.periyot[index].puan) {
            case "Y":
              $(this).removeClass().addClass("badge puan bg-basarili");
              break;
            case "S":
              $(this).removeClass().addClass("badge puan bg-warning");
              break;
            case "KS":
              $(this).removeClass().addClass("badge puan bg-hata");
              break;
            default:
              $(this).removeClass().addClass("badge puan bg-light text-light");
              break;
          }
          datum1.periyot[index].puan ?
            $(this).text(datum1.periyot[index].puan) :
            $(this).text("X");
        });

        await sleep(3000);
      }
      // Bir tur sonrası yeniden kontrol
      araKontrol(false);
    }
    // Eğer veri yoksa her dakikada bir kere veri çekmeye çalışır.
    else {
      araKontrol(false);
      SAYAC = new Date().getTime();
      await sleep(60000);
    }
  }
}
//Zamanlama için kullanılır.
function sleep(ms) {
  // FACTOR ile yavaşlatma ve hızlandırma yapılabilir
  return new Promise((resolve) => setTimeout(resolve, ms / FACTOR));
}

//Renklendirme için kullanılır
function renklendir(oran, el) {
  if (oran > 0.95) {
    el.parents(".yapilan-container")
      .removeClass("bg-hata")
      .removeClass("bg-normal")
      .removeClass("bg-basarili")
      .addClass("bg-hedef");
  } else if (oran > 0.85) {
    el.parents(".yapilan-container")
      .removeClass("bg-hata")
      .removeClass("bg-normal")
      .removeClass("bg-hedef")
      .addClass("bg-basarili");
  } else if (oran > 0.8) {
    el.parents(".yapilan-container")
      .removeClass("bg-hata")
      .removeClass("bg-hedef")
      .removeClass("bg-basarili")
      .addClass("bg-normal");
  } else {
    el.parents(".yapilan-container")
      .removeClass("bg-hedef")
      .removeClass("bg-normal")
      .removeClass("bg-basarili")
      .addClass("bg-hata");
  }
}
//Verim Hesaplama için kullanılır
function verimHesapla(oran) {
  if (isNaN(oran)) {
    $("#verim").text("-");
    $("#verim")
      .parent("div")
      .removeClass()
      .addClass("hata-kodu-container justify-content-between bg-fantastik");
  } else {
    $("#verim").text("%" + (oran * 100).toFixed(0));
    if (oran > 0.95) {
      $("#verim")
        .parent("div")
        .removeClass()
        .addClass("hata-kodu-container justify-content-between bg-hedef");
    } else if (oran > 0.85) {
      $("#verim")
        .parent("div")
        .removeClass()
        .addClass("hata-kodu-container justify-content-between bg-basarili");
    } else if (oran > 0.8) {
      $("#verim")
        .parent("div")
        .removeClass()
        .addClass("hata-kodu-container justify-content-between bg-normal");
    } else {
      $("#verim")
        .parent("div")
        .removeClass()
        .addClass("hata-kodu-container justify-content-between bg-hata");
    }
  }
}

function bantSonu(argument) {
  $.ajax({
      url: BEYBOWS_URL + "eol_urun_kontrol/tarih/" + bugun("-", true),
      type: "GET",
    })
    .done(function(response) {
      BANT_SONU_DATA = {};
      for (bant of BANT_NOLARI) {
        var bantBilgisi = [];
        for (r of response) {
          // Görevler içerisinden mevcut görevId'nin bant nosu döner
          if (GOREVLER[r.gorevId] == bant) {
            bantBilgisi.push(r);
          }
        }
        BANT_SONU_DATA[bant] = getBantSonuVerileri(bantBilgisi, HATALAR);
      }
      console.log("success");
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });
}

function gorevleriAl() {
  var simdi = new Date();
  GOREVLER = {};
  $.ajax({
      url: BEYBOWS_URL +
        "bant_gorevlendirmeleri/" +
        simdi.getFullYear() +
        "-" +
        sifirEkleme(simdi.getMonth()) +
        "-" +
        sifirEkleme(simdi.getDate()) +
        "/" +
        simdi.getFullYear() +
        "-" +
        sifirEkleme(simdi.getMonth() + 1) +
        "-" +
        sifirEkleme(simdi.getDate()),
      type: "GET",
    })
    .done(function(response) {
      for (r of response) {
        GOREVLER[r.id] = r.bantNo;
      }
      console.log("success");
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });
  return GOREVLER;
}

function getBantSonuVerileri(params, hatalarData) {
  let sutun;
  let stdHataKodlari = {};
  let toplamKontrol = 0;
  let topHataliUrun = 0;
  let topHata = 0;
  let topReins = 0;
  let topIlkKontrol = 0;

  for (param of params) {
    let periyotlar = param.hatalar.periyot;
    for (let j = 0; j < periyotlar.length; j++) {
      let adicomplar = periyotlar[j].adicomp;
      toplamKontrol += adicomplar.length;
      if (periyotlar[j].aralik == DONEM) {}
      for (let n = 0; n < adicomplar.length; n++) {
        let anlikAdicomp = adicomplar[n];
        if (anlikAdicomp.reins == 0) {
          topIlkKontrol++;
        } else {
          topReins++;
        }
        let hataKodlari = anlikAdicomp.hataKodlari;
        if (hataKodlari.length > 0) {
          topHataliUrun++;
        }
        topHata += hataKodlari.length;
      }
    }
  }
  sutun = {
    toplamKontrol: toplamKontrol,
    topHataliUrun: topHataliUrun,
    topHata: topHata,
    topReins: topReins,
    topIlkKontrol: topIlkKontrol,
  };

  return sutun;
}

function getAraKontrolVerileri(params) {
  var topHata = 0;

  for (param of params) {
    var periyotlar = param.kontrol.periyot;
    for (periyot of periyotlar) {
      if (periyot.puan != "") {
        topHata += periyot.hatalar.length + periyot.ekHatalar.length;
      }
    }
  }

  return topHata;
}

function istatistikSifirla() {
  $("#top_kontrol").text("0");
  $("#hatali_urun").text("0");
  $("#hata_adedi").text("0");
  $("#reins").text("0");
  $(".hata-adedi").text("0");
}

function hatalariCek() {
  $.ajax({
      url: BEYBOWS_URL + "hata_kodlari",
      type: "GET",
    })
    .done(function(response) {
      HATALAR = response;

      console.log("success");
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });
}

/****** İmleç Pozisyonunu Ayarlama-Biter ******/
String.prototype.turkishToLower = function() {
  var string = this;
  var letters = {
    İ: "i",
    I: "ı",
    Ş: "ş",
    Ğ: "ğ",
    Ü: "ü",
    Ö: "ö",
    Ç: "ç",
  };
  string = string.replace(/(([İIŞĞÜÇÖ]))/g, function(letter) {
    return letters[letter];
  });
  return string.toLowerCase();
};

String.prototype.turkishToUpper = function() {
  var string = this;
  var letters = {
    i: "İ",
    ş: "Ş",
    ğ: "Ğ",
    ü: "Ü",
    ö: "Ö",
    ç: "Ç",
    ı: "I",
  };
  string = string.replace(/(([iışğüçö]))/g, function(letter) {
    return letters[letter];
  });
  return string.toUpperCase();
};

function saatGoster() {
  var simdi = new Date();
  $("#donem").text(DONEM);
  $("#saat").text(sifirEkleme(simdi.getHours()));
  $("#dakika").text(sifirEkleme(simdi.getMinutes()));
  $("#saat_container").slideDown("fast");

  $('#bantAd').css('z-index', '999');
}

function saatGizle() {
  $("#saat_container").slideUp("fast");
}

function ekranSifirla() {
  $("#topHedef").text("");
  $("#dikimHedef").text("");
  $("#topDikim").text("");
  $("#dikimAdet").text("");
  $("#wft").text("-");
  $("#verim").text("-");
  $("#model_adi").text("ÇALIŞMA NO");
  //$("#bantAd").text("");

  $("#wft")
    .parent("div")
    .removeClass()
    .addClass("hata-kodu-container justify-content-between bg-fantastik");
  $("#verim")
    .parent("div")
    .removeClass()
    .addClass("hata-kodu-container justify-content-between bg-fantastik");
}

async function duyuruAyarla(bantNo) {

  if (!DUYURULAR[bantNo]) return;
  bantNo == "G" ? $('#bantAd').text('') : $('#bantAd').text(bantNo);
  $('#bantAd').css('z-index', '1001');
  $('#duyuru_container').removeClass().addClass('d-flex');
  for (param of DUYURULAR[bantNo]) {
    //let param = DUYURULAR[bantNo][0];
    if (!param.periods.includes(new Date().getHours() + ":00")) continue;
    switch (param.type) {
      case "text":
        $("#duyuru").html(
          '<div style="font-size:5rem;background-color:#' +
          param.bg +
          ';background-size: contain;width: 100%;height: 100%;' +
          'text-shadow: 0px 0px 2rem rgb(0, 0, 0);color: white;text-align: center;' +
          '-webkit-text-stroke-width: 2px;-webkit-text-stroke-color: white;">' +
          param.text +
          "</div>"
        );
        fitText($('#duyuru'), TEXT_FILL_ARGS);
        break;
      case "image":
        $("#duyuru").html(
          '<div style="font-size:5rem;' +
          'background:#' + param.bg + ' ' +
          'url(' + param.link + ') ' +
          'center no-repeat;background-size: contain;width: 100%;height: 100%;' +
          'text-shadow: 0px 0px 2rem rgb(0, 0, 0);color: white;text-align: center;' +
          '-webkit-text-stroke-width: 2px;-webkit-text-stroke-color: white;">' +
          param.text +
          "</div>"
        );
        break;
        fitText($('#duyuru'), TEXT_FILL_ARGS);
      case "video":
        $("#duyuru").html(
          '<video id="video" style="width: 100%;height: 100%;' +
          'background-color:#' + param.bg + ';" muted autoplay>' +
          '<source src="' +
          param.link +
          '"' +
          'type="' +
          param.vidType +
          '">Your browser does not support the video tag.</video>'
        );
        let vid = document.getElementById("duyuru").childNodes[0];
        vid.load();
        break;
      case "external":
        $("#duyuru").html(
          '<iframe src="' +
          param.link +
          '"' +
          'style="width: 100%;height: 100%;"></iframe>'
        );
        break;

      default:
        break;
    }
    await sleep(param.duration * 1000);
  }
  $("#duyuru").html("");
  $('#bantAd').css('z-index', '999');
  $('#duyuru_container').removeClass().addClass('d-none');
}

function fitText($container, args) {
  $container.textfill(args);
}

function openFullScreen() {
  elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Chrome, Safari & Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

document.onfullscreenchange = function(event) {
  document.fullscreen ? $("#buton").parent('div').hide() : $("#buton").parent('div').show();
};

function wftRenkAyarla(wft) {
  $("#wft").text("%" + wft.toFixed(0));
  if (wft < 3) {
    $("#wft")
      .parent("div")
      .removeClass()
      .addClass(
        "hata-kodu-container justify-content-between bg-hedef"
      );
  } else if (wft < 5) {
    $("#wft")
      .parent("div")
      .removeClass()
      .addClass(
        "hata-kodu-container justify-content-between bg-basarili"
      );
  } else if (wft < 10) {
    $("#wft")
      .parent("div")
      .removeClass()
      .addClass(
        "hata-kodu-container justify-content-between bg-normal"
      );
  } else {
    $("#wft")
      .parent("div")
      .removeClass()
      .addClass(
        "hata-kodu-container justify-content-between bg-hata"
      );
  }
}

function adetFlipFlap(datum) {

  if (datum.topDikim - datum.topHedef >= 0) {
    $("#topDikim")
      .siblings("i")
      .removeClass()
      .addClass("fas fa-plus-square");
  } else {
    $("#topDikim")
      .siblings("i")
      .removeClass()
      .addClass("fas fa-minus-square");
  }
  if (datum.dikimAdet - datum.dikimHedef >= 0) {
    $("#dikimAdet")
      .siblings("i")
      .removeClass()
      .addClass("fas fa-plus-circle");
  } else {
    $("#dikimAdet")
      .siblings("i")
      .removeClass()
      .addClass("fas fa-minus-circle");
  }
  $("#topDikim").text((datum.topDikim - datum.topHedef).toFixed(0));
  $("#dikimAdet").text((datum.dikimAdet - datum.dikimHedef).toFixed(0));
}

async function aciklamaAyarla() {
  $("#topHedef").siblings(".aciklama").removeAttr("hidden");
  $("#dikimHedef").siblings(".aciklama").removeAttr("hidden");
  $("#topDikim").siblings(".aciklama").removeAttr("hidden");
  $("#dikimAdet").siblings(".aciklama").removeAttr("hidden");
  $("#top_kontrol").siblings(".aciklama").removeAttr("hidden");
  $("#reins").siblings(".aciklama").removeAttr("hidden");
  $("#hata_adedi").siblings(".aciklama").removeAttr("hidden");
  $("#hatali_urun").siblings(".aciklama").removeAttr("hidden");
  $(".hedef, .yapilan, .kalite h3").css("text-align", "left");
  //await sleep(300000);
  $("#topHedef").siblings(".aciklama").attr("hidden", "true");
  $("#dikimHedef").siblings(".aciklama").attr("hidden", "true");
  $("#topDikim").siblings(".aciklama").attr("hidden", "true");
  $("#dikimAdet").siblings(".aciklama").attr("hidden", "true");
  $("#top_kontrol").siblings(".aciklama").attr("hidden", "true");
  $("#reins").siblings(".aciklama").attr("hidden", "true");
  $("#hata_adedi").siblings(".aciklama").attr("hidden", "true");
  $("#hatali_urun").siblings(".aciklama").attr("hidden", "true");
  $(".hedef, .yapilan, .kalite h3").css("text-align", "center");
}

function uretimBilgisindenDOMa(datum) {
  $("#bantAd").text(datum.bantNo);
  $("#model_adi").text(datum.calismaNo);
  $("#topHedef").text(datum.topHedef.toFixed(0));
  $("#dikimHedef").text(datum.dikimHedef.toFixed(0));
  $("#topDikim").text(datum.topDikim);
  $("#dikimAdet").text(datum.dikimAdet);

  $("#topDikim")
    .siblings("i")
    .removeClass()
    .addClass("far fa-calendar-check");
  $("#dikimAdet")
    .siblings("i")
    .removeClass()
    .addClass("far fa-check-square");
  var topOran = datum.topDikim / datum.topHedef;
  var dikimOran = datum.dikimAdet / datum.dikimHedef;

  renklendir(topOran, $("#topDikim"));
  renklendir(dikimOran, $("#dikimAdet"));
  verimHesapla(topOran);
}

function bpAyarla(bp, bantNo) {
  if (bp === undefined || bp === null || bp == "") {
    $("#yildiz_kapsayici").addClass("d-none");
  } else if (bp == 0) {
    $("#yildiz_kapsayici").addClass("d-none");
  } else {
    $("#yildiz_kapsayici").removeClass("d-none");
    $(".yildiz").each(function(index, el) {
      if (bp - index >= 1) {
        $(this).removeClass().addClass("fas fa-star fa-3x yildiz");
      } else if (bp - index >= 0.5) {
        $(this)
          .removeClass()
          .addClass("fas fa-star-half-alt fa-3x yildiz");
      } else {
        $(this).removeClass().addClass("far fa-star fa-3x yildiz");
      }
    });
    $("#yildiz_aciklama").text(parseFloat(bp).toFixed(2));
  }

  if (BIRINCILER.includes(bantNo)) $('.fa-trophy').removeClass('d-none');
  else $('.fa-trophy').addClass('d-none');
}

async function bantSonuDeneme(datum) {
  for (i = 0; i < 5; i++) {
    if (
      BANT_SONU_DATA != undefined &&
      BANT_SONU_DATA != null &&
      BANT_SONU_DATA != "" &&
      BANT_SONU_DATA != "{}"
    ) {
      var bant = datum.bantNo;
      bantSonundanDOMa(bant, datum);
      break;
    } else {
      await sleep(500);
    }
  }
}

function bantSonundanDOMa(bant, datum = false) {
  $("#top_kontrol").text(BANT_SONU_DATA[bant].toplamKontrol);
  $("#reins").text(BANT_SONU_DATA[bant].topReins);
  $("#hata_adedi").text(BANT_SONU_DATA[bant].topHata);
  $("#hatali_urun").text(BANT_SONU_DATA[bant].topHataliUrun);

  //WFT Hesabı
  // Bant sonu verisi girilmişse hesaplama yapılır, bant içi gözardı edilir.
  if (BANT_SONU_DATA[bant].topHata != 0 &&
    (datum ? datum.topDikim : BANT_SONU_DATA[bant].topIlkKontrol) > 0) {
    // Toplam Üretim Toplam İlk Kontrol olarak kabul edilmiştir.
    var wft =
      ((BANT_SONU_DATA[bant].topHata + bantIciData[bant]) * 100) /
      BANT_SONU_DATA[bant].topIlkKontrol; /*datum.topDikim*/
    wftRenkAyarla(wft);
  } else {
    $("#wft")
      .parent("div")
      .removeClass()
      .addClass(
        "hata-kodu-container justify-content-between bg-fantastik"
      );
    $("#wft").text("-");
  }
}

function duyurulariAl() {
  fetch('announcements.php?date=' + bugun("-", true))
    .then(res => res.json())
    .then((out) => {
      if (out == "")
        DUYURULAR = {};
      else
        DUYURULAR = out;
    }).catch(() => {
      DUYURULAR = {};
    });
}

function bpAl() {
  let week = oncekiHaftayiGetir(bugun("-", true));

  fetch('bpcrud.php?date=' + week)
    .then(res => res.json())
    .then((out) => {
      if (out == "")
        BP = {};
      else {
        BP = out;
        birinciListesiAyarla();
      }
    }).catch(() => {
      BP = {};
    });
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

function birinciListesiAyarla() {
  let keys = Object.keys(BP);
  let max = BP[keys.reduce(function(a, b) {
    return BP[a] >= BP[b] ? a : b
  })];

  for (key of keys) {
    if (BP[key] == max) {
      BIRINCILER.push(key);
    }
  }
}