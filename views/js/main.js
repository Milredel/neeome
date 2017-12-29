(function($) {
  "use strict"; // Start of use strict

  var socket = io();
 
  socket.on('brain update recipe', function(event){
    var recipe = event.recipe;
    if (false == recipe.isPoweredOn) {
      $('#subNav .container#'+recipe.uid).remove();
    } else {
      var banner = "<div class='container' id='"+recipe.uid+"'\
                      <a class='navbar-brand'>"+recipe.detail.devicename+"</a>\
                      <div class='mycollapse'>\
                        <ul class='navbar-nav ml-auto'>";
      if (recipe.url.volumeDown != undefined) {
        banner += "<li class='nav-item'>\
                    <a data-link='"+recipe.url.volumeDown+"'>\
                      <i class='fa fa-volume-down fa-lg'></i>\
                    </a>\
                  </li>";
      }
      if (recipe.url.muteToggle != undefined) {
        banner += "<li class='nav-item'>\
                    <a data-link='"+recipe.url.muteToggle+"'>\
                      <i class='fa fa-volume-off fa-lg'></i>\
                    </a>\
                  </li>";
      }
      if (recipe.url.volumeUp != undefined) {
        banner += "<li class='nav-item'>\
                    <a data-link='"+recipe.url.volumeUp+"'>\
                      <i class='fa fa-volume-up fa-lg'></i>\
                    </a>\
                  </li>";
      }
      banner += "<i class='fa fa-power-off fa-lg'></i>\
                </ul>";
      $('#subNav').append(banner);
      $('a[data-link]').off('click').on('click', onClickAWithLink);
    }
  });

  $('a[data-link]').on('click', onClickAWithLink);

  function onClickAWithLink() {
    if ($(this).hasClass("launch")) {
      var loader = "<i class='fa fa-spinner fa-spin fa-5x'></i>";
      $('#commands .sub-container').html(loader);
      $('html, body').animate({
        scrollTop: ($('#commands').offset().top - 48)
      }, 1000, "easeInOutExpo");
      $.get("/neeo/load/commands/recipe/"+$(this).attr("data-recipe-id"), function(data) {
        $('#commands .sub-container').html(data);
      });
    } else {
      $.get( $(this).attr("data-link"), function() {
        //ok, action performed
      });
    }
  }

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