(function($) {
  "use strict"; // Start of use strict

  var JsVars = $('#js-vars').data('vars');

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
      $('.container.active-recipe').off('click').on('click', onClickActiveRecipeBanner);
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
      $.get("/neeo/load/commands/recipe/"+$(this).attr("data-recipe-id")+'?token='+JsVars.private_token, function(data) {
        $('#commands .sub-container').html(data);
        $('a[data-link]').off('click').on('click', onClickAWithLink);
        $('.block-title.collapsable').off('click').on('click', onClickBlockTitle);
      });
    } else {
      $.get( $(this).attr("data-link"), function() {
        //ok, action performed
      });
    }
  }

  function onClickBlockTitle() {
    $(this).parent().find('.container').first().toggle();
  }

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    $('#commands .sub-container').html("");
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

  $('.active-recipe .navbar-brand').on('click', onClickActiveRecipeBanner);

  function onClickActiveRecipeBanner() {
    var loader = "<i class='fa fa-spinner fa-spin fa-5x'></i>";
    $('#commands .sub-container').html(loader);
    $('html, body').animate({
      scrollTop: ($('#commands').offset().top - 48)
    }, 1000, "easeInOutExpo");
    $.get("/neeo/load/commands/recipe/"+$(this).parent().attr("data-recipe-id")+'?token='+JsVars.private_token, function(data) {
      $('#commands .sub-container').html(data);
      $('a[data-link]').off('click').on('click', onClickAWithLink);
      $('.block-title.collapsable').off('click').on('click', onClickBlockTitle);
    });
  }

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
        var hex = (color.toHEXString()).replace("#", "");
        $.post('/light/'+lightId+'?token='+JsVars.private_token,
          {
            hex: hex
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

})(jQuery); // End of use strict