if (typeof window.console === 'undefined' || !console.log) {
	window.console = {
		log: function() {}
	};
}

$.domReady(function() {
	
	// init variables

	var alphabet = "_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
	var zoom = 25,
		size = 16,
		numPreviews = 2,
		values = [],
		pen = null,
		context;

	
	// functions

	var init = function () {

		var canvas = document.getElementById("canvas");
		context = canvas.getContext("2d");

		for (var i = 0; i < size * size; i++) {
			values.push(false);
		}

		// draw events
		$(canvas).on('mousedown', mousedown);
		$(canvas).on('mousemove', mousemove);
		$(document).on('mouseup', mouseup);

		canvas.addEventListener( 'touchstart', function(e) {
			var offset = $(canvas).offset();
			var x = e.targetTouches[0].pageX - offset.left;
			var y = e.targetTouches[0].pageY - offset.top;
			// alert([e.targetTouches[0].pageX - offset.left, e.targetTouches[0].pageY - offset.top]);
  		 	context.fillRect(0,0,x, y);
			e.preventDefault();
			e.stopPropagation();
		}, false);
		// canvas.addEventListener( 'touchmove', function() {
  // 		 	context.fillRect(0,0,e.offsetX, e.offsetY);
		// 	e.preventDefault();
		// }, false);


		$("#clear").click(clear);
		$("#invert").click(invert);
		$("#download").click(download);

		// TODO
		// $(document).keypress(function(e) {
		// 	console.log(e)
		// 	console.log(e.key)
		// });

		// custom events
		$(document.body).on('pxchange', setPixel);

		$(window).on('hashchange', function () {
		    var hash = $.hash();
		    hashinit(hash);
		});
		hashinit($.hash())	
	},

	clear = function (e) {
		for (var i = 0; i < values.length; i++) {
			if (values[i] !== false) {
				values[i] = false;
				$(document.body).emit('pxchange', [i, false]);
			}
		}
		save();
	  e.preventDefault();
	  e.stopPropagation();
	},

	invert = function (e) {
		for (var i = 0; i < values.length; i++) {
			values[i] = !values[i];
			$(document.body).emit('pxchange', [i, values[i]]);
		}
		save();
	  e.preventDefault();
	  e.stopPropagation();
	},

	download = function (e) {
		console.log($("canvas.zoom1").get(0).toDataURL());
	},


	mousedown = function (e) {
		var i = getIndex(e);
		pen = values[i] = !values[i];
		$(document.body).emit('pxchange', [i, pen]);
		$("#previews").css({display: 'block'});
	},

	mousemove = function (e) {
		if (pen !== null) {
			var i = getIndex(e);
			if (values[i] !== pen) {
				values[i] = pen;
				$(document.body).emit('pxchange', [i, pen])
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

	setPixel = function (i, v) {
		var x = i % size;
		var y = Math.floor(i / size);
		context.fillStyle = 'black';
		var method = v ? 'fillRect' : 'clearRect';
		context[method](x * zoom, y * zoom, zoom, zoom);

		for (var z = 1; z < numPreviews + 1; z++) {
			var c = $("canvas.preview.zoom" + z).get(0);
			if (c) {
				var ctx = c.getContext('2d');
				ctx.fillStyle = context.fillStyle;
				ctx[method](x * z, y * z, z, z);
			}
		}
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
					$(document.body).emit('pxchange', [index, b])
				}
			}
		}
	},

	save = function () {
		$.hash(pickle()); //change hash value (generates new history record)
		var icon = $("#favicon").get(0);
		(newIcon = icon.cloneNode(true)).setAttribute('href',$("canvas.zoom1").get(0).toDataURL());
		icon.parentNode.replaceChild(newIcon,icon);
	}

	hashchange = function (newHash){
		// var h = hasher.getHashAsArray()
	};

	hashinit = function (newHash){
		unpickle(newHash);
	};


	init();
});
