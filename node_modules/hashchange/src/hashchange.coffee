((hashchange) ->
    # Singletons
    fragment = new class Fragment
        get: (win=window) ->
            hash = win.location.hash.replace(/^#/, '')
            return @decode(hash)

        set: (hash, win=window) -> win.location.hash = @encode(hash)
        encode: (hash) -> encodeURI(hash).replace(/#/, '%23')
        decode: (hash) ->
            try
                if $.browser.firefox
                    return hash
                else
                    return decodeURI(hash.replace(/%23/, '#'))
            catch e
                return hash
    
    ifragment = new class IFragment
        _id: "__history"
        init: () ->
            @iframe = $('<iframe src="javascript:false" />')
            @iframe.attr('id', @_id)
            @iframe.css('display', 'none')
            $('body').prepend(@iframe)
            
        set: (hash) ->
            @iframe.contentDocument.open()
            @iframe.contentDocument.close()
            fragment.set(hash, @iframe.contentWindow)

        get: () -> fragment.get(@iframe.contentWindow)

    
    # Implementations
    class HashTimer
        delay: 100
        constructor: () -> $(document).ready () => @_init()
        _init: () ->
            @hash = fragment.get()
            $.doTimeout(@delay, () => @check())

        _check: () ->
            hash = fragment.get()
            if hash != @hash
                @hash = hash
                $(window).fire('hashchange')

            return true

        set: (hash) ->
            if hash != @hash
                fragment.set(hash)
                @hash = hash
                $(window).fire('hashchange')


    class HashIFrame extends HashTimer
        _init: () ->
            super()
            ifragment.init()
            ifragment.set(@hash)

        _check: () ->
            hash = fragment.get()
            ihash = ifragment.get()

            if hash != ihash
                if hash == @hash        # Back or Forward
                    @hash = ihash
                    fragment.set(@hash)
                else                    # Bookmark or Link
                    @hash = hash
                    ifragment.set(@hash)
                
                $(window).fire('hashchange')
            
            return true

        set: (hash) ->
            if hash != @hash
                ifragment.set(hash)
                super(hash)
        
        
    class HashEvent
        set: (hash) -> fragment.set(hash) 
    

    if 'onhashchange' of window
        impl = new HashEvent
    else if $.browser.msie and $.browser.version < 8
        impl = new HashIframe
    else 
        impl = new HashTimer
    
    hashchange.hash = (hash) -> (if hash? then impl.set(hash) else fragment.get())
    
)(exports ? (@['hashchange'] = {}))
