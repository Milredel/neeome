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
                console.log(response);
           }
    ).fail(function(xhr, textStatus, errorThrown) {
        console.log(xhr);
    });
  }

})(jQuery); // End of use strict