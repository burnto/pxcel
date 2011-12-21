if (typeof window.console === 'undefined' || !console.log) {
	window.console = {
		log: function() {}
	};
}

(function () {
	
	// init variables
	var alphabet = "_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
	var zoom = 30,
		size = 16,
		values = [],
		title = 'pxcel',
		imageData, canvas, context;
	
	// functions

	var init = function () {

		for (var i = 0; i < size * size; i++) {
			values.push(false);
		}

		canvas = document.getElementById("canvas");
		context = canvas.getContext("2d");

		// event handling

		var pen = null;
		bean.add(canvas, 'mousedown', function(e) {
			var i = getIndex(e);
			pen = values[i] = !values[i];
			bean.fire(document, 'pxchange', [i, pen]);
		});

		bean.add(canvas, 'mousemove', function(e) {
			if (pen !== null) {
				var i = getIndex(e);
				if (values[i] !== pen) {
					values[i] = pen;
					bean.fire(document, 'pxchange', [i, pen])
				}
			}
		})

		bean.add(document, 'mouseup', function(e) {
			pen = null;
			hasher.setHash(pickle()); //change hash value (generates new history record)
		})

		// custom

		bean.add(document, 'pxchange', function(i, b) {
			setPixel(i, b);
		})

		hasher.initialized.add(handleChanges);
		hasher.init(); //initialize hasher (start listening for history changes)
		
	},

	getIndex = function (e) {
		return Math.floor(e.offsetY / zoom) * size + Math.floor(e.offsetX / zoom)
	},

	setPixel = function (i, c) {
		var x = i % size;
		var y = Math.floor(i / size);
		context.fillStyle = (c ? 'black' : 'white');
		context.fillRect(x * zoom, y * zoom, zoom, zoom);
	},

	pickle = function () {
		s = ''
		for(var i = 0; i < values.length; i += 6) {
			var v = 0;
			for (var j = 0; j < 6 && i + j < values.length; j++) {
				var v = v | values[i + j] << j;
			}
			s += alphabet[v];
		}
		return s + "&" + encodeURIComponent(title);
	},

	unpickle = function (hash) {
		var h = hash.split('&');
		var s = h[0];
		if (h.length > 1) {
			title = document.title = escape(decodeURIComponent(h[1])).replace('_', ' ');

		}
		for (var i = 0; i < s.length; i++) {
			var v = alphabet.indexOf(s[i]);
			for (var j = 0; j < 6; j++) {
				var b = (v >> j) & 1;
				var index = i * 6 + j;
				if (index < values.length && values[index] !== b) {
					values[index] = b;
					bean.fire(document, 'pxchange', [index, b])
				}
			}
		}
	},

	handleChanges = function (newHash, oldHash){
		console.log(newHash);
		unpickle(newHash);
	};

	bean.add(document, 'DOMContentLoaded', init);

}())
