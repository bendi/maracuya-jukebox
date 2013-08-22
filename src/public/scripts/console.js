define(function() {
  if (typeof(console) === 'undefined') {
    return {
      log: function(){}
    };
  } else {
    return console;
  }
});