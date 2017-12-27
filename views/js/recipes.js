(function($) {
  "use strict"; // Start of use strict

  var socket = io();
 
  socket.on('brain update recipe', function(event){
      var newClass = event.recipe.isPoweredOn ? "isOn" : "isOff";
      $('#'+event.recipe.uid).removeClass('isOn isOff').addClass(newClass);
  });


})(jQuery); // End of use strict

function onClickShowButtons(container_id) {
    $("#"+container_id).toggle();
}

function onClickCopyButton(input_id) {
    $('#'+input_id).select();
    document.execCommand('copy');
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}