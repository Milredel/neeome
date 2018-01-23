(function($) {
  "use strict"; // Start of use strict

  var JsVars = $('#js-vars').data('vars');

  var channels = JsVars.channels;
  var timetable = new Timetable();
  var lines = Array();
  for (var prop in channels) {
    var channel = channels[prop];
    channel.title = channel.name;
    lines.push(channel);
    channel.logo_url = "http://mafreebox.freebox.fr"+(channel.logo_url);
    channel.id = channel.name;
  }
  timetable.setScope(0, 24);
  timetable.addLocations(lines);
  var startDate = new Date();
  var startCopy = new Date(+startDate);
  var endDate = new Date(startCopy.setMinutes(startCopy.getMinutes()+1));
  timetable.addEvent("now", "all", startDate, endDate);
  var renderer = new Timetable.Renderer(timetable);
  renderer.setOptions({defaultCycleNumber: 3});
  renderer.draw('.timetable');

  $('.channel-timeline').each(function(index, elem) {
    if($(elem).visible()) {
      loadProgram($(elem).data('channel-uuid'));
    }
  })

  function loadProgram(channelUuid, start, end) {
    var url = "/tv/guide/program/"+channelUuid+"/?token="+JsVars.private_token;
    $.get(url,
          {},
          function(response) {
            $('li.channel-timeline[data-channel-uuid="'+channelUuid+'"]').addClass('init-loaded');
            var location = $('li.channel-timeline[data-channel-uuid="'+channelUuid+'"]').data('channel-name');
            var events = [];
            for (var index in response) {
              var event = response[index];
              event.location = location;
              events.push(event);
            }
            renderer.insertEvent(events);
            $('.container.timetable section')[0].removeEventListener('scroll', myEfficientFn2);
            $('.container.timetable section')[0].addEventListener('scroll', myEfficientFn2);
            checkHorizontalVisibilityAndLoad();
          }
    ).fail(function(xhr, textStatus, errorThrown) {
        console.log(xhr);
    });
  }

  function debounce(func, wait, immediate) {
      var timeout;
      return function() {
          var context = this, args = arguments;
          var later = function() {
              timeout = null;
              if (!immediate) func.apply(context, args);
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
      };
  };

  var myEfficientFn = debounce(function() {
    $('.channel-timeline').each(function(index, elem) {
      if($(elem).visible(true) && !$(elem).hasClass('init-loaded')) {
        loadProgram($(elem).data('channel-uuid'));
      }
    })
  }, 500);

  var myEfficientFn2 = debounce(function() {
    checkHorizontalVisibilityAndLoad();
  }, 500);

  function checkHorizontalVisibilityAndLoad() {
    $('.channel-timeline').each(function(index, elem) {
      if($(elem).attr("title") != "now") {
        var $firstItem = $(elem).find('span.time-entry:eq(1):not([title="now"])');
        if($firstItem.visible(true)) {
          prependProgram($(elem).data('channel-uuid'), $firstItem.data("start"));
        }
        var $lastItem = $(elem).find('span.time-entry:last:not([title="now"])');
        if($lastItem.visible(true)) {
          appendProgram($(elem).data('channel-uuid'), $lastItem.data("end"));
        }
      }
    });
  }

  function prependProgram(channel, begin) {
    console.log("begin : "+channel+" - "+begin);
  }

  function appendProgram(channel, end) {
    console.log("end : "+channel+" - "+end);
  }

  window.addEventListener('scroll', myEfficientFn);

})(jQuery); // End of use strict