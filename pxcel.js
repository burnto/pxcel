if (typeof window.console === 'undefined' || !console.log) {
	window.console = {
		log: function() {}
	};
}

(function () {
	
	// init variables
	var alphabet = "_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
	var zoom = 25,
		size = 16,
		values = [],
		pen = null,
		context, 
		previewContext;
	
	// functions

	var init = function () {

		var canvas = document.getElementById("canvas");
		context = canvas.getContext("2d");

		var previewCanvas = document.getElementById("previewCanvas");
		previewContext = previewCanvas.getContext("2d");

		for (var i = 0; i < size * size; i++) {
			values.push(false);
			// updatePreview(i);
		}

		// draw events
		bean.add(canvas, 'mousedown', mousedown);
		bean.add(canvas, 'mousemove', mousemove);
		bean.add(document, 'mouseup', mouseup);

		bean.add(document.getElementById('clear'), 'click', clear);
		bean.add(document.getElementById('invert'), 'click', invert);

		// retitling
		// titleInput = document.getElementById("title");
		// bean.add(titleInput, 'keyup', titlechange);

		// custom events
		bean.add(document, 'pxchange', setPixel);

		// hasher
		hasher.changed.add(hashinit);
		hasher.initialized.add(hashinit);
		hasher.init(); 
		
	},

	// updatePreview = function (i) {
	// 	// for (var i = 0; i < values.length; i++) {
	// 	var v = values[i] ? 0 : 255;
	// 	imagePixels[i * 4] = v;
	// 	imagePixels[i * 4 + 1] = v;
	// 	imagePixels[i * 4 + 2] = v;
	// 	imagePixels[i * 4 + 3] = 255;
	// 	// }
	// 	// console.log(imagePixels);
	// },

	clear = function (e) {
		for (var i = 0; i < values.length; i++) {
			if (values[i] !== false) {
				values[i] = false;
				bean.fire(document, 'pxchange', [i, false]);
			}
		}
		save();
	  e.preventDefault();
	  e.stopPropagation();
	},

	invert = function (e) {
		for (var i = 0; i < values.length; i++) {
			values[i] = !values[i];
			bean.fire(document, 'pxchange', [i, values[i]]);
		}
		save();
	  e.preventDefault();
	  e.stopPropagation();
	},


	mousedown = function (e) {
		var i = getIndex(e);
		pen = values[i] = !values[i];
		bean.fire(document, 'pxchange', [i, pen]);		
	},

	mousemove = function (e) {
		if (pen !== null) {
			var i = getIndex(e);
			if (values[i] !== pen) {
				values[i] = pen;
				bean.fire(document, 'pxchange', [i, pen])
			}
		}		
	},

	mouseup = function (e) {
		pen = null;
		save();
	},

	getIndex = function (e) {
		var mouseY = Math.min(e.offsetY, size * zoom),
				mouseX = Math.min(e.offsetX, size * zoom);
		return Math.floor(mouseY / zoom) * size + Math.floor(mouseX / zoom)
	},

	setPixel = function (i, c) {
		var x = i % size;
		var y = Math.floor(i / size);
		context.fillStyle = (c ? 'black' : 'white');
		context.fillRect(x * zoom, y * zoom, zoom, zoom);

		previewContext.fillStyle = context.fillStyle;
		previewContext.fillRect(x, y, 1, 1);
		// updatePreview(i);
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
		console.log('pickled ' + s);
		return s;
	},

	
	unpickle = function (hash) {
		var s = hash;
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

	save = function () {
		hasher.setHash(pickle()); //change hash value (generates new history record)
	}

	hashchange = function (newHash, oldHash){
		// var h = hasher.getHashAsArray()
	};

	hashinit = function (newHash, oldHash){
		unpickle(newHash);
	};

	bean.add(document, 'DOMContentLoaded', init);

}())
