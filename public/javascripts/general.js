$(function() {
    $( ".menu-trigger" ).click(function() {
  		$( ".slide-menu" ).toggleClass("open");
  	});

  	$('.search-container .search-trigger').click(function() {
        $(this).closest('active');
        $('.search-bar').toggleClass('active', function(){
            $(this).find('input')[0].focus(); 
        });
    });
});