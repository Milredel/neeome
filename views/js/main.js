(function($) {
  "use strict"; // Start of use strict

  var socket = io();
 
  socket.on('brain update recipe', function(event){
      if (false == event.newState) {
        $('#subNav .container#'+event.uid).remove();
      } else {
        var banner = "<div class='container' id='"+event.uid+"'\
                        <a class='navbar-brand'>"+event.devicename+"</a>\
                        <div>\
                          <p class='navbar-nav ml-auto'>\
                              <i class='fa fa-power-off fa-lg'></i>";
        $('#subNav').append(banner);
      }
  });

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {

    if ($(this).hasClass('load')) {
      $('section#scenarios .container>div').addClass("hidden");
      $('section#scenarios .container div#'+$(this).attr('data-room-id')).removeClass("hidden");
    }
    
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 48)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }  
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 54
  });

  // Collapse Navbar
  var navbarCollapse = function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav, #subNav").addClass("navbar-shrink");
    } else {
      $("#mainNav, #subNav").removeClass("navbar-shrink");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);

})(jQuery); // End of use strict