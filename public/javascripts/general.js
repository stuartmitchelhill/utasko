$(function() {
    //* Slide Menu *//
    $( ".menu-trigger" ).click(function() {
  		$( ".slide-menu" ).toggleClass("open");
        $(this).find("i").toggleClass("ut-more-vert ut-close");
        $(".overlay").toggleClass('cover');
  	});

  	 //* Add User Select*//
    $('.add-user').click(function(){
        $($( ".users" ).children()[0]).clone().appendTo( ".users" );
    });
    
    //* Date Picker *//
    $('.pickadate').pickadate({
        format: 'dd mmm yyyy',
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
    
    //* Sidebar Tabs *//
    $('.files-trigger').click(function(){
        $('.files').show();
        $('.conversation ').hide();
        $('.repo').hide();
        
    });
    $('.chat-trigger').click(function(){
        $('.conversation ').show();
        $('.files').hide();
        $('.repo').hide();
    });
    $('.repo-trigger').click(function(){
        $('.repo').show();
        $('.files').hide();
        $('.conversation ').hide();
    });
    
    //* Mobile Tabs *//
    $('.tasks-trigger-mobile').click(function(){
        $('.tasks').show();
        $('.files').hide();
        $('.conversation ').hide();
        $('.repo').hide();
    });
    $('.chat-trigger-mobile').click(function(){
        $('.conversation ').show();
        $('.files').hide();
        $('.repo').hide();
        $('.tasks').hide();
    });
    $('.files-trigger-mobile').click(function(){
        $('.files').show();
        $('.conversation ').hide();
        $('.repo').hide();
        $('.tasks').hide();
    });
    $('.repo-trigger-mobile').click(function(){
        $('.repo').show();
        $('.conversation ').hide();
        $('.files').hide();
        $('.tasks').hide();
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
			$optionsExpand = $options.find('.task-options-expanded');
        
		$optionsExpand.slideToggle();
	});
    
    
    //* Task Header Dynamic Colour *//
    $('.task').each(function() {
       $(this).find('.task-header').addClass($(this).attr('data-value')); 
    });
    
    //* Add Task Requirment Field *//
    $('.add-textarea').click(function(){
        $(this).closest('.form-button').addClass('half');
        
        $('.remove-button').removeClass('hidden');
        
        var newTextBoxDiv = $(document.createElement('div')).attr("class", 'requirement-field');
        
        newTextBoxDiv.after().html('<textarea type="text" name="task[requirement][]" id="task-requirement" placeholder="Enter Task Requirement (optional)"></textarea>');
        
        newTextBoxDiv.appendTo(".requirements"); 
    });
    
    //* Remove Task Requirement Field *//
    $(document).on('click touch', '.remove-textarea', function(){
        console.log('finding field');
        var $removeField = $('.remove-textarea').parent().parent().find('.requirement-field')[$('.remove-textarea').parent().parent().find('.requirement-field').length - 1];
        $removeField.remove();
    });
    
    
    //* Task Requirments Complete *//
    $('.task-requirement').click(function(){
       $(this).addClass('complete');
        socket.emit('req_complete', {id: $(this).data('reqid')});    
    });
    
    //* Task Complete *//
    $('.task-complete').click(function(){
        var $task = $(this).closest('.task');
        var $taskExpand = $task.find('.task-info');
        var $taskInfo = $task.find('.task-quick-info');
        $task.addClass('complete');
        $(this).hide();
        $task.find('.unmark-task-complete').show();
        $taskExpand.slideToggle();
        $taskInfo.slideToggle();
        console.log($(this).data('taskid'));
        socket.emit('task_complete', {id: $(this).data('taskid')}); 
    });
    
    //* Unmark Task Complete *//
    $('.unmark-task-complete').click(function(){
        var $task = $(this).closest('.task');
        $task.removeClass('complete');
        $(this).hide();
        $task.find('.task-complete').show();
        socket.emit('task_unmark', {id: $(this).data('taskid')}); 
    });
    
    //* Custom File Icon *//
    $('.file').each(function(){
        $(this).find('.file-icon').addClass('ut-file-' + $(this).attr('data-value')); 
    })
});
