$(function() {
    
    //* Slide Menu *//
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
    
    
    //* Date Picker *//
    $('.pickadate').pickadate({
        format: 'dd/mm/yy',
        max: 100,
        min: true,
        selectYears: false,
        selectMonths: false,
        today: false,
        clear: false,
        close: false,
        
    });
    
    //* Task Expand *//
    
    $('.task .task-header').click(function(){
		var $header = $(this),
			$task = $header.closest('.task'),
			$taskExpand = $task.find('.task-info'),
      		$icon = $header.find('.task-toggle i'),
      		$info = $header.find('.task-quick-info')
      
        
		$icon.toggleClass("ut-plus ut-minus");
		$taskExpand.slideToggle();
        $header.toggleClass('open');
		$info.slideToggle('disabled');
	});
    
    //* Task Options Expand *//
    
    $('.task .task-options').click(function(){
		var $toggle = $(this),
			$options = $toggle.closest('.task'),
			$optionsExpand = $options.find('.task-options-expanded')
        
		$optionsExpand.slideToggle();
	});
    
    
    var pinkA = '#A53695';
    var pinkB = '#B73D97';
    var pinkC = '#C34599';
    var pinkD = '#DD54A1';
    var purple = '#952B90';
    
    if($('.task').attr('data-value') == pinkA){
        $(this).closest('.task-header').addClass('pinkA');
    } else if ($('.task').attr('data-value') == pinkB){
        $(this).closest('.task-header').addClass('pinkA');
    } else if ($('.task').attr('data-value') == pinkC){
        $(this).closest('.task-header').addClass('pinkA');
    } else if ($('.task').attr('data-value') == pinkD) {
        $(this).closest('.task-header').addClass('pinkA');
    } else if($('.task').attr('data-value') == purple) {
        $(this).closest('.task-header').addClass('pinkA');
    }
    
    
});
