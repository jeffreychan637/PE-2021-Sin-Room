// if (isDebugMode()) {
//   addDebugScript();
// } else {
//   main();
// }

main();

function isDebugMode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('sin_room_debug') === 'true';
}

function addDebugScript() {
  const debugScript = document.createElement('script');
  debugScript.setAttribute('type', 'text/javascript');
  debugScript.setAttribute('src', 'https://jeff-pe.surge.sh/webflow-sin-room-v7.js');
  $('.sin-room-body').append(debugScript);
  const debugStyle = document.createElement('link');
  debugStyle.setAttribute('rel', 'stylesheet');
  debugStyle.setAttribute('href', 'https://jeff-pe.surge.sh/webflow-sin-room-v7.css');
  $('.sin-room-body').append(debugStyle);
}

function sanitize(input) {
  return input.replaceAll("<", "&lt;").replaceAll('>', "&gt;");
}

function main() {

  let prodFlag = true;

  const DEFAULT_LANG = 'en';
  function detectLanguage(pathname) {
    if (!pathname) {
      return DEFAULT_LANG;
    }
    const lastIndex = pathname.lastIndexOf('/');
    if (lastIndex === -1) {
      return DEFAULT_LANG;
    }
    return pathname.substring(lastIndex + 1);
  }
  const language = detectLanguage(window.location.pathname)

  /*
  Actual Values stored in CSS. Defaults are here just in case.
  Can probably remove because the code that needs these value only runs after these values are set.
  */
  let itemZ = 1;
  let scenePerspective = 1;
  let cameraSpeed = 600;
  let perspectiveOrigin = { x: 50, y: 50, maxGap: 30 };

  let numberOfLayers = 1;
  // based on layers from card spreadsheet
  let numberOfElementsPerLayer =  [1, 2, 1, 2, 2, 3, 4, 4, 4, 4, 5, 4, 5, 7, 4];
  //[1, 1, 2, 2, 3, 3, 4, 5, 6, 6, 6, 7, 7, 7, 7, 8]; //[1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 2, 2, 3, 3, 0, 4, 4, 4, 5, 5, 5, 6, 6];
  let revealDistance = 1700; // the distance when we begin to reveal a card - only used for final card now
  let changeDistance = 300; // the distance we begin to change a card from the sin word to the sentence
  let finalSceneElementsFadeDistance = -100; // the distance that the final scene card fades out (visibility -> hidden)
  let initialDistanceBuffer = 800; // + 2700; // initial buffer + viewport height of initial scene so we don't have to restart scrolling at top
  let cardElementsZValues = []; // pre-fill with 0 to account for the fact that CSS starts counting children at 1
  let finalSceneElementsZValues = [];
  let sinWordElementZValues = [];

  let indexOfFirstSinWordElement = 0;
  let cardElements;
  let finalSceneElements;

  let sinWords; // only the one on cards not the ones at the end
  let sinSentences;
  let veryLastWordsZValue = 0;
  let veryLastCard;

  let viewportHeight;

  let firstCardZValue = 2000;

  let mansonry;
  let commentsContainer;

  let openingNarrationAudio;
  let spotlight;
  let mouseOverEventListenerActive = false;
  let clickSelectCardText;
  let gotToEndOfTunnelBefore = false;
  let startedBGM = false;

  function getThisCardElements(card) {
    let ogParentCard, newParentCard, button, sinWord, sinSentence;
    card.children().each(function() {
      const child = $(this);
      const grandChildren = child.children();
      if (child.hasClass('og-card-parent')) {
        ogParentCard = child;
        sinWord = grandChildren.first();
        button = grandChildren.eq(1); // second child
      } else if (child.hasClass('new-card-parent')) {
        newParentCard = child;
        sinWord = grandChildren.first();
        sinSentence = grandChildren.eq(1); // second child
        button = child.children().eq(2); // third child
      }
    });
    return {
      ogParentCard,
      newParentCard,
      button,
      sinWord,
      sinSentence,
    };
  }

  function onSinCardHover() {
    const { ogParentCard, newParentCard, button, sinWord, sinSentence } = getThisCardElements($(this));
    if (!button.hasClass('sin-room-card-button-clicked')) {
      button.addClass('show');
      sinWord.addClass('yellow-text');
      ogParentCard ? ogParentCard.addClass('sin-card-yellow-border') : 0;
      newParentCard ? newParentCard.addClass('sin-card-yellow-border') : 0;
    }
  }

  function onSinCardEndHover() {
    const { ogParentCard, newParentCard, button, sinWord, sinSentence } = getThisCardElements($(this));
    if (!button.hasClass('sin-room-card-button-clicked')) {
      button.removeClass('show');
      sinWord.removeClass('yellow-text');
      ogParentCard ? ogParentCard.removeClass('sin-card-yellow-border') : 0;
      newParentCard ? newParentCard.removeClass('sin-card-yellow-border') : 0;
    }
  }

  function onSinCardClick() {
    const { ogParentCard, newParentCard, button, sinWord, sinSentence } = getThisCardElements($(this));

    if (!button.hasClass('sin-room-card-button-clicked')) {
      button.addClass('sin-room-card-button-clicked');
      sinWord.addClass('red-text');
      ogParentCard ? ogParentCard.addClass('sin-card-red-border') : 0;
      newParentCard ? newParentCard.addClass('sin-card-red-border') : 0;
    } else {
      button.removeClass('sin-room-card-button-clicked');
      sinWord.removeClass('red-text');
      ogParentCard ? ogParentCard.removeClass('sin-card-red-border') : 0;
      newParentCard ? newParentCard.removeClass('sin-card-red-border') : 0;
    }
    if (sinWord) {
      DigitalWallet.write(sinWord.text().toLocaleUpperCase());
    }
    if (sinSentence) {
      DigitalWallet.write(sinSentence.text());
    }
  }

  Webflow.push(function () {
    if (prodFlag) {
      disableScroll();
    }

    // DOMready has fired
    // May now use jQuery and Webflow api
    window.addEventListener("scroll", moveCamera, {passive: true});
    getCSSComputedStyles();

    adjustForLanguages();

    cardElements = $('.sin-room-card');

    sinSentences = $('.sin-sentence');
    sinWords = $('.sin-word');
    veryLastCard = $('.very-last-card');

    commentsContainer = $('.sin-room-comments');

    openingNarrationAudio = $('#player')[0];
    spotlight = $('.sin-room-spotlight');
    clickSelectCardText = $('.click-select-card')

    numberOfLayers = getNumberOfLayers(cardElements.length);

    let elementsInLayerArrayIndex = 0;
    let numElementsLeftInLayer = numberOfElementsPerLayer[elementsInLayerArrayIndex];
    let currentLayerNumber = 1;

    // original values - 240 for sin wall and 250 for opening words
    $('.sin-wall').css('transform', `translate3d(0%, 0%, ${240}px`);
    $('.sin-wall-blanks').css('transform', `translate3d(0%, 0%, ${190}px`);
    spotlight.css('transform', `translate3d(0%, 0%, ${240}px`);
    $('.opening-mark-7-begin').css('transform', `translate3d(0%, 0%, ${270}px`);
    $('.opening-mark-7-end').css('transform', `translate3d(0%, 0%, ${270}px`);

    for (let i = 0; i < cardElements.length;) {

      if (numElementsLeftInLayer !== 0) {
        const numberOfElementsInLayer = (numberOfElementsPerLayer[elementsInLayerArrayIndex] || 8);
        const randomX = 0;
        const randomY = 0;
        const zValue = itemZ * cameraSpeed / 1.5 * //itemZ * cameraSpeed *
          (currentLayerNumber)
          + initialDistanceBuffer +
          (115 * (numberOfElementsInLayer - numElementsLeftInLayer));
          // the more elements in layer the more we should spread them out

          //for the distance between layer multiplier, we're doing mx + b where if 1 element in layer, y = 2 and if 8 elements in layer, y = 0.5

          // give the same value to the next 4 elements
        // add a little bit of variation at the end.
        cardElementsZValues.push(zValue);

        // logic for making sure that we set the right number of cards per layer
        numElementsLeftInLayer -= 1;

        cardElements.eq(i).css('transform', `translate3d(${randomX}%, ${randomY}%, -${zValue}px`);
        i += 1;
      }

      if (!numElementsLeftInLayer) {
        currentLayerNumber += 1;
        elementsInLayerArrayIndex += 1;
        numElementsLeftInLayer = elementsInLayerArrayIndex < numberOfElementsPerLayer.length
          ? numberOfElementsPerLayer[elementsInLayerArrayIndex] : 8;
      }
    }

    veryLastWordsZValue = cardElementsZValues[cardElementsZValues.length - 1] + 1000;
    veryLastCard.css('transform', `translate3d(${0}%, ${0}%, -${veryLastWordsZValue}px`);

    // Setup button on-click functions
    cardElements.hover(onSinCardHover, onSinCardEndHover);
    cardElements.click(onSinCardClick);

    $('.open-comments-btn').click(enterCommentsSection);

    waitForFirebase();

    enterMainRoom();

    $('.page2-comment-close').click(() => {
      collapseComments();
    });

    $('.comment-opener-link').click(() => {
      openComments();
    });
  });

  function collapseComments() {
    $('.sin-room-comment-submission-container').css('transform', 'translateY(434px)');
  }

  function openComments() {
    $('.sin-room-comment-submission-container').css('transform', 'translateY(0px)');
  }

  function adjustForLanguages() {
    if (language === 'vn') {
      const windowHeight = window.innerHeight;
      let lineHeight = 190;
      let fontSize;
      if (windowHeight < 845) {
        lineHeight = 155;
        fontSize = 110;
      }
      if (windowHeight < 805) {
        lineHeight = 100;
        fontSize = 70;
      }
      if (windowHeight < 775) {
        lineHeight = null;
        fontSize = 70;
        $('.open-comments-btn-container').css('bottom', '2%');
        // just move the button down instead
      }

      if (lineHeight) {
        $('.final-scene-words-2 h1').css('line-height', `${lineHeight}px`);
      }
      if (fontSize) {
        $('.final-scene-words-2 h1').css('font-size', `${fontSize}px`);
      }
    } else if (language === 'es') {
      $('.sin-room-comment-submission-container .submit').css('width', '121px');
    } else if (language === 'ja') {
      $('#mark-passage-2').css('line-height', `31px`);
      $('.mark-7-text.w-richtext h2').css('line-height', `30px`);
      $('.final-scene-words-2 h2').css('line-height', `60px`);
    }
  }

  function enterMainRoom() {
    viewportHeight = setSceneHeight(veryLastWordsZValue, "--viewportHeight"); // after the number of layers and z-index values are determined
    // console.log('viewportHeight', viewportHeight); VERY USEFUL FOR DEBUGGING -- OFTEN NAN WHEN SOMETHING BROKEN
    $('.main-scene').css('display', 'block');
    $('.main-scene').css('opacity', '100%');


    togglePlay(); // defined in audio symbol
    const originalOnTimeUpdateFunction = $('#player')[0].ontimeupdate;
    $('#player')[0].ontimeupdate = function() {
      originalOnTimeUpdateFunction();
      onBeginNarrationUpdates();
    }
    $('#player')[0].onended = () => {
      $('.audio-player').css('visibility', 'hidden');
    };
  }

  function startScroll() {
    $('.scroll-to-move').css('opacity', '100%');
      if (prodFlag) {
        enableScroll();
      }
  }

  function onBeginNarrationUpdates() {
    const time = openingNarrationAudio.currentTime;
    if (time > 10 && time < 12) {
      $('#mark-passage-1').css('opacity', '100%');
    } else if (time > 12 && time < 14) {
      $('#mark-passage-2').css('opacity', '100%');
      $('#mark-passage-3').css('opacity', '100%');
    } else if (time > 14 && time < 16) {
      $('#mark-passage-4').css('opacity', '100%');
    } else if (time > 16 && time < 18) {
      $('#mark-passage-5').css('opacity', '100%');
    }

    if (time > 24 && time < 26) {

      $('.mouse-to-explore').css('opacity', '100%');
      // $('.sin-room-spotlight').css('opacity', '100%');
    }

    if (time > 26 && time < 28) {
      spotlight.css('background-image', `radial-gradient(circle at
        ${50}% ${68}%,
        rgba(17, 17, 17, 0) 80px, rgba(17, 17, 17, 1) 130px)`);
      if (!mouseOverEventListenerActive) {
        window.addEventListener('mousemove', onMouseOverForSpotlight);
        window.addEventListener('touchmove', onMouseOverForSpotlight);
        mouseOverEventListenerActive = true;
      }
      $('.sin-wall').css('opacity', '100%');
      $('.sin-wall-blanks').css('opacity', '100%');
    }

    if (time > 33 && time < 35) {
      $('.mouse-to-explore').css('opacity', '0%');
      window.setTimeout(function() {
        $('.mouse-to-explore').css('visibility', 'hidden');
      }, 1000); // after fade out
    }

    if (time > 35 && time < 37) {
      $('.opening-mark-7-end').css('opacity', '100%');
    }

    if (time > 38 && time < 40) {
      $('.sin-wall').css('transition', 'opacity 1s linear 0s');
      $('.sin-room-spotlight').css('transition', 'opacity 1.5s linear 0s');
      $('.sin-room-spotlight').css('opacity', '0%');
      $('.sin-wall').css('opacity', '50%');
    }


    if (time > 44 && time < 45.5) {
      if (!(['zh-hant', 'zh-hans'].includes(language))) {
        startScroll();
      }
    }

    if (time > 70 && time < 71.5) {
      if (['zh-hant', 'zh-hans'].includes(language)) {
        startScroll();
      }
    }

    if (!startedBGM && (openingNarrationAudio.duration - time < 5)) {
      startedBGM = true;
      $('#bgm-audio')[0].play();
    }
  }

  function onMouseOverForSpotlight(event) {
    let xValue =  (((event.pageX / window.innerWidth) * 0.60) + 0.2) * 100;
    let yValue = (((event.pageY / window.innerHeight) * 0.60) + 0.2) * 100;
    spotlight.css('background-image', `radial-gradient(circle at
        ${xValue}% ${yValue}%,
        rgba(17, 17, 17, 0) 80px, rgba(17, 17, 17, 1) 130px)`);
  }

  const cardBeginRevealD = 2500;
  const cardEndRevealD = 2250;
  const cardRevealSpace = cardBeginRevealD - cardEndRevealD;

  const newParentCardBeginRevealD = 1500;
  const newParentCardEndRevealD = 500;
  const newParentCardRevealSpace = newParentCardBeginRevealD - newParentCardEndRevealD;

  function moveCamera() {
    document.documentElement.style.setProperty("--cameraZ", window.pageYOffset);

    if (window.pageYOffset > 500 && window.pageYOffset < 900) {
      $('.scroll-to-move').css('opacity', '0%');
      window.setTimeout(function() {
        $('.scroll-to-move').css('visibility', 'hidden');
      }, 1000); // after fade out
    }

    if (window.pageYOffset > 500 && window.pageYOffset < 1000) {
      if (mouseOverEventListenerActive) {
        window.removeEventListener('mousemove', onMouseOverForSpotlight);
        window.removeEventListener('touchmove', onMouseOverForSpotlight);
        mouseOverEventListenerActive = false;
      }
    }

    if (window.pageYOffset > 700 && window.pageYOffset < 1000) {
      clickSelectCardText.css('visibility', 'visible');
      clickSelectCardText.css('opacity', '100%');
    } else if (window.pageYOffset > 5000 && window.pageYOffset < 5500) {
      clickSelectCardText.css('opacity', '0%'); // hide when past
      window.setTimeout(function() {
        clickSelectCardText.css('visibility', 'hidden');
      }, 1000);
    } else if (window.pageYOffset < 700) {
      clickSelectCardText.css('opacity', '0%'); // hide at beginning
    }

    cardElementsZValues.forEach(function(value, index) {
      // TODO - store cardElements.eq(index) in a variable for more efficiency???

      const distanceFromUser = value - window.pageYOffset;

      if (distanceFromUser < cardBeginRevealD && distanceFromUser > cardEndRevealD) {
        // Transitions for when card is just appearing
        cardElements.eq(index).css('opacity', `${((cardBeginRevealD - distanceFromUser) / cardRevealSpace * 100)}%`);
      }

      if (distanceFromUser < newParentCardBeginRevealD && distanceFromUser > newParentCardEndRevealD) {
        const opacity = 100 - ((newParentCardBeginRevealD - distanceFromUser) / newParentCardRevealSpace * 100);
        cardElements.eq(index).css('background-color', `rgba(17,17,17, ${opacity}%)`);
      }

      // Finish up the transitions above in case user scrolls quickly and events don't fire within the reveal/change space
      if (distanceFromUser > 0) {
        if (distanceFromUser < cardEndRevealD) {
          cardElements.eq(index).css('opacity', `100%`);
        } else if (distanceFromUser > cardBeginRevealD && distanceFromUser < cardBeginRevealD + 2000) {
          cardElements.eq(index).css('opacity', `0%`);
        }

        if (distanceFromUser > newParentCardBeginRevealD && distanceFromUser < cardBeginRevealD) {
          cardElements.eq(index).css('background-color', `rgba(17,17,17, ${100}%)`);
        } else if (distanceFromUser < newParentCardEndRevealD) {
          cardElements.eq(index).css('background-color', `rgba(17,17,17, ${0}%)`);
        }
      }
    });

    const lastWorddistanceFromUser = veryLastWordsZValue - window.pageYOffset;
    if (lastWorddistanceFromUser < revealDistance && lastWorddistanceFromUser > 0) {
      veryLastCard.css('opacity', `${100 - (lastWorddistanceFromUser * 1000 / revealDistance / 10) + 10 }%`);
    } else if (lastWorddistanceFromUser > revealDistance && lastWorddistanceFromUser < revealDistance + 200) { // small window for it to change back
      veryLastCard.css('opacity', '0');
    }

    // Show Comments Button and ending sin cards image
    const currentScrollLocation = window.pageYOffset + window.innerHeight;
    if (currentScrollLocation > viewportHeight - 2) {
      // $('.ending-sin-cards-image').addClass('show-50');
      if (!gotToEndOfTunnelBefore) {
        $('.ending-sin-cards-image').css('transition', 'opacity 0.5s ease-in 1s');
        $('.open-comments-btn-container').css('transition', 'all 0.5s ease-in 3s');
      } else {
        $('.ending-sin-cards-image').css('transition', 'opacity 0.5s ease-in 0s');
        $('.open-comments-btn-container').css('transition', 'all 0.5s ease-in 0s');
      }
      $('.ending-sin-cards-image').addClass('show-50');
      $('.open-comments-btn-container').css('visibility', 'visible');
      $('.open-comments-btn-container').addClass('show');
      gotToEndOfTunnelBefore = true;
    } else if (currentScrollLocation < viewportHeight - 2 && currentScrollLocation > viewportHeight - 500) {
      // hide if we're not at the end
      // but stop hiding at a certain point because it should have already been hidden
      $('.open-comments-btn-container').css('transition', 'all 0s');
      $('.open-comments-btn-container').removeClass('show');
      $('.open-comments-btn-container').css('visibility', 'hidden');
      $('.ending-sin-cards-image').css('transition', 'opacity 0s');
      $('.ending-sin-cards-image').removeClass('show-50');
    }
  }

  function setSceneHeight(lastObjectZValue, cssVariable) {
    const height =
      window.innerHeight +                                             // viewport height
      scenePerspective * cameraSpeed +                                 // container perspective value
      lastObjectZValue - 800;    // stop 200 before we get to last words so last words just pauses there.
      // itemZ * cameraSpeed * numberOfLayers + initialDistanceBuffer;    // translateZ value of last element

    // Update --viewportHeight value
    document.documentElement.style.setProperty(cssVariable, height);
    return height;
  }

  function getCSSComputedStyles() {
    itemZ = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--itemZ")
    );
    scenePerspective = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--scenePerspective")
    );
    cameraSpeed = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--cameraSpeed")
    );

    perspectiveOrigin = {
      x: parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--scenePerspectiveOriginX"
        )
      ),
      y: parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--scenePerspectiveOriginY"
        )
      ),
      maxGap: 30,
    };
  }

  function getNumberOfLayers(numberOfCards) {
    let numberOfCardsLeft = numberOfCards;
    let curNumLayers = 0;
    for (let i = 0; i < numberOfElementsPerLayer.length; i++) {
      curNumLayers += 1;
      numberOfCardsLeft -= numberOfElementsPerLayer[i];
      if (numberOfCardsLeft <= 0) {
        break;
      }
    }

    if (numberOfCardsLeft) {
      // max number of cards per layer is 4 so divide remaining cards by 4 to get remaining layers count
      curNumLayers += Math.ceil(numberOfCardsLeft / 4);
    }

    return curNumLayers;
  }

  function enterCommentsSection() {
    const viewport = $('.viewport');
    const commentsWrapper = $('.sin-room-comments-wrapper');

    clickSelectCardText.css('display', 'none');

    viewport.css('opacity', 0);

    window.setTimeout(function() {
      viewport.css('display', 'none');
      window.scrollTo(0, 0);
      commentsWrapper.css('display', 'block');
      if (mansonry) {
        mansonry.layout();
        setTimeout(function() {
          commentsWrapper.css('opacity', '100%');
        }, 1000); // after masonry layout is done
      }
      // });
    }, 500); // wait till after fixed elements in sin room finish fading
  }

  function setupCommentsSection(comments) {
    for (let comment of comments) {
      $('<div />', {
        "class": 'sin-room-comment-item',
        html: comment.name
                ? `<div class="sin-room-comment-piece sin-room-comment-comment">${sanitize(comment.text)}</div>
                  <div class="sin-room-comment-piece sin-room-comment-name">${sanitize(comment.name)}</div>`
                : `<div class="sin-room-comment-piece sin-room-comment-comment">${sanitize(comment.text)}</div>`,
      }).appendTo(commentsContainer);
    }

    mansonry = new Masonry('.sin-room-comments', {
      itemSelector: ".sin-room-comment-item"
    });

    $('#sin-room-comment-text').on('input', function() {
      if ($('#sin-room-comment-text').val().trim()) {
        $('#sin-room-comment-submit').addClass('submit-allowed');
      } else {
        $('#sin-room-comment-submit').removeClass('submit-allowed');
      }
    });

    $('#sin-room-comment-submit').click(function(event) {
      const name = $('#sin-room-comment-name').val().trim();
      const text = $('#sin-room-comment-text').val().trim();
      if (text) {
        const fragment = document.createDocumentFragment();
        const newComment = $('<div />', {
          "class": 'sin-room-comment-item',
          html: name
                  ? `<div class="sin-room-comment-piece sin-room-comment-comment">${sanitize(text)}</div>
                    <div class="sin-room-comment-piece sin-room-comment-name">${sanitize(name)}</div>`
                  : `<div class="sin-room-comment-piece sin-room-comment-comment">${sanitize(text)}</div>`,
        })[0];

        fragment.appendChild(newComment);
        commentsContainer[0].insertBefore( fragment, commentsContainer[0].firstChild );
        mansonry.prepended(newComment);

        const newCommentRef = firebase.database().ref(`${language}/sin`).push();
        newCommentRef.set({
            name,
            text,
        });

        window.scrollTo(0, 0);

        $('.comment-opener').css('display', 'none');
        $('.sin-room-comment-submission-container').css('display', 'none');
        $('.sin-room-comment-submission-message').css('display', 'block');
      }
      event.preventDefault();
    })
  }

  function waitForFirebase() {
    if (!firebase) {
      setTimeout(waitForFirebase, 1000);
    } else {
      fetchComments();
    }
  }

  function fetchComments() {
    // Firebase script must run first and define firebase as global variable
    if (firebase) {
      const database = firebase.database();
      const comments = [];
      database.ref(`${language}/sin`).limitToLast(300).once('value', function(snapshot) {
        snapshot.forEach((childSnapshot) => {
          comments.unshift(childSnapshot.val());
        });
        setupCommentsSection(comments);
      });
    }
  }

  // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
  // left: 37, up: 38, right: 39, down: 40,
  var keys = {32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1, 40: 1};

  function preventDefault(e) {
    e.preventDefault();
  }

  function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
      e.preventDefault();
      return false;
    }
  }

  function disableScroll() {
    window.addEventListener('wheel', preventDefault, { passive: false }); // modern desktop
    window.addEventListener('touchmove', preventDefault, { passive: false }); // mobile
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
    $('body').addClass('hide-scrollbar');
  }

  function enableScroll() {
    window.removeEventListener('wheel', preventDefault, { passive: false });
    window.removeEventListener('touchmove', preventDefault, { passive: false });
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    $('body').removeClass('hide-scrollbar');
  }
}
