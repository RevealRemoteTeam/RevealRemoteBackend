(function () {
	window.RevealRemote = window.RevealRemote || {};

	var script = document.getElementById('revealremote-script-tag-sxfatt5dba');
	var url = script.src;
	var protocol = url.substr(0, url.indexOf('://') + 3);
	var host = url.substr(url.indexOf('://') + 3);
	host = host.substr(0, host.indexOf('/'));
	var base = protocol + host + '/';

	function onDependenciesReady () {
		if (!RevealRemote.uuid) {
			RevealRemote.uuid = uuid.v1();
		}

		if (!RevealRemote.connected) {
			RevealRemote.connected = true;
			var socket = io.connect(base + 'presentation');

			function emitState () {
				socket.emit('state', {
					progress: Reveal.getProgress(),
					slideNotes: Reveal.getSlideNotes()
				});
			};

			socket.on('connect', function () {
				socket.emit('handshake', { roomId: RevealRemote.uuid });
			});

			Reveal.addEventListener('slidechanged', emitState);

			socket.on('ok', function () {
				console.log('RevealRemote: Connection is ok');
				emitState();
			});

			socket.on('not ok', function (error) {
				console.log('RevealRemote: Connection is not ok');
			});

			socket.on('control', function (control) {
				Reveal[control.action]();
			});

			socket.on('presenter connected', function () {
				swal.close();
			});
		}

		swal({
			title: "Scan this code with your mobile device",
			text: '<div class="revealremote-qr"></div>',
			html: true
		});

		var qr = new QRCode(document.getElementsByClassName('revealremote-qr')[0], {
			text: RevealRemote.uuid,
			width: 150,
			height: 150
		});
	};

	function loadResources (files, onLoad) {
		var ticks = 0;
		function tick () {
			ticks++;
			if (ticks === files.length) {
				onLoad();
			}
		};

		files.forEach(function (file) {
			if (file.lastIndexOf('.js') === file.length - 3) {
				var script = document.createElement('SCRIPT');
				script.src = base + file;
				script.type = 'text/javascript';
				script.async = true;
				script.addEventListener('load', tick);
				document.head.appendChild(script);
			}
			else {
				var link = document.createElement('LINK');
				link.href = base + file;
				link.type = 'text/css';
				link.rel = 'stylesheet';
				link.addEventListener('load', tick);
				document.head.appendChild(link);
			}
		});
	};

	if (RevealRemote.loading) {
		return;
	}

	if (!RevealRemote.loaded) {
		RevealRemote.loading = true;
		loadResources(['lib/socket.io.min.js', 'lib/qrcode.js/qrcode.min.js', 'lib/node-uuid/uuid.min.js', 'lib/sweetalert/dist/sweetalert.css', 'lib/sweetalert/dist/sweetalert.min.js', 'css/revealremote.css'], function () {
			RevealRemote.loaded = true;
			RevealRemote.loading = false;
			onDependenciesReady();
		});
	}
	else {
		onDependenciesReady();
	}
})();