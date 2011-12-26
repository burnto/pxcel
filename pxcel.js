if (typeof window.console === 'undefined' || !console.log) {
	window.console = {
		log: function() {}
	};
}
var px = {};
px.palette = (function() {

	var swatchSize = 20,
		swatchBorder = 1,
		swatchOffset = swatchSize + swatchBorder,
		selected = 0,
		ctx;
	
	var draw = function() {
		var d = dimensions();
		for(var i = 0; i < palette.colors.length; i++) {
			var y = Math.floor(i / d.width);
			var x = i % d.width;
			var c = palette.colors[i];
			ctx.fillStyle = c;
			ctx.fillRect(x * swatchOffset, y * swatchOffset, swatchSize, swatchSize);
			if (i === selected) {
				console.log(c);
				if (ctx.fillStyle === '#ffffff') {
					ctx.fillStyle = "gray";
				} else {
					ctx.fillStyle = "white";
				}
			    ctx.beginPath();  
			    ctx.moveTo(x * swatchOffset + swatchSize, y * swatchOffset + swatchSize); 
			    ctx.lineTo(x * swatchOffset + swatchSize - 6, y * swatchOffset + swatchSize);  
			    ctx.lineTo(x * swatchOffset + swatchSize, y * swatchOffset + swatchSize - 6);  
			    ctx.fill();
			}
		}
	},

	dimensions = function () {
		var d = $(ctx.canvas).dim();
		return {
			width: Math.floor(d.width / swatchOffset),
			height: Math.floor(d.height / swatchOffset)
		}
	},

	getIndex = function (e) {
		var d = dimensions();
		var mouseY = Math.min(e.offsetY, d.height * swatchOffset),
			mouseX = Math.min(e.offsetX, d.width * swatchOffset);
		return Math.floor(mouseY / swatchOffset) * d.width + Math.floor(mouseX / swatchOffset);
	},

	click = function(e) {
		var d = dimensions();
		selected = getIndex(e);
		var color = palette.colors[selected];
		console.log(selected);
		$(ctx.canvas).emit('palette.colorselect', color);
		draw()
	}

	var palette = {
		colors: ["#7C7C7C", "#0000FC", "#0000BC", "#4428BC", "#940084", "#A80020", "#A81000", "#881400", "#503000", "#007800", "#006800", "#005800", "#004058", "#000000", "#000000", "#000000", "#BCBCBC", "#0078F8", "#0058F8", "#6844FC", "#D800CC", "#E40058", "#F83800", "#E45C10", "#AC7C00", "#00B800", "#00A800", "#00A844", "#008888", "#000000", "#000000", "#000000", "#F8F8F8", "#3CBCFC", "#6888FC", "#9878F8", "#F878F8", "#F85898", "#F87858", "#FCA044", "#F8B800", "#B8F818", "#58D854", "#58F898", "#00E8D8", "#787878", "#000000", "#000000", "#FCFCFC", "#A4E4FC", "#B8B8F8", "#D8B8F8", "#F8B8F8", "#F8A4C0", "#F0D0B0", "#FCE0A8", "#F8D878", "#D8F878", "#B8F8B8", "#B8F8D8", "#00FCFC", "#F8D8F8", "#000000", "#000000"],
		init: function (canvas) {
			var canvas = $(canvas);
			ctx = $(canvas).get(0).getContext('2d');
			draw(this);
			$(canvas).mousedown(click);
			$(canvas).emit('palette.colorselect', this.colors[0]);
		}
	}
	return palette;
}())

$.domReady(function() {
	
	// init variables

	var	alphabet = "_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-",
		zoom = 25,
		size = 16,
		numPreviews = 2,
		values = [],
		pen = null,
		drawing = false,
		erasing = false,	
		title = document.title,
		context;

	
	// functions

	var init = function () {

		var canvas = document.getElementById("canvas");
		context = canvas.getContext("2d");

		for (var i = 0; i < size * size; i++) {
			values.push('');
		}

		// draw events
		$(canvas).on('mousedown', mousedown);
		$(canvas).on('mousemove', mousemove);
		$(document).on('mouseup', mouseup);

		$("#fill").click(fill);
		$("#clear").click(clear);
		$("#invert").click(invert);
		$("#download").click(download);

		// custom events
		$(document.body).on('pxchange', setPixel);

		$(window).on('hashchange', hashchange);
		hashchange($.hash())

		clear();

		$('canvas.palette').on('palette.colorselect', function (c) {
			pen = c;
		});
		px.palette.init($('canvas.palette'));
	},

	fill = function (e) {
		for (var i = 0; i < values.length; i++) {
			if (values[i] !== false) {
				values[i] = false;
				$(document.body).emit('pxchange', [i, "rgba(0,0,0,0)"]);
			}
		}
		save();
		e.preventDefault();
		e.stopPropagation();
		
	},

	clear = function (e) {
		for (var i = 0; i < values.length; i++) {
			if (values[i] !== false) {
				values[i] = "rgba(0,0,0,0)";
				$(document.body).emit('pxchange', [i]);
			}
		}
		save();
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
	},

	invert = function (e) {
		for (var i = 0; i < values.length; i++) {
			values[i] = !values[i];
			$(document.body).emit('pxchange', [i]);
		}
		save();
		e.preventDefault();
		e.stopPropagation();
	},

	mousedown = function (e) {
		var i = getIndex(e);
		drawing = true;
		if (pen === values[i]) {
			erasing = true;
			values[i] = 'transparent'
		} else {		
			values[i] = pen;
		}
		$(document.body).emit('pxchange', [i]);
		$("#previews").css({display: 'block'});
	},

	mousemove = function (e) {
		if (drawing) {
			var i = getIndex(e);
			if (erasing) {
				values[i] = 'transparent';
			} else if (values[i] !== pen) {
				values[i] = pen;
			}
			$(document.body).emit('pxchange', [i])
		}		
	},

	mouseup = function (e) {
		drawing = false;
		erasing = false;
		save();
	},

	getIndex = function (e) {
		var mouseY = Math.min(e.offsetY, size * zoom),
				mouseX = Math.min(e.offsetX, size * zoom);
		return Math.floor(mouseY / zoom) * size + Math.floor(mouseX / zoom)
	},

	setPixel = function (i) {
		var x = i % size;
		var y = Math.floor(i / size);
		var v = values[i];
		context.fillStyle = v;
		var method = 'fillRect';
		context.clearRect(x * zoom, y * zoom, zoom, zoom);
		context.fillRect(x * zoom, y * zoom, zoom, zoom);
		for (var z = 1; z < numPreviews + 1; z++) {
			var c = $("canvas.preview.zoom" + z).get(0);
			if (c) {
				var ctx = c.getContext('2d');
				ctx.fillStyle = context.fillStyle;
				ctx.clearRect(x * z, y * z, z, z);
				ctx.fillRect(x * z, y * z, z, z);
			}
		}
	},

	updateFavicon = function () {
		var oldLink = document.getElementById('favicon');
		var link = oldLink.cloneNode(true);
		var img = document.createElement('img');
		link.href = $('canvas.zoom1').get(0).toDataURL('image/png');
		oldLink.parentNode.replaceChild(link, oldLink);
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
		updateFavicon();
	},

	save = function () {
		var newHash = pickle() + "/" + title;
		$.hash(newHash); //change hash value (generates new history record)
		updateFavicon();
		$("#download").attr('href', $("canvas.zoom1").get(0).toDataURL());
	}

	hashchange = function (){
	    var hash = $.hash().split('/', 2);
	    if (hash.length > 1) {
	    	title = hash[1].replace(/(<|>)/g, '').replace(/_/g, ' ');
	    	document.title = title;
	    	$("h1").text(title);
	    }
		unpickle(hash[0]);
		$("#download").attr('href', $("canvas.zoom1").get(0).toDataURL());
	};


	init();
});