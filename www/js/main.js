(function ($) {

  $.fn.zSlider = function (options) {
    if (typeof options !== 'object') options = {};
    options = $.extend({
      'slidesContainer' : 'slides',
      'cSlide' : 'slide',
      'sliderControls' : 'slider-control',
      'prevArrow' : 'move-left',
      'imageWidth' : 350,
      'nextArrow' : 'move-right'
    }, options);

    var $self = this,
      storage = {},
      DOM = {};

    var methods = {
      init : function () {
        storage.isMoving = false;
        storage.currentSlide = 0;
        storage.sliderPosition = 0;
        this.fillDom();
        this.setImageWidth( options.imageWidth );
        this.countSlides();
        this.setSlidesContainerWidth();
        this.bindEvents();
        storage.inited = true;
      },
      fillDom: function () {
        DOM.slidesContainer = $self.find('.' + options.slidesContainer);
        DOM.slides = $self.find('.' + options.cSlide);
        DOM.nextSlideButton = $self.find('.' + options.nextArrow);
        DOM.prevSlideButton = $self.find('.' + options.prevArrow);
      },
      setImageWidth: function (width) {
        storage.imageWidth = width;
      },
      setSlidesContainerWidth: function () {
        DOM.slidesContainer.css('width', storage.imageWidth * this.getNumberOfSlides());
      },
      resize: function () {
      },
      bindEvents: function () {
        // DOM.nextSlideButton.click(methods.nextSlide);
        // DOM.prevSlideButton.click(methods.prevSlide);
        $self.on('mousedown', function (event) {
          storage.isMoving = true;
          storage.moveStart = event.pageX;
          DOM.slidesContainer.addClass('item-moving');
        })
        $self.on('mousemove', function (event) {
          if (storage.isMoving) {
            DOM.slidesContainer.css('margin-left', storage.sliderPosition + (event.pageX - storage.moveStart));
          }
        })
        $self.on('mouseup mouseleave', function (event) {
          DOM.slidesContainer.removeClass('item-moving');
          storage.moveFinish = event.pageX;
          storage.isMoving = false;
          methods.gestureValidation();
        })
        $self.on('touchstart', function (ev) {
          var e = ev.originalEvent;
          storage.isMoving = true;
          storage.moveStart = e.touches[0].pageX;
          DOM.slidesContainer.addClass('item-moving');
        })
        $self.on('touchmove', function (ev) {
          var e = ev.originalEvent;
          storage.moveFinish = e.touches[0].pageX;
          if (storage.isMoving) {
            DOM.slidesContainer.css('margin-left', storage.sliderPosition + (storage.moveFinish - storage.moveStart));
          }
        })
        $self.on('touchend', function (ev) {
          var e = ev.originalEvent;
          DOM.slidesContainer.removeClass('item-moving');
          storage.isMoving = false;
          methods.gestureValidation();
        })
      },
      gestureValidation: function () {
        if (storage.moveStart - storage.moveFinish  > 200){
          methods.nextSlide();
        } else if (storage.moveStart - storage.moveFinish < -200){
          methods.prevSlide();
        } else {
          DOM.slidesContainer.css('margin-left', storage.sliderPosition);
        }
      },
      getNumberOfSlides : function () {
        return storage.slidesCount;
      },
      displaySlide : function () {
      },
      moveToSlide : function (slide) {
        storage.sliderPosition = storage.imageWidth * -slide;
        DOM.slidesContainer.css('margin-left', storage.sliderPosition);
        storage.currentSlide = slide;
      },
      nextSlide: function () {
        var i = storage.currentSlide + 1;
        if (i < storage.slidesCount) {
          methods.moveToSlide( i );
        } else {
          methods.moveToSlide( storage.currentSlide );
        }
      },
      prevSlide: function () {
        var i = storage.currentSlide - 1;
        if (i >= 0) {
          methods.moveToSlide( i );
        } else {
          methods.moveToSlide(storage.currentSlide);
        }
      },
      moveValidation : function () {
      },
      countSlides : function () {
        storage.slidesCount = DOM.slides.length;
      }
    }
    methods.init();
    return methods;
  }
})(jQuery);

$('#slider-container').zSlider();
