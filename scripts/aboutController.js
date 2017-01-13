(function(module) {
  var aboutController = {};

  aboutController.index = function() {
    var $about = $('#about');

    $about.find('ul').empty();
    $about.show().siblings().hide();
  };

  module.aboutController = aboutController;
})(window);
