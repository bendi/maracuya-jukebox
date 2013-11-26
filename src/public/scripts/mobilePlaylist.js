define(['common', 'mbusRouter'], function(common, router) {
	
  var currentPlaylistId = 1,
  	isPageLoading,
  	PAGE_SIZE = 10;

  function load(page) {
    isPageLoading = true;
    return $.get('/playlist/' + currentPlaylistId, {pageSize:PAGE_SIZE, page: page, rand: Math.round(Math.random()*100000)})
      .fail(function() {
        isPageLoading = false;
      });
  }
  
  function _displayTracks(pageSize, pagedRes, append, back) {
  }

  var homeUrl, currentTrackId;
  
  return {
    init: function(mBus_, homeUrl_) {
    	homeUrl = homeUrl_;
    	
    	$(document).on('vclick', '#playlist a', function(e) {
    		e.preventDefault();
		    router.notify('play', {id:$(this).data('id')});
		    
		    $('#playlist li[data-theme="b"]')
		    	.attr("data-theme", "c")
		    	.removeClass("ui-btn-up-b")
		    	.removeClass('ui-btn-hover-b')
		    	.addClass("ui-btn-up-c")
		    	.addClass('ui-btn-hover-c');
		    
		    $(this)
		    	.parents('li')
		    	.attr("data-theme", "b")
		    	.removeClass("ui-btn-up-c")
		    	.removeClass('ui-btn-hover-c')
		    	.addClass("ui-btn-up-b")
		    	.addClass('ui-btn-hover-b');
		    
    		return false;
    	});
    },
    setCurrentPlaylistId: function(id) {
    },
    load: load,
    destroy: function() {
    },
    displayTracks: function(pageSize, pagedRes, append, back) {
    	$(document).one('pageshow', '#player', function() {
	    	_.each(pageSize.items, function(item) {
	    		var listItem = $('<li><a href="#" data-id="' + item.id + '">' + common.title(item) + '</a></li>');
	    		if (item.id === currentTrackId) {
	    			listItem.attr('data-theme', 'b');
	    		}
	    		listItem.appendTo('#playlist');
	    	});
	    	
    		$('#playlist').listview('refresh');
    	});
    },
    updateCurrentTrack: function(trackId) {
    	currentTrackId = trackId;
    },
    stop: function() {
    	
    }
  };
});