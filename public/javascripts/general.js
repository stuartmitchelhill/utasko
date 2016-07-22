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
        format: 'dd mmm yyyy',
        max: 100,
        min: true,
        selectYears: false,
        selectMonths: false,
        today: false,
        clear: false,
        close: false,
        
    });
    
    //* Fancy Box *//
    $(".fancybox").fancybox({
      'closeBtn' : false,
      'padding' : 0,
      'transitionIn'	: 'elastic',
      'transitionOut'	: 'elastic'
    });
    
    $(".fancybox-popup .popup-close").click(function(){
        $.fancybox.close();
    });
    
    //* View Logic *//
    $('.files-trigger').click(function(){
        $('.conversation ').hide();
        $('.chat-trigger').show();
        $('.files').show();
        $('.files-trigger').hide();
        
    });
    
     $('.chat-trigger').click(function(){
        $('.conversation ').show();
        $('.chat-trigger').hide();
        $('.files').hide();
        $('.files-trigger').show();
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
    
    
    //* Task Header Dynamic Colour *//
    $('.task').each(function() {
       $(this).find('.task-header').addClass($(this).attr('data-value')); 
    });    
    
    
    //* Task Requirments Complete *//
    $('.task-requirment').click(function(){
       $(this).addClass('complete'); 
    });
    
});
