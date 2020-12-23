function bugun(ayrac, tersMi) {
	var simdi = new Date();
	return tarihFormatla(simdi, ayrac, tersMi);
}

function tarihFormatla(tarih, ayrac, tersMi) {
	if (tersMi)
		return tarih.getFullYear() + ayrac + sifirEkleme(tarih.getMonth() + 1) + ayrac + sifirEkleme(tarih.getDate());
	else
		return sifirEkleme(tarih.getDate()) + ayrac + sifirEkleme(tarih.getMonth() + 1) + ayrac + tarih.getFullYear();
}

function sifirEkleme(n) {
	return n > 9 ? "" + n : "0" + n;
}