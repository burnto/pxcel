hashchange
==========

Cross-browser hashchange event support for Ender:

    $.hash('newhash');
    $(window).add('hashchange', function () {
        var hash = $.hash();
        // Do things...
    });

    
Usage with Ender
----------------
After you install [Ender](http://ender.no.de), include `hashchange` in your package:

    ender add hashchange
