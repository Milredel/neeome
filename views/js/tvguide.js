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
      if($(elem).visible() && !$(elem).hasClass('init-loaded')) {
        loadProgram($(elem).data('channel-uuid'));
      }
    })
  }, 500);

  window.addEventListener('scroll', myEfficientFn);

})(jQuery); // End of use strict