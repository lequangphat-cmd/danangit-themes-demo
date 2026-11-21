/* DNIT Core 0.2: tab, hiện dần, xem ảnh lớn, đầu trang khi cuộn. Không cần thư viện. */
(function () {
	var dau = document.querySelector('.dnit-dau');
	if (dau) {
		var cuon = function () { dau.classList.toggle('da-cuon', window.scrollY > 40); };
		cuon();
		window.addEventListener('scroll', cuon, { passive: true });
	}

	document.querySelectorAll('[data-dnit-tab]').forEach(function (khoi) {
		var nut = khoi.querySelectorAll('[role="tab"]');
		var doc = khoi.querySelector('[data-dnit-tab-doc]');
		if (doc) {
			var hep = window.matchMedia('(max-width: 760px)');
			var doiHuong = function () { doc.setAttribute('aria-orientation', hep.matches ? 'horizontal' : 'vertical'); };
			doiHuong();
			hep.addEventListener('change', doiHuong);
		}
		nut.forEach(function (n) {
			n.addEventListener('click', function () {
				nut.forEach(function (m) {
					var chon = m === n;
					m.setAttribute('aria-selected', chon ? 'true' : 'false');
					m.tabIndex = chon ? 0 : -1;
					document.getElementById(m.getAttribute('aria-controls')).hidden = !chon;
				});
			});
			n.addEventListener('keydown', function (e) {
				var doc = n.parentElement.getAttribute('aria-orientation') === 'vertical';
				var truoc = doc ? 'ArrowUp' : 'ArrowLeft', sau = doc ? 'ArrowDown' : 'ArrowRight';
				if (e.key !== sau && e.key !== truoc) { return; }
				e.preventDefault();
				var ds = Array.prototype.slice.call(nut), i = ds.indexOf(n);
				var k = ds[(i + (e.key === sau ? 1 : ds.length - 1)) % ds.length];
				k.focus(); k.click();
			});
		});
	});

	var hien = document.querySelectorAll('.dnit-hien');
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (ds) {
			ds.forEach(function (d) { if (d.isIntersecting) { d.target.classList.add('da-hien'); io.unobserve(d.target); } });
		}, { rootMargin: '0px 0px -8% 0px' });
		hien.forEach(function (el) { io.observe(el); });
	} else {
		hien.forEach(function (el) { el.classList.add('da-hien'); });
	}

	document.querySelectorAll('[data-dnit-xem]').forEach(function (a) {
		a.addEventListener('click', function (e) {
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) { return; }
			e.preventDefault();
			var hop = document.createElement('dialog');
			hop.className = 'dnit-hop';
			hop.setAttribute('aria-label', 'Ảnh phóng to');
			hop.innerHTML = '<img alt=""><button type="button" aria-label="Đóng" autofocus>&times;</button>';
			var anh = hop.querySelector('img');
			anh.src = a.href;
			anh.alt = a.querySelector('img')?.alt || a.getAttribute('aria-label') || '';
			hop.addEventListener('close', function () { hop.remove(); a.focus(); });
			hop.addEventListener('click', function (ev) { if (ev.target !== anh) { hop.close(); } });
			document.body.appendChild(hop);
			hop.showModal();
		});
	});
})();

/* DNIT Core 1.0: ngăn kéo menu, chữ chạy thanh trên, nút lên đầu trang. */
(function () {
	var ngan = document.getElementById('dnit-ngan');
	var mo = document.querySelector('.dnit-mo-menu');
	if (ngan && mo) {
		var dong = function () { ngan.hidden = true; mo.setAttribute('aria-expanded', 'false'); document.documentElement.style.overflow = ''; mo.focus(); };
		mo.addEventListener('click', function () {
			ngan.hidden = false; mo.setAttribute('aria-expanded', 'true'); document.documentElement.style.overflow = 'hidden';
			var b = ngan.querySelector('[data-dnit-dong]:not(.dnit-ngan__nen)'); if (b) { b.focus(); }
		});
		ngan.querySelectorAll('[data-dnit-dong]').forEach(function (b) { b.addEventListener('click', dong); });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ngan.hidden) { dong(); } });
		ngan.querySelectorAll('.dnit-menu-dt .co-con > a').forEach(function (a) {
			a.addEventListener('click', function (e) { e.preventDefault(); a.parentNode.classList.toggle('mo'); });
		});
	}
	document.querySelectorAll('[data-dnit-xoay]').forEach(function (k) {
		var ds = k.children; if (ds.length < 2) { return; }
		var i = 0; ds[0].classList.add('dang');
		setInterval(function () {
			k.classList.add('da-chay');
			ds[i].classList.remove('dang'); i = (i + 1) % ds.length; ds[i].classList.add('dang');
		}, 4000);
	});
	var len = document.querySelector('.dnit-noi__len');
	if (len) {
		window.addEventListener('scroll', function () { len.classList.toggle('hien', window.scrollY > 600); }, { passive: true });
		len.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
	}
	var p = location.pathname;
	document.querySelectorAll('.dnit-menu a, .dnit-menu-dt a').forEach(function (a) {
		if (a.getAttribute('href') === p) { a.setAttribute('aria-current', 'page'); }
	});
})();

/* Banner trượt, đếm ngược, đếm số. */
(function () {
	document.querySelectorAll('[data-dnit-truot]').forEach(function (k) {
		var day = k.querySelector('.dnit-bt__day'), n = day.children.length, i = 0, hen;
		if (n < 2) { return; }
		var cham = k.querySelectorAll('.dnit-bt__cham button');
		var den = function (j) {
			i = (j + n) % n; day.style.transform = 'translateX(-' + (i * 100) + '%)';
			cham.forEach(function (c, x) { if (x === i) { c.setAttribute('aria-current', 'true'); } else { c.removeAttribute('aria-current'); } });
		};
		var chay = function () { clearInterval(hen); hen = setInterval(function () { den(i + 1); }, 5000); };
		k.querySelector('.dnit-bt__mui--trai').addEventListener('click', function () { den(i - 1); chay(); });
		k.querySelector('.dnit-bt__mui--phai').addEventListener('click', function () { den(i + 1); chay(); });
		cham.forEach(function (c, x) { c.addEventListener('click', function () { den(x); chay(); }); });
		var x0 = null;
		k.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
		k.addEventListener('touchend', function (e) { if (x0 === null) { return; } var d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) { den(i + (d < 0 ? 1 : -1)); chay(); } x0 = null; });
		k.addEventListener('mouseenter', function () { clearInterval(hen); });
		k.addEventListener('mouseleave', chay);
		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) { chay(); }
	});
	document.querySelectorAll('[data-dnit-dem]').forEach(function (k) {
		var p = (k.getAttribute('data-dnit-dem') || '23:59').split(':');
		var g = k.querySelector('[data-g]'), m = k.querySelector('[data-p]'), s = k.querySelector('[data-s]');
		var hai = function (v) { return (v < 10 ? '0' : '') + v; };
		var tinh = function () {
			var now = new Date(), het = new Date(now); het.setHours(+p[0], +p[1] || 0, 0, 0);
			if (het <= now) { het.setDate(het.getDate() + 1); }
			var c = Math.floor((het - now) / 1000);
			g.textContent = hai(Math.floor(c / 3600)); m.textContent = hai(Math.floor(c % 3600 / 60)); s.textContent = hai(c % 60);
		};
		tinh(); setInterval(tinh, 1000);
	});
})();

/* Mã ưu đãi và video trong các khối ăn uống. */
(function () {
	document.querySelectorAll('[data-dnit-chep]').forEach(function (nut) {
		var hen;
		nut.addEventListener('click', async function () {
			try {
				await navigator.clipboard.writeText(nut.dataset.dnitChep);
				nut.textContent = 'Đã chép';
			} catch (loi) {
				var ma = nut.parentElement.querySelector('code');
				var vung = document.createRange();
				vung.selectNodeContents(ma);
				var chon = window.getSelection();
				if (chon) {
					chon.removeAllRanges();
					chon.addRange(vung);
				}
				nut.textContent = 'Chép thủ công';
			}
			clearTimeout(hen);
			hen = setTimeout(function () { nut.textContent = 'Sao chép'; }, 2000);
		});
	});


	document.querySelectorAll('[data-dnit-video]').forEach(function (nut) {
		nut.addEventListener('click', function () {
			var id = nut.dataset.dnitVideo;
			if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) { return; }
			var khung = document.createElement('iframe');
			khung.title = nut.dataset.tieuDe || 'Video giới thiệu';
			khung.allow = 'autoplay; encrypted-media; picture-in-picture';
			khung.allowFullscreen = true;
			khung.referrerPolicy = 'strict-origin-when-cross-origin';
			khung.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1';
			nut.parentElement.replaceChildren(khung);
			khung.focus();
		});
	});
})();

/* So sánh ảnh, lọc thư viện và phát video dọc từ ảnh bìa. */
(function () {
	document.querySelectorAll('[data-dnit-keo]').forEach(function (khung) {
		var keo = document.createElement('input');
		keo.className = 'dnit-so-sanh__keo';
		keo.type = 'range';
		keo.min = 0;
		keo.max = 100;
		keo.value = 50;
		keo.setAttribute('data-dnit-so-sanh', '');
		keo.setAttribute('aria-label', khung.dataset.dnitKeo);
		keo.addEventListener('input', function () {
			khung.style.setProperty('--dnit-muc', keo.value + '%');
		});
		khung.appendChild(keo);
	});

	document.querySelectorAll('.dnit-thu-vien-loc').forEach(function (khoi) {
		var boLoc = khoi.querySelector('.dnit-thu-vien-loc__tab');
		var nut = boLoc.querySelectorAll('[data-dnit-nhom]');
		var anh = khoi.querySelectorAll('[data-dnit-anh-nhom]');
		boLoc.hidden = false;
		nut.forEach(function (n) {
			n.addEventListener('click', function () {
				nut.forEach(function (m) { m.setAttribute('aria-pressed', m === n ? 'true' : 'false'); });
				anh.forEach(function (a) {
					a.hidden = n.dataset.dnitNhom !== 'tat-ca' && a.dataset.dnitAnhNhom !== n.dataset.dnitNhom;
				});
			});
		});
	});

	document.querySelectorAll('[data-dnit-mp4]').forEach(function (nut) {
		nut.addEventListener('click', function () {
			var video = document.createElement('video');
			var bia = nut.parentElement.querySelector('img');
			if (bia) { video.poster = bia.currentSrc || bia.src; }
			video.controls = true;
			video.playsInline = true;
			video.tabIndex = 0;
			video.setAttribute('aria-label', nut.dataset.tieuDe || 'Video ngắn');
			video.src = nut.dataset.dnitMp4;
			nut.parentElement.replaceChildren(video);
			video.focus();
			video.play().catch(function () { /* Khách có thể phát bằng nút điều khiển. */ });
		});
	});
})();
