(function($) {
  "use strict"; // Start of use strict

  var JsVars = $('#js-vars').data('vars');
  
  $('#exampleModalCenter').on('shown.bs.modal', function () {
    $.get('/render/lights/all/?token='+JsVars.private_token, function(data) {
      $('.modal-body').html(data);
      $('.slider.round').off('click').on('click', onClickLightSwitch);
      $('.brightness-range-input').off('input').on('input', onInputBrightnessRange);
      $('.color-light').off('click').on('click', onClickColorLight);
    });
  })

  function onClickLightSwitch() {
    var that = $(this);
    var lightId = $(this).parents(".light-item").first().attr("id");
    var newState = !$(this).parent().find('input').is(':checked');
    $.post('/light/'+lightId+'?token='+JsVars.private_token,
      {
        on: newState
      },
      function(data){
        if (false == newState) {
          that.parents('.light-item').first().find('.brightness-container').hide();
        } else {
          that.parents('.light-item').first().find('.brightness-container').show();
        }
      },
      "json"
    ).fail(function(xhr, textStatus, errorThrown) {
        console.log(xhr);
    });
  }

  function onInputBrightnessRange() {
    var that = $(this);
    var lightId = $(this).parents(".light-item").first().attr("id");
    var brightnessValue = $(this).val();
    $.post('/light/'+lightId+'?token='+JsVars.private_token,
      {
        brightness: brightnessValue
      },
      function(data){
        
      },
      "json"
    ).fail(function(xhr, textStatus, errorThrown) {
        console.log(xhr);
    });
  }

  var color;

  function onClickColorLight() {
    var $parentItem = $(this).parents(".light-item").first();
    var lightId = $parentItem.attr("id");
    var $styleElement = $parentItem.find('input.brightness-range-input');
    var styleElement = $styleElement[0];
    var rgb = getRGB($styleElement.css("backgroundColor"));
    if (color == undefined) {
      var options = {
          valueElement: null,
          width: 300,
          height: 120,
          sliderSize: 20,
          position: 'top',
          borderColor: '#CCC',
          insetColor: '#CCC',
          backgroundColor: '#202020',
          zIndex: 10000,
          styleElement: styleElement
      };
      color = new jscolor($(this).last()[0], options);
      color.onFineChange = function() {
        var rgb = getRGB(color.toRGBString());
        $.post('/light/'+lightId+'?token='+JsVars.private_token,
          {
            rgb: rgb
          },
          function(data){
            
          },
          "json"
        ).fail(function(xhr, textStatus, errorThrown) {
            console.log(xhr);
        });
      }
      color.fromRGB(rgb.red, rgb.green, rgb.blue, false);
    }
    color.show();
  }

  function getRGB(str){
    var match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
    return match ? {
      red: match[1],
      green: match[2],
      blue: match[3]
    } : {};
  }

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