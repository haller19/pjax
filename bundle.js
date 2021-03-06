$(document).on('ready pjax:complete', function () {

  'use strict';



  /*
   ## service-worker
   */

  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  );

  if ('serviceWorker' in navigator &&
    (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function (registration) {

        registration.onupdatefound = function () {
          if (navigator.serviceWorker.controller) {
            var installingWorker = registration.installing;
            installingWorker.onstatechange = function () {
              switch (installingWorker.state) {
                case 'installed':
                  break;
                case 'redundant':
                  throw new Error('The installing ' +
                    'service worker became redundant.');
                default:
              }
            };
          }
        };


      }).catch(function (e) {
        console.error('Error during service worker registration:', e);
      });
  }


  /*
   ##uaの判定

   ###OS、ブラウザ、 デバイスを判定してbodyタグに出力します。
   （例
   <body data-os="Mac OS 10.11" data-browser="safari" data-device="desktop" data-touch-device="true">

   */


  //ua
  var uaOS = window.navigator.userAgent;
  var ua = uaOS.toLowerCase();
  var bodyElem = document.body;

  //os
  var Windows = uaOS.match(/Windows NT (\d+\.\d+)/),
    MacOS = uaOS.match(/Mac OS X (\d+[_.]\d+)/),
    iOS = uaOS.match(/iPhone OS (\d_\d)/) || uaOS.match(/iPad; CPU OS (\d_\d)/),
    Android = uaOS.match(/Android (\d\.\d)/);

  var os = '',
    version = '';

  if (Windows) {
    switch (os = "Windows", Windows[1]) {
      case "5.1":
      case "5.2":
        version = "XP";
        break;
      case "6.0":
        version = "Vista";
        break;
      case "6.1":
        version = "7";
        break;
      case "6.2":
        version = "8";
        break;
      case "6.3":
        version = "8.1";
        break;
      case "10.0":
        version = "10"
    }
  } else if (MacOS) {
    os = "Mac OS";
    version = MacOS[1].replace(/_/g, ".");
  } else if (iOS) {
    os = "iOS";
    version = iOS[1].replace(/_/g, ".");
  } else if (Android) {
    os = "Android";
    version = Android[1];
  }

  bodyElem.setAttribute("data-os", os + " " + version);


  //browser
  var BrowserSafari = ua.indexOf("safari") > -1 && ua.indexOf("chrome") == -1,
    BrowserChrome = ua.indexOf("chrome") > -1 && ua.indexOf("edge") == -1,
    BrowserFireFox = ua.indexOf("firefox") != -1,
    BrowserIE = ua.indexOf("msie") != -1,
    BrowserIE11 = ua.indexOf('trident/7') != -1,
    BrowserEdge = ua.indexOf("edge") != -1;


  if (BrowserSafari) {
    bodyElem.setAttribute("data-browser", "safari");
  } else if (BrowserChrome) {
    bodyElem.setAttribute("data-browser", "chrome");
  } else if (BrowserFireFox) {
    bodyElem.setAttribute("data-browser", "firefox");
  } else if (BrowserIE || BrowserIE11) {
    bodyElem.setAttribute("data-browser", "ie");
  } else if (BrowserEdge) {
    bodyElem.setAttribute("data-browser", "edge");
  }

  //device
  var ipad = ua.indexOf('ipad') !== -1,
    androidTab = ua.indexOf('android') !== -1 && ua.indexOf('mobile') === -1,
    iphone = ua.indexOf('iphone') !== -1,
    androidMobile = ua.indexOf('android') !== -1 && ua.indexOf('mobile') !== -1;

  if (ipad || androidTab) {
    bodyElem.setAttribute("data-device", "tablet");
  } else if (iphone || androidMobile) {
    bodyElem.setAttribute("data-device", "mobile");
  } else {
    bodyElem.setAttribute("data-device", "desktop");
  }


  //touch-device
  if ('ontouchstart' in window) {
    bodyElem.setAttribute("data-touch-device", "true");
  } else {
    bodyElem.setAttribute("data-touch-device", "false");
  }


  //上下スクロール判定
  var startPos = 0,
    scrollTop = 0,
    scrollStop = false;

  $(window).on('scroll', function () {
    scrollTop = $(this).scrollTop();
    if (scrollTop >= startPos) {
      $('body').attr('data-scroll-pos', 'down');
    } else {
      $('body').attr('data-scroll-pos', 'up');
    }
    startPos = scrollTop;

    clearTimeout(scrollStop);
    scrollStop = setTimeout(function () {
      $('body').attr('data-scroll-pos', 'stay');
    }, 3000);
  });


  //フォーカス時に消す
  $('input[type="text"], input[type="tel"], input[type="number"], input[type="email"], input[type="password"], textarea').on('focus', function () {
    $('.js-focus-none').css({
      'display': 'none'
    });
  }).on('blur', function () {
    $('.js-focus-none').css({
      'display': 'block'
    });
  });


  //offline対応
  if (navigator.onLine === false) {
    var offLineText =
      '<div class="is-prompt" data-elements="add-js">' +
      '<p>現在オフラインで表示しています。</p></div>';
    $('body').prepend(offLineText);
  }


  /*
   ##旧ブラウザ対策

   */
  //IE10対応
  if (ua.indexOf("msie") != -1) {
    var noScriptText =
      '<div class="is-prompt" data-elements="add-js">' +
      '<p>お使いのブラウザはバージョンが古いため、サイトを快適にご利用いただけないかもしれません。<br>' +
      '<a href="https://www.whatbrowser.org/intl/ja/">新しいブラウザをお試しできます。ブラウザは無料、インストールも簡単です。</a>' +
      '</div>';
    $('body').prepend(noScriptText);
  }

  //android標準ブラウザ対策
  var hostname = window.location.hostname;
  if ((/Android/.test(uaOS) && /Linux; U;/.test(uaOS) && !/Chrome/.test(uaOS)) ||
    (/Android/.test(uaOS) && /Chrome/.test(uaOS) && /Version/.test(uaOS)) ||
    (/Android/.test(uaOS) && /Chrome/.test(uaOS) && /SamsungBrowser/.test(uaOS))) {

    var noAndroidText =
      '<div class="is-prompt" data-elements="add-js">' +
      '<p>ご利用のAndroid端末のバージョンでは閲覧できません。<br>' +
      '<a href="intent://${hostname}#Intent;scheme=https;action=android.intent.action.VIEW;package=com.android.chrome;end">Chromeブラウザをご利用頂くかOSのバージョンアップをお願い致します。</a>' +
      '</div>';

    bodyElem.parentNode.insertBefore(noAndroidText);
  }


});

$(document).on('ready pjax:complete', function () {

  var $selectorAC = $('[data-toggle-accordion]');
  var containerAC = '[data-accordion]';
  var deviceAC = '[data-device-accordion]'; //all, pc, tab, sp
  var bodyAC = '[data-body-accordion]';
  var tabWidth = '960px';
  var spWidth = '600px';

  $.Event('E_ENTER_KYE_CODE', {
    keyCode: 13,
    which: 13
  });

  $selectorAC.on('click E_ENTER_KYE_CODE', function (e) {

    var media = $(e.currentTarget).parents(deviceAC).data('device-accordion') || 'all';
    var isMobile = window.matchMedia('(max-width:' + spWidth + ')').matches || false;
    var isTablet = window.matchMedia('(min-width:' + spWidth + ') and (max-width:' + tabWidth + ')').matches || false;

    if (media.match(/all/) ||
      (media.match(/sp/) && isMobile) ||
      (media.match(/tab/) && isTablet) ||
      (media.match(/pc/) && (!isMobile && !isTablet))
    ) {
      toggle(e);
    }
  });

  function toggle(e) {
    e.preventDefault();
    var $target = $(e.currentTarget);
    var $containerAC = $target.parents(containerAC);
    var $bodyAC = $containerAC.find(bodyAC);

    if ($containerAC.hasClass('is-active')) {
      $containerAC.removeClass('is-active');
      $target.attr({
        'aria-expanded': 'true',
        'aria-label': '閉じる'
      });
      $bodyAC.stop().slideUp(150).attr('aria-hidden', 'true');
    } else {
      $containerAC.addClass('is-active');
      $target.attr({
        'aria-expanded': 'false',
        'aria-label': '開く'
      });
      $bodyAC.stop().slideDown(200).attr('aria-hidden', 'false').focus();

      var offset = $target.offset() || {};
      var offsetTop = offset.top || 0;

      $('html,body').animate({
        scrollTop: offsetTop - ($('header').height())
      }, {
        duration: 500,
        easing: 'swing'
      });

    }
  }


  //アコーディオン内からのリンク
  $('[anker-accordion]').on('click', function () {
    var targetHref = $(this).attr('href');
    if (targetHref.indexOf('#') != -1) {
      //$(this).parents(containerAC).find($selectorAC).click();
      $('[aria-controls="' + targetHref.slice(1) + '"]').click();
    }

  });


  //ハッシュでアコーディオン開く
  var urlHash = location.hash || false;
  if (urlHash && $(urlHash).length) {
    if ($('[aria-controls="' + urlHash.slice(1) + '"]').length) {
      $('[aria-controls="' + urlHash.slice(1) + '"]').click();
    }
  }


});

$(document).on('ready pjax:complete', function () {
  //initialize
  var $modalSelector = $('[data-modal]');
  var $openModalSelector = $('[data-open-modal]');
  var $closeModalSelector = $('[data-close-modal]');
  var $appendSelector = $('[data-append-modal]');
  var $currentScrollY = 0;

  if ($modalSelector.length) {

    $areaHidden = $('header, footer, main');
    $currentScrollY = null;

    $('body').append('<div class="c-modal-dialog-bg" data-close-modal aria-expanded="true" aria-label="閉じる"></div>');
    $modalBg = $('.c-modal-dialog-bg');
    $modalBg.css({
      display: 'none',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, .5)',
      overflow: 'hidden',
      position: 'absolute',
      top: '0',
      left: '0',
      zIndex: '99998'
    });


    //handleEvents
    $openModalSelector.on('click', function (e) {
      show(e);
    });

    $(document).on('keyup', function (e) {
      var ESCAPE_KEY_CODE = 27;
      if (e.keyCode === ESCAPE_KEY_CODE) {
        hide(e);
      }
    });

    $closeModalSelector.on('click', function (e) {
      hide(e);
    });

    $modalBg.on('click', function (e) {
      hide(e);
    });

  }

  //function
  function show(e) {
    e.preventDefault();
    var $openButton = $(e.currentTarget);
    var containerAttr = $openButton.attr('aria-controls');
    var $container = $('#' + containerAttr);

    this.$modalBg.fadeIn(400);
    $container.fadeIn(400).attr({
      'aria-hidden': 'false',
      'tabindex': '1'
    }).focus();
    this.$areaHidden.attr({
      'aria-hidden': 'true'
    });
    $currentScrollY = $(window).scrollTop();

    $('body').css({
      position: 'fixed',
      width: '100%',
      top: -1 * $currentScrollY
    });

    var $clone = $('[data-clone-modal="' + containerAttr + '"]');

    if ($clone.length && !$appendSelector.children().attr('data-clone-modal')) {
      var elem = $clone.clone(true);

      elem.find('.c-modal-dialog-none').remove();
      elem.removeAttr('style class').find('*').removeAttr('style class');
      $appendSelector.append(elem);
    }
  }


  function hide(e) {

    $modalBg.fadeOut(0);
    $modalSelector.fadeOut(0).attr({
      'aria-hidden': 'true',
      'tabindex': '-1'
    });
    $areaHidden.removeAttr('aria-hidden');
    $('body').attr({
      style: ''
    });
    $('html, body').prop({
      scrollTop: $currentScrollY
    });
    $appendSelector.empty();
  }


});


$(document).on('ready pjax:complete', function () {


  var scrollSelector = '[data-scroll]';
  var $scrollTotop = $('[data-scroll="to-top"]');
  var mainH = $('header').height();


  $(document).on('click', scrollSelector + ' a', function (e) {
    scroll(e);
  });


  $(window).on('scroll', function (e) {
    topHide(e);
  });

  $(window).on('load', function (e) {

    scrollToAnker(e);

  });


  function scroll(e) {
    e.preventDefault();
    var $target = $(e.currentTarget);
    var targetHref = $target.attr('href');

    if (targetHref.indexOf('#') != -1) {
      $target.blur();

      var offset = $(targetHref).offset() || {};
      var offsetTop = offset.top - mainH - 20 || 0;

      $('html,body').animate({
        scrollTop: offsetTop
      }, {
        duration: 300,
        easing: 'swing',
        complete: function () {
          if (targetHref !== '#skippy') {
            // window.location.hash = targetHref;
          }
        }
      });
    }
  }

  function topHide(e) {
    e.preventDefault();
    var $target = $(e.currentTarget);
    var scrollPos = $target.scrollTop();

    if (scrollPos < mainH) {
      $scrollTotop.find('a').stop().animate({
        'bottom': '-80px'
      }, 200, 'swing');
    } else {
      $scrollTotop.find('a').stop().animate({
        'bottom': '80px'
      }, 200, 'swing');
    }
  }


  //ハッシュ付きリンク用に遅延して動作
  function scrollToAnker(e) {
    var urlHash = location.hash || false;
    if (urlHash && $(urlHash).length) {
      setTimeout(function () {
        var position = $(urlHash).offset().top - mainH - 20;
        $('body,html').animate({
          scrollTop: position
        }, 100);
      }, 0);
    }

  }


});

$(document).on('ready pjax:complete', function () {
  var selector = '[data-toggle-offcanvas]';
  var bodyContents = '[data-body-offcanvas]';
  var bgSelector = '#js-offcanvas-bg';
  var scrollSelector = '[data-scroll-offcanvas]';
  var lowerLayerSelector = ''; //footer, main
  var focusSelector = ''; //.l-header-search-sp__input

  var currentScrollY = null;
  var $selector = $(selector);
  var $bodyContents = $(bodyContents);
  var $bgSelector = $(bgSelector);
  var $lowerLayerSelector = $(lowerLayerSelector);
  var $focusSelector = $(focusSelector);
  var $scrollSelector = $(scrollSelector);

  $selector.on('click', function (e) {
    toggle(e);
  });

  $bodyContents.on('click', 'a', function (e) {
    settingInitialization();
  });


  $bgSelector.on('click', function (e) {
    settingInitialization();
  });

  $bodyContents.on('click', scrollSelector, function (e) {
    settingInitialization();
    scrollTo(e);
  });


  function toggle(e) {

    e.preventDefault();
    if ($bodyContents.attr('aria-hidden') === 'true') {
      //ナビゲーションのレイヤーを上にしてスライドイン
      $bodyContents.attr({
        'aria-hidden': 'false',
        'tabindex': '1'
      });
      // $('input').first().focus();
      //メニューアイコン
      $selector.attr({
        'aria-expanded': 'true',
        'aria-label': '閉じる'
      });
      //背景黒
      $bgSelector.css({
        display: 'block',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, .5)',
        overflow: 'hidden',
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: '9998'
      });

      //下のレイヤーをhidden
      $lowerLayerSelector.attr({
        'aria-hidden': 'true'
      });
      currentScrollY = $(window).scrollTop();
      //現在地のスクロールを保持
      $('body').css({
        position: 'fixed',
        width: '100%',
        top: -1 * currentScrollY
      });


    }
  }

  function settingInitialization() {

    $bodyContents.attr({
      'aria-hidden': 'true',
      'tabindex': '-1'
    });
    $selector.attr({
      'aria-expanded': 'false',
      'aria-label': '開く'
    });
    $bgSelector.attr({
      style: ''
    });
    $lowerLayerSelector.removeAttr('aria-hidden');
    $('body').attr({
      style: ''
    });
    $('html, body').prop({
      scrollTop: currentScrollY
    });
  }


  function scrollTo(e) {
    e.preventDefault();

    var $target = $(e.currentTarget);
    var targetHref = $target.attr('href');

    if (targetHref.indexOf('#') != -1) {
      $target.blur();

      var offset = $(targetHref).offset() || {};
      var offsetTop = offset.top || 0;

      $('html,body').animate({
        scrollTop: offsetTop
      }, {
        duration: 300,
        easing: 'swing'
      });
    }
  }

});






$(document).on('ready pjax:complete', function () {

  var containerSelector = '[data-tab]';
  var tabListSelector = '[data-tablist]';
  var tabPanelSelector = '[data-tabpanel]';


  $(tabListSelector).on('click', function (e) {
    e.preventDefault();
    var $target = $(e.currentTarget);
    listSelect($target);
    panelSelect($target);
  });

  $(document).on('keyup', function (e) {
    e.preventDefault();
    tabKeyup(e);
  });


  function listSelect($target) {
    $target.focus();
    $target.parents('li').attr('aria-selected', 'true').attr('tabindex', '0').focus()
      .siblings('li').attr('aria-selected', 'false').attr('tabindex', '-1');
  }

  function panelSelect($target) {
    var panel = $target.attr('aria-controls');
    $('#' + panel).attr('aria-hidden', 'false')
      .siblings(this.tabPanelSelector).attr('aria-hidden', 'true');
  }


  function tabKeyup(e) {
    var $target = $(e.currentTarget);

    var leftArrow = 37;
    var rightArrow = 39;

    switch (e.keyCode) {

      case leftArrow:
        $target = $(e.target).prev().children(this.tabListSelector);
        break;

      case rightArrow:

        $target = $(e.target).next().children(this.tabListSelector);
        break;

      default:

        break;
    }
    listSelect($target);
    panelSelect($target);
  }


  //ハッシュでタブ開く
  var urlHash = location.hash || false;
  if (urlHash && $(urlHash).length) {
    if ($(urlHash).length) {
      $(urlHash).find('[data-tablist]').click();
    }
  }

});

$(document).on('ready pjax:complete', function () {

  $('.js-ripple').each(function (i, elem) {
    rippleButton(elem);
  });

  function rippleButton(button) {
    button.addEventListener('mousedown', function (e) {
      var dimension = Math.max(button.clientWidth, button.clientHeight);
      var loc = button.getBoundingClientRect();
      var circle = document.createElement('span');
      circle.classList.add('js-rp-effect');
      circle.style.width = dimension + 'px';
      circle.style.height = dimension + 'px';
      circle.style.left = e.clientX - button.offsetLeft - (dimension / 2) + 'px';
      circle.style.top = e.clientY - button.offsetTop - (dimension / 2) + document.documentElement.scrollTop + 'px';
      button.appendChild(circle);
      setTimeout(function () {
        button.removeChild(circle);
      }, 1000);
    })
  }

});



$(document).on('ready pjax:complete', function () {

  /*
   * 当ファイルと@jwps/以下は1ファイルに結合して書き出されます。
   * 当ファイルは@jwps/の最後に追加されます。
   *
   */

  //セレクトボックス選択でリンク
  if ($('.js-selectlink').length) {
    $('.js-selectlink').on('change', function () {
      var _self = $(this);
      if (_self.val() != 'default') {
        window.location.href = _self.val();
        _self.val('default');
      }
    });
    $(".js-selectlink").val(location.protocol + '//' + location.host + '/' + location.pathname.split("/")[1] + '/');
  }


  //nav現在地
  if (location.pathname != "/") {
    $('.js-current-nav a').removeClass('is-active');
    $('.js-current-nav a[href^="/' + location.pathname.split("/")[1] + '"]').addClass('is-active');
  } else {
    //$('.js-current-nav a:eq(0)').addClass('is-active');
    $('.js-current-nav a').removeClass('is-active');
  }

});


$(document).on('click', 'a[data-pjax]', function (e) {
  e.preventDefault();
  var href = $(this).attr('href');
  $.pjax({
    url: href,
    container: 'main',
    fragment: 'main',
    scrollTo: 0,
    timeout: 20000
  });
});


// window.addEventListener('DOMContentLoaded', function () {
//
//   var Pjax = require('pjax-api').Pjax;
//   new Pjax({
//     // link: 'selector'
//     areas: [
//       'main'
//     ]
//   });
//
// });

//Barba.Dispatcher.on( 'newPageReady', function( currentStatus, oldStatus, container, newPageRawHTML ) {

// if ( Barba.HistoryManager.history.length === 1 ) {
//   return;
// }
//
// var head = document.head,
//     newPageRawHead = newPageRawHTML.match( /<head[^>]*>([\s\S.]*)<\/head>/i )[ 0 ],
//     newPageHead = document.createElement( 'head' );
// newPageHead.innerHTML = newPageRawHead;
// var headTags = [
//   "link[rel='canonical']",
//   "meta[name='keywords']",
//   "meta[name='description']",
//   "meta[property^='og']",
//   "meta[name^='twitter']",
//   "meta[itemprop]",
//   "link[itemprop]",
//   "link[rel='prev']",
//   "link[rel='next']",
//   "link[rel='alternate']"
// ].join( ',' );
// var oldHeadTags = head.querySelectorAll( headTags );
// for ( var i = 0; i < oldHeadTags.length; i++ ) {
//   head.removeChild( oldHeadTags[ i ] );
// }
// var newHeadTags = newPageHead.querySelectorAll( headTags );
// for ( var i = 0; i < newHeadTags.length; i++ ) {
//   head.appendChild( newHeadTags[ i ] );
// }


//});


//
// window.addEventListener('DOMContentLoaded', function () {
//   Barba.Pjax.start();
// });