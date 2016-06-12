$(function() {
    $( ".menu-trigger" ).click(function() {
  		$( ".slide-menu" ).toggleClass("open");
        $(this).find("i").toggleClass("ut-more-vert ut-close");
        $(".overlay").toggleClass('cover');
  	});

  	/*$('.search-container .search-trigger').click(function() {
        $(this).closest('active');
        $('.search-bar').toggleClass('active', function(){
            $(this).find('input')[0].focus(); 
        });
    });*/
});

$(function(){

	$('.task .task-header').click(function(){
		var $header = $(this),
			$task = $header.closest('.task'),
			$taskExpand = $task.find('.task-info'),
      		$icon = $header.find('.task-toggle i');
      		$info = $header.find('.task-quick-info');
      
        
		$icon.toggleClass("ut-plus ut-minus"),
		$taskExpand.slideToggle();
		$task.toggleClass('open');
		$info.slideToggle('disabled');
	});
	
});