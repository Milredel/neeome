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
  renderer.setOptions({defaultCycleNumber: 8});
  renderer.draw('.timetable');

  function loadProgram(channels, start) {
    var url = "/tv/guide/channels/?token="+JsVars.private_token;
    $.get(url,
          {
            channels: channels,
            begin: start
          },
          function(response) {
            var events = [];
            for (var channel in response) {
              var location = $('li.channel-timeline[data-channel-uuid="'+channel+'"]').data('channel-name');  
              for (var index in response[channel]) {
                var event = response[channel][index];
                event.location = location;
                events.push(event);
              }  
            }
            renderer.insertEvent(events);
            $('.channel-button').off('click').on('click', onClickChannelButton);
          }
    ).fail(function(xhr, textStatus, errorThrown) {
        console.log(xhr);
    });
  }

  function onClickChannelButton() {
    var link = "/neeo/freebox?token="+JsVars.private_token+"&channel="+$(this).data("number");
    $.get(link);
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

  function getCurrentOffsetEpochTime() {
    var $container = $('.container.timetable');
    var $section = $container.find('section');
    var $nowEvent = $(".time-entry[title='now']:first");
    var nowOffset = $nowEvent.css('left').replace("px", "");
    var nowEpoch = ((new Date()).getTime()/1000.0).toFixed(0);    
    var oneHourWidthPercent = 1 / (24*$container.find('.header-days').length)*100;
    var oneHourWidthPixel = $section.find("time")[0].offsetWidth*parseFloat(oneHourWidthPercent)/100;
    var now = new Date();
    var begin = new Date(now.getFullYear(), now.getMonth(), now.getDate()-2, 0, 0, 0);
    var beginEpoch = (begin.getTime()/1000).toFixed(0);
    var currentOffset = Math.abs($section.find('time').offset().left - $section.offset().left - 200);
    var toto = currentOffset*(nowEpoch-beginEpoch)/nowOffset;
    var currentEpoch = (parseFloat(toto)+parseFloat(beginEpoch)).toFixed(0);
    return {currentOffset : currentOffset, currentEpoch: currentEpoch};
  }

  var myEfficientFn = debounce(function() {
    var currentEpoch = getCurrentOffsetEpochTime().currentEpoch;
    
    $('.channel-timeline').each(function(index, elem) {
      if($(elem).visible(true)) {
        loadProgram([$(elem).data('channel-uuid')], currentEpoch);
      }
    })
  }, 500);

  function myFunction() {
    var $container = $('.container.timetable');
    var $section = $container.find('section');
    var currentEpoch = getCurrentOffsetEpochTime().currentEpoch;
    var currentOffset = getCurrentOffsetEpochTime().currentOffset;
    var date = new Date(currentEpoch*1000);
    var currentDayText = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
    var weekday = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    var month = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    var currentDayPrettyText = weekday[date.getDay()]+" "+date.getDate()+" "+month[date.getMonth()];
    var now = new Date();
    var nowText = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
    var yesterday = now.setDate(now.getDate()-1);
    var yesterdayDate = new Date(yesterday);
    var yesterdayText = yesterdayDate.getFullYear()+"-"+(yesterdayDate.getMonth()+1)+"-"+yesterdayDate.getDate();
    var now = new Date();
    var tomorrow = now.setDate(now.getDate()+1);
    var tomorrowDate = new Date(tomorrow);
    var tomorrowText = tomorrowDate.getFullYear()+"-"+(tomorrowDate.getMonth()+1)+"-"+tomorrowDate.getDate();

    var dayText = currentDayPrettyText;
    if (currentDayText == nowText) dayText = "Aujourd'hui";
    if (currentDayText == yesterdayText) dayText = "Hier";
    if (currentDayText == tomorrowText) dayText = "Demain";
    $container.find('.day-container').html(dayText);
  }

  window.addEventListener('scroll', myEfficientFn);
  $('.container.timetable section')[0].addEventListener('scroll', myEfficientFn);

  $('.container.timetable section')[0].addEventListener('scroll', myFunction);

  $('#timeEntryModalCenter').on('shown.bs.modal', function (event) {
    var $timeEntry = $(event.relatedTarget);
    var programId = $timeEntry.data("id");
    var start = $timeEntry.data("start");
    var end = $timeEntry.data("end");
    var startDate = new Date(start);
    var endDate = new Date(end);
    var hourText = "De "+(startDate.getHours() < 10 ? "0"+startDate.getHours() : startDate.getHours())+":"+(startDate.getMinutes() < 10 ? "0"+startDate.getMinutes() : startDate.getMinutes())+" à "+(endDate.getHours() < 10 ? "0"+endDate.getHours() : endDate.getHours())+":"+(endDate.getMinutes() < 10 ? "0"+endDate.getMinutes() : endDate.getMinutes());
    $.get('/tv/guide/info/program/'+programId+'/?token='+JsVars.private_token, function(data) {
      $('#timeEntryModalCenter .modal-title').html($(event.relatedTarget).attr('title'));
      $('#timeEntryModalCenter .modal-body').html(data);
      $('#timeEntryModalCenter var#hours').html(hourText);
    });
  })

})(jQuery); // End of use strict