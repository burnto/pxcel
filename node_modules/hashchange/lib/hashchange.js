var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
(function(hashchange) {
  var Fragment, HashEvent, HashIFrame, HashTimer, IFragment, fragment, ifragment, impl;
  fragment = new (Fragment = (function() {
    function Fragment() {}
    Fragment.prototype.get = function(win) {
      var hash;
      if (win == null) {
        win = window;
      }
      hash = win.location.hash.replace(/^#/, '');
      return this.decode(hash);
    };
    Fragment.prototype.set = function(hash, win) {
      if (win == null) {
        win = window;
      }
      return win.location.hash = this.encode(hash);
    };
    Fragment.prototype.encode = function(hash) {
      return encodeURI(hash).replace(/#/, '%23');
    };
    Fragment.prototype.decode = function(hash) {
      try {
        if ($.browser.firefox) {
          return hash;
        } else {
          return decodeURI(hash.replace(/%23/, '#'));
        }
      } catch (e) {
        return hash;
      }
    };
    return Fragment;
  })());
  ifragment = new (IFragment = (function() {
    function IFragment() {}
    IFragment.prototype._id = "__history";
    IFragment.prototype.init = function() {
      this.iframe = $('<iframe src="javascript:false" />');
      this.iframe.attr('id', this._id);
      this.iframe.css('display', 'none');
      return $('body').prepend(this.iframe);
    };
    IFragment.prototype.set = function(hash) {
      this.iframe.contentDocument.open();
      this.iframe.contentDocument.close();
      return fragment.set(hash, this.iframe.contentWindow);
    };
    IFragment.prototype.get = function() {
      return fragment.get(this.iframe.contentWindow);
    };
    return IFragment;
  })());
  HashTimer = (function() {
    HashTimer.prototype.delay = 100;
    function HashTimer() {
      $(document).ready(__bind(function() {
        return this._init();
      }, this));
    }
    HashTimer.prototype._init = function() {
      this.hash = fragment.get();
      return $.doTimeout(this.delay, __bind(function() {
        return this.check();
      }, this));
    };
    HashTimer.prototype._check = function() {
      var hash;
      hash = fragment.get();
      if (hash !== this.hash) {
        this.hash = hash;
        $(window).fire('hashchange');
      }
      return true;
    };
    HashTimer.prototype.set = function(hash) {
      if (hash !== this.hash) {
        fragment.set(hash);
        this.hash = hash;
        return $(window).fire('hashchange');
      }
    };
    return HashTimer;
  })();
  HashIFrame = (function() {
    __extends(HashIFrame, HashTimer);
    function HashIFrame() {
      HashIFrame.__super__.constructor.apply(this, arguments);
    }
    HashIFrame.prototype._init = function() {
      HashIFrame.__super__._init.call(this);
      ifragment.init();
      return ifragment.set(this.hash);
    };
    HashIFrame.prototype._check = function() {
      var hash, ihash;
      hash = fragment.get();
      ihash = ifragment.get();
      if (hash !== ihash) {
        if (hash === this.hash) {
          this.hash = ihash;
          fragment.set(this.hash);
        } else {
          this.hash = hash;
          ifragment.set(this.hash);
        }
        $(window).fire('hashchange');
      }
      return true;
    };
    HashIFrame.prototype.set = function(hash) {
      if (hash !== this.hash) {
        ifragment.set(hash);
        return HashIFrame.__super__.set.call(this, hash);
      }
    };
    return HashIFrame;
  })();
  HashEvent = (function() {
    function HashEvent() {}
    HashEvent.prototype.set = function(hash) {
      return fragment.set(hash);
    };
    return HashEvent;
  })();
  if ('onhashchange' in window) {
    impl = new HashEvent;
  } else if ($.browser.msie && $.browser.version < 8) {
    impl = new HashIframe;
  } else {
    impl = new HashTimer;
  }
  return hashchange.hash = function(hash) {
    if (hash != null) {
      return impl.set(hash);
    } else {
      return fragment.get();
    }
  };
})(typeof exports !== "undefined" && exports !== null ? exports : (this['hashchange'] = {}));