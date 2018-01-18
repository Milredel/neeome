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
  timetable.addEvent('Frankadelic', 'TF1', new Date(2018,0,18,16,0), new Date(2018,0,18,16,45));
  timetable.addEvent('Frankadelic2', 'TF1', new Date(2018,0,18,16,45), new Date(2018,0,18,18,15));
  timetable.addEvent('Frankadelic2', 'TF1', new Date(2018,0,18,0,45), new Date(2018,0,18,1,30));
  var renderer = new Timetable.Renderer(timetable);
  renderer.setOptions({defaultCycleNumber: 3});
  renderer.draw('.timetable');

})(jQuery); // End of use strict