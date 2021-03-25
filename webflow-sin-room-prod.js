const prodFlag = true;

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
let numberOfElementsPerLayer =  [1, 2, 1, 2, 2, 3, 4, 4, 4, 4, 5, 5, 5, 7, 4];
//[1, 1, 2, 2, 3, 3, 4, 5, 6, 6, 6, 7, 7, 7, 7, 8]; //[1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 2, 2, 3, 3, 0, 4, 4, 4, 5, 5, 5, 6, 6];
let revealDistance = 1500; // the distance when we begin to reveal a card
let changeDistance = 300; // the distance we begin to change a card from the sin word to the sentence
let finalSceneElementsFadeDistance = -100; // the distance that the final scene card fades out (visibility -> hidden)
let initialDistanceBuffer = 1000; // + 2700; // initial buffer + viewport height of initial scene so we don't have to restart scrolling at top
let cardElementsZValues = []; // pre-fill with 0 to account for the fact that CSS starts counting children at 1
let finalSceneElementsZValues = [];
let sinWordElementZValues = [];

let indexOfFirstSinWordElement = 0;
let cardElements;
let finalSceneElements;

let ogCardParents;
let newCardParents;

let sinWords; // only the one on cards not the ones at the end
let sinSentences;
let veryLastWordsZValue = 0;
let veryLastCard;

let viewportHeight;

let enteredMainRoom = false;
const firstCardZValue = 2000;
// const psalm23ZValue = 2000;

let slope = (0.5 - 2) / (8 - 1);
let b = (1.5 / 7) + 2;

// let imageClasses = {};
// let imageClassesArray;

let endingStackedCards;
let stackedCardsArray = [];

let mansonry;
let commentsContainer;

let openingNarrationAudio;
let spotlight;
let mouseOverEventListenerActive = false;
let clickSelectCardText;

/* Given a list of card elements, position them randomly across the screen.
 * Ranges: top: -70vh - 130vh, left: -70vw - 130vw
 */

const range = [-70, 130];
const middle = 30;
const middles = [10, 50];

const usedPositions = [[], [], [], []];
const boundary = 15; // how far away another card has to be on both sides

// const topLeftCorner = {  top: [range[0], middle], left: [range[0], middle]};
// const topRightCorner = {  top: [range[0], middle], left: [middle, range[1]]};
// const bottomLeftCorner = {  top: [middle, range[1]], left: [range[0], middle]};
// const bottomRightCorner = {  top: [middle, range[1]], left: [middle, range[1]]};
const topLeftCorner = {  top: [range[0], middles[0]], left: [range[0], middles[0]]};
const topRightCorner = {  top: [range[0], middles[0]], left: [middles[1], range[1]]};
const bottomLeftCorner = {  top: [middles[1], range[1]], left: [range[0], middles[0]]};
const bottomRightCorner = {  top: [middles[1], range[1]], left: [middles[1], range[1]]};

const corners = [topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner];
let currentCornerIndex = 0;

function setFinalCardPositions(cards) {
  cards.each(function(index) {
    const position = getUniqueRandomPosition(currentCornerIndex);
    // let currentCorner = corners[currentCornerIndex];
    // let top = getRandomInt(...currentCorner.top);
    // let left = getRandomInt(...currentCorner.left);
    cards.eq(index).css('top', `${position[0]}vh`);
    cards.eq(index).css('left', `${position[1]}vw`);
    if (currentCornerIndex === 3) {
      currentCornerIndex = 0; // reset to go back to first corner
    } else {
      currentCornerIndex += 1;
    }
  });
}

// function getUniqueRandomPos(cornerIndex) {
//   const currentCorner = corners[cornerIndex];
//   const position = {
//     top: getUniqueRandomPosForOneSide(currentCorner.top, true, cornerIndex),
//     left: getUniqueRandomPosForOneSide(currentCorner.left, false, cornerIndex)
//   };

//   usedPositions[cornerIndex].push([position.top, position.left]);
//   return position;

// }

// function getUniqueRandomPosForOneSide(range, isTop, cornerIndex) {
//   let position = getRandomInt(...range);
//   let iterations = 0
//   while (!isUniquePosition(position, isTop, cornerIndex) && iterations < 25) {
//     position = getRandomInt(...range);
//     iterations += 1;
//     if (iterations === 25) {
//       console.log('Went over 25 iterations looking for a card position');
//     }
//   }
//   return position;
// }

function getUniqueRandomPosition(cornerIndex) {
  const currentCorner = corners[cornerIndex];
  let position = [getRandomInt(...currentCorner.top), getRandomInt(...currentCorner.left)]
  let iterations = 0
  while (!isUniquePosition(position, cornerIndex) && iterations < 25) {
    position = [getRandomInt(...currentCorner.top), getRandomInt(...currentCorner.left)]
    iterations += 1;
    if (iterations === 25) {
      console.log('Went over 25 iterations looking for a card position');
    }
  }
  usedPositions[cornerIndex].push(position);
  return position;
}


// function isUniquePosition(value, isTop, cornerIndex) {
//   const index = isTop ? 0 : 1;

//   const usedValues = usedPositions[cornerIndex];
//   for (let usedValue of usedValues) {
//     const upperBound = usedValue[index] + boundary;
//     const lowerBound = usedValue[index] - boundary;
//     if (value < upperBound && value > lowerBound) {
//       return false;
//     }
//   }
//   return true;
// }

function isUniquePosition(value, cornerIndex) {
  const usedValues = usedPositions[cornerIndex];
  
  for (let usedValue of usedValues) {
    const upperTopBound = usedValue[0] + boundary;
    const lowerTopBound = usedValue[0] - boundary;
    const upperLeftBound = usedValue[1] + boundary;
    const lowerLeftBound = usedValue[1] - boundary;
    if ((value[0] < upperTopBound && value[0] > lowerTopBound) && 
      (value[1] < upperLeftBound && value[1] > lowerLeftBound)
    ) {
      return false;
    }
  }
  return true;
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
    } else {
      // button = child;
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
  const { ogParentCard, newParentCard, button } = getThisCardElements($(this));
  if (!button.hasClass('sin-room-card-button-clicked')) {
    button.addClass('show');
    ogParentCard ? ogParentCard.addClass('sin-card-yellow-border') : 0;
    newParentCard ? newParentCard.addClass('sin-card-yellow-border') : 0;
  }
}

function onSinCardEndHover() {
  const { ogParentCard, newParentCard, button } = getThisCardElements($(this));
  if (!button.hasClass('sin-room-card-button-clicked')) {
    button.removeClass('show');
    ogParentCard ? ogParentCard.removeClass('sin-card-yellow-border') : 0;
    newParentCard ? newParentCard.removeClass('sin-card-yellow-border') : 0;
  }
}

function onSinCardClick() {
  const { ogParentCard, newParentCard, button, sinWord, sinSentence } = getThisCardElements($(this));

  if (!button.hasClass('sin-room-card-button-clicked')) {
    button.addClass('sin-room-card-button-clicked');
    ogParentCard ? ogParentCard.addClass('sin-card-red-border') : 0;
    if (newParentCard) {
      newParentCard.addClass('sin-card-red-border');
      // newParentCard.children().first().addClass('fill-in');
    }
  } else {
    button.removeClass('sin-room-card-button-clicked');
    ogParentCard ? ogParentCard.removeClass('sin-card-red-border'): 0;
    if (newParentCard) {
      newParentCard.removeClass('sin-card-red-border');
      // newParentCard.children().first().removeClass('fill-in');
    }
  }
  if (sinWord) {
    DigitalWallet.write(sinWord.text().toLocaleUpperCase());
  }
  if (sinSentence) {
    DigitalWallet.write(sinSentence.text());
  }
}


Webflow.push(function () {
  console.log(DigitalWallet);
  if (prodFlag) {
    disableScroll();
  }
  // DOMready has fired
  // May now use jQuery and Webflow api
  window.addEventListener("scroll", moveCamera, {passive: true});
  // window.addEventListener("mousemove", moveCameraAngle);
  getCSSComputedStyles();

  // Pull in image URLs
  // imageClasses['rust'] = $('.rust').css('background-image');
  // imageClasses['flame'] = $('.flame').css('background-image');
  // imageClasses['ink'] = $('.ink').css('background-image');
  // imageClasses['broken-glass'] = $('.broken-glass').css('background-image');
  // imageClasses['broken-concrete'] = $('.broken-concrete').css('background-image');
  // imageClassesArray = Object.keys(imageClasses);


  const allElements = $('.cards-scene').children();
  cardElements = $('.sin-room-card');
  // finalSceneElements = $('.final-scene-card');
  // indexOfFirstSinWordElement = allElements.index(finalSceneElements.first()) - allElements.index(cardElements.first());
  // console.log(indexOfFirstSinWordElement);

  ogCardParents = $('.og-card-parent');
  newCardParents = $('.new-card-parent');
  sinSentences = $('.sin-sentence');
  sinWords = $('.sin-word');
  veryLastCard = $('.very-last-card');
  endingStackedCards = $('.ending-stacked-card');

  commentsContainer = $('.sin-room-comments');

  openingNarrationAudio = $('#player')[0];
  spotlight = $('.sin-room-spotlight');
  clickSelectCardText = $('.click-select-card')

  // cardElements = $('.card');  // $('.cards-scene').children();
  numberOfLayers = getNumberOfLayers(cardElements.length);

  let elementsInLayerArrayIndex = 0;
  let numElementsLeftInLayer = numberOfElementsPerLayer[elementsInLayerArrayIndex];
  let currentLayerNumber = 1;

  // startOpeningScene();

  // original values - 240 for sin wall and 250 for opening words
  $('.sin-wall').css('transform', `translate3d(0%, 0%, ${240}px`);
  $('.sin-wall-blanks').css('transform', `translate3d(0%, 0%, ${190}px`);
  spotlight.css('transform', `translate3d(0%, 0%, ${240}px`);
  $('.opening-mark-7-begin').css('transform', `translate3d(0%, 0%, ${270}px`);
  $('.opening-mark-7-end').css('transform', `translate3d(0%, 0%, ${270}px`);
  // $('.psalm-53').css('transform', `translate3d(0%, 0%, -${psalm23ZValue}px`);

  for (let i = 0; i < cardElements.length;) { // changed index back to 1
    // start at 1 since 0 is the intro card

    // TODO: Fix random so they can't overlap over each other (e.g. one card is high and one card is low)
    // const randomX =  Math.floor(Math.random() * 50) - 25;
    // const randomY = Math.floor(Math.random() * 100) - 50;
    // const randomY = Math.floor(Math.random() * 50) - 25;

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

  // cardElements.each(function(index) {
  //   if (index < indexOfFirstSinWordElement) {
      
  //   }
  // });

  // const startZValueForFinalScene = cardElementsZValues[cardElementsZValues.length - 1] + 3000;
  // console.log(cardElementsZValues);
  // console.log(startZValueForFinalScene);


  // finalSceneElements.each(function(index) {
  //   const zValue = startZValueForFinalScene + ((index + 1) * 1000);
  //   $(this).css('transform', `translateZ(-${zValue}px)`);
  //   // $(this).css('visibility', 'hidden');
  //   finalSceneElementsZValues.push(zValue);
  // });

  
  // currentLayerNumber = 1;
  // const startZValueForSinWordElements = finalSceneElementsZValues[finalSceneElementsZValues.length - 1] + 100;

  // // Positioning of sin words at the end
  // cardElements.each(function(index) {
  //   if (index >= indexOfFirstSinWordElement) {
  //     // TODO: Fix random so they can't overlap over each other (e.g. one card is high and one card is low)
  //     // const randomX =  Math.floor(Math.random() * 50) - 25;
  //     // const randomY = Math.floor(Math.random() * 100) - 50;
  //     // const randomY = Math.floor(Math.random() * 50) - 25;

  //     const randomX = 0;
  //     const randomY = 0;
  //     const zValue = itemZ * cameraSpeed * currentLayerNumber + startZValueForSinWordElements;
  //     cardElementsZValues.push(zValue);
  //     console.log(itemZ, cameraSpeed, currentLayerNumber, startZValueForSinWordElements, zValue);

  //     currentLayerNumber += 1.5;

  //     // $(this).children().each(function() { $(this).text(index) });
  //     $(this).css('transform', `translate3d(${randomX}%, ${randomY}%, -${zValue}px`);
  //     // $(this).css('opacity', '0%');
  //   }
  // });
  console.log(cardElementsZValues);
  veryLastWordsZValue = cardElementsZValues[cardElementsZValues.length - 1] + 1000;
  veryLastCard.css('transform', `translate3d(${0}%, ${0}%, -${veryLastWordsZValue}px`);
  // veryLastCard.css('visibility', 'hidden');

  setFinalCardPositions(endingStackedCards);
  buildStackedCardsArray();
  
  // Setup button on-click functions
  cardElements.hover(onSinCardHover, onSinCardEndHover);
  cardElements.click(onSinCardClick);
  // cardElements.eq(0).click(function() {
  //   window.setTimeout(enterMainRoom, 500); // give time for onSinCardClick to run
  // });
  $('.open-comments-btn').click(enterCommentsSection);

  waitForFirebase();

  enterMainRoom();

  // $('.sin-word-scene').children().each(function(index) {
  //   const zValue = Math.floor(((itemZ / 1) * cameraSpeed * numberOfLayers) / 2 * (index + 1)) + initialDistanceBuffer;
  //   // divide distance because it's traveling at a lower speed than the regular cards
  //   sinWordElementZValues.push(zValue);
  //   $(this).css('transform', `translateZ(-${zValue}px)`);
  //   $(this).css('visibility', 'hidden');
  // });
});

function startOpeningScene() {
  cardElements.eq(0).css('transform', `translate3d(-50%, -50%, -${firstCardZValue}px`);
  viewportHeight = setSceneHeight(firstCardZValue, "--openingSceneHeight");
  $('.opening-scene').css('visibility', 'visible');
  cardElementsZValues.push(firstCardZValue); // unnecessary but used to keep this array in line with cardElements
  $('html, body').animate({ 
    scrollTop: document.body.clientHeight - window.innerHeight
  }, 100);//5000, "swing");
}

function enterMainRoom() {
  // TEMP REMOVE THIS: 
  // cardElementsZValues.push(0);
  // USE WHEN SKIPPING OPENING SCENE

  $('.opening-scene').css('opacity', '0%');
  window.setTimeout(function() {
    $('.opening-scene').css('display', 'none');
    window.setTimeout(function() {
      enteredMainRoom = true;
      viewportHeight = setSceneHeight(veryLastWordsZValue, "--viewportHeight"); // after the number of layers and z-index values are determined
      console.log('viewportHeight', viewportHeight);
      $('.main-scene').css('display', 'block');
      $('.main-scene').css('opacity', '100%');

      // Auto Scroll Testing
      // $('html, body').animate({ 
      //   scrollTop: document.body.clientHeight - window.innerHeight
      // }, 90000, "linear");

      // window.addEventListener('mousemove', onMouseOverForSpotlight);

      // setupMark7WordsFadeInTimers();
      $('#player').attr('src', 'https://jeff-pe.surge.sh/Page5-SinInOurHearts.mp3');
      togglePlay(); // defined in audio symbol
      const originalOnTimeUpdateFunction = $('#player')[0].ontimeupdate;
      $('#player')[0].ontimeupdate = function() {
        originalOnTimeUpdateFunction();
        onBeginNarrationUpdates();
      }
      $('#player')[0].onended = () => {
        $('.audio-player').css('visibility', 'hidden');
        const player = $('#player');
        player[0].ontimeupdate = originalOnTimeUpdateFunction;
        player.attr('src', 'https://jeff-pe.surge.sh/PE21_page5_SinInOurHearts_BGM_Loop_AsYouWere.mp3');
        player.attr('loop', '');
        player[0].onended = null;
      };

      // $('.viewport').click(function() {
      //   $('html, body').stop();
      // })
    }, 0); // was 500
  }, 0); // was 1000 (after opening scene fades)
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
      transparent 80px, rgba(17, 17, 17, 1) 100px)`);
    if (!mouseOverEventListenerActive) {
      window.addEventListener('mousemove', onMouseOverForSpotlight);
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
    // $('.sin-wall-blanks').css('opacity', '50%');
    // $('.sin-wall').css('filter', 'brightness(0.5)');
    // $('.sin-wall-blanks').css('filter', 'brightness(0.5)');

    // $('.opening-mark-7-begin').css('top', '25%');
    // window.setTimeout(function() {
    //   $('.opening-mark-7-end').css('opacity', '100%');
    //   // $('.sin-room-spotlight').css('opacity', '100%');
    //   $('.sin-wall').css('opacity', '50%');
    //   $('.sin-wall-blanks').css('opacity', '50%');
    // }, 700); // time for top text to move up
  }


  if (time > 44 && time < 46) {
    $('.scroll-to-move').css('opacity', '100%');
    if (prodFlag) {
      enableScroll(); 
    }
  }
}

function onMouseOverForSpotlight(event) {
  const ratio = 1;
  let xValue =  (((event.pageX / window.innerWidth) * 0.60) + 0.2) * 100;
  let yValue = (((event.pageY / window.innerHeight) * 0.60) + 0.2) * 100;
  spotlight.css('background-image', `radial-gradient(circle at 
      ${xValue}% ${yValue}%, 
      transparent 80px, rgba(17, 17, 17, 1) 130px)`);
    // console.log(event.pageX, window.innerWidth, event.pageX / window.innerWidth);
    // console.log(event.pageY, window.innerHeight, event.pageY / window.innerHeight);
}

const firstCardBeginRevealD = 1700;
const firstCardEndRevealD = 500;
const firstCardRevealSpace = firstCardBeginRevealD - firstCardEndRevealD;

// const psalm23BeginRevealD = 1700;
// const psalm23EndRevealD = 1000;
// const psalm23RevealSpace = psalm23BeginRevealD - psalm23EndRevealD;

const cardBeginRevealD = 2500;
const cardEndRevealD = 2250;
const cardRevealSpace = cardBeginRevealD - cardEndRevealD;

const sinWordBeginRevealD = 1000;
const sinWordEndRevealD = 500;
const sinWordRevealSpace = sinWordBeginRevealD - sinWordEndRevealD;

const newParentCardBeginRevealD = 1500;
const newParentCardEndRevealD = 500;
const newParentCardRevealSpace = newParentCardBeginRevealD - newParentCardEndRevealD;

const cardChangeBeginD = 900;
const cardChangeEndD = 200;
const cardChangeSpace = cardChangeBeginD - cardChangeEndD;

const markSinWordsrevealDistance = 1500;

const sinWordMinOpacity = 10;

const stackedCardsRevealD = 1400;
const stackedCardsBeginFadeD = 500;
const stackedCardsEndFadeD = -100;
const stackedCardRevealSpace = stackedCardsRevealD - stackedCardsBeginFadeD;
const stackedCardFadeSpace = stackedCardsBeginFadeD - stackedCardsEndFadeD;

function moveCamera() {
  document.documentElement.style.setProperty("--cameraZ", window.pageYOffset);

  // const cardBeginRevealD = parseFloat(
  //   getComputedStyle(document.documentElement).getPropertyValue("--cardBeginRevealD")
  // );
  // const cardEndRevealD = parseFloat(
  //   getComputedStyle(document.documentElement).getPropertyValue("--cardEndRevealD")
  // );;
  // const cardRevealSpace = cardBeginRevealD - cardEndRevealD;
  
  // const sinWordBeginRevealD = parseFloat(
  //   getComputedStyle(document.documentElement).getPropertyValue("--sinWordBeginRevealD")
  // );
  // const sinWordEndRevealD = parseFloat(
  //   getComputedStyle(document.documentElement).getPropertyValue("--sinWordEndRevealD")
  // );
  // const sinWordRevealSpace = sinWordBeginRevealD - sinWordEndRevealD;
  
  // const cardChangeBeginD = parseFloat(
  //   getComputedStyle(document.documentElement).getPropertyValue("--cardChangeBeginD")
  // );
  // const cardChangeEndD = parseFloat(
  //   getComputedStyle(document.documentElement).getPropertyValue("--cardChangeEndD")
  // );
  // const cardChangeSpace = cardChangeBeginD - cardChangeEndD;
  
  // const markSinWordsrevealDistance = 1500;

  if (window.pageYOffset > 200 && window.pageYOffset < 800) {
    $('.scroll-to-move').css('opacity', '0%');
    window.setTimeout(function() {
      $('.scroll-to-move').css('visibility', 'hidden');
    }, 1000); // after fade out
  }

  if (window.pageYOffset > 500 && window.pageYOffset < 1000) {
    if (mouseOverEventListenerActive) {    
      window.removeEventListener('mousemove', onMouseOverForSpotlight);
      mouseOverEventListenerActive = false;
    }
  }



  if (!enteredMainRoom) {
    const distanceFromUser = firstCardZValue - window.pageYOffset;
    // guarenteed to have new card parent
    const newCardParent = $(cardElements.eq(0).children()[0]);
    if (distanceFromUser < cardEndRevealD) {
      cardElements.eq(0).css('opacity', `${((firstCardBeginRevealD - distanceFromUser) / firstCardRevealSpace * 100)}%`);
      newCardParent.css('opacity', `100%`);
    }

    const currentScrollLocation = window.pageYOffset + window.innerHeight;
    if (currentScrollLocation > viewportHeight - 2) {
      $('.enter-sin-room-link').addClass('show');
    } else if (currentScrollLocation < viewportHeight - 2 && currentScrollLocation > viewportHeight - 500) {
      // hide if we're not at the end
      // but stop hiding at a certain point because it should have already been hidden
      $('.enter-sin-room-link').removeClass('show');
    }
  } else {
    // const psalm23DistanceFromUser = psalm23ZValue - window.pageYOffset;
    // if (psalm23DistanceFromUser < psalm23BeginRevealD && psalm23DistanceFromUser > 0) {
    //   $('.psalm-53').css('opacity', `${((psalm23BeginRevealD - psalm23DistanceFromUser) / psalm23RevealSpace * 100) }%`);
    // } else if (psalm23DistanceFromUser > psalm23BeginRevealD && psalm23DistanceFromUser < psalm23BeginRevealD + 200) { // small window for it to change back
    //   $('.psalm-53').css('opacity', '0');
    // }
    
    if (window.pageYOffset > 500 && window.pageYOffset < 1000) {
      clickSelectCardText.css('visibility', 'visible');
      clickSelectCardText.css('opacity', '100%');
    } else if (window.pageYOffset > 5000 && window.pageYOffset < 5500) {
      clickSelectCardText.css('opacity', '0%'); // hide when past
      window.setTimeout(function() {
        clickSelectCardText.css('visibility', 'hidden');
      }, 1000);
    } else if (window.pageYOffset < 200) {
      clickSelectCardText.css('opacity', '0%'); // hide at beginning
      // window.setTimeout(function() {
      //   clickSelectCardText.css('visibility', 'hidden');
      // }, 1000);
    }


    // console.log(window.pageYOffset);
    cardElementsZValues.forEach(function(value, index) {
      // TODO - store cardElements.eq(index) in a variable for more efficiency???
      if (index > 0 || true) { // Skip first card from initial scene
        
        // console.log(index, value, window.pageYOffset, value - window.pageYOffset);
        const distanceFromUser = value - window.pageYOffset;
        if (true || index < indexOfFirstSinWordElement) {

          const { ogParentCard, newParentCard, button, sinWord } = getThisCardElements(cardElements.eq(index));

          if (distanceFromUser < cardBeginRevealD && distanceFromUser > cardEndRevealD) {
            // Transitions for when card is just appearing
            cardElements.eq(index).css('opacity', `${((cardBeginRevealD - distanceFromUser) / cardRevealSpace * 100)}%`);
            // Also reset cards (e.g. remove sin word and sin sentences) just in case they never changed back
            if (ogParentCard) {
              ogParentCard.css('opacity', `100%`);
              // sinWord.css('opacity', `0%`);
              // if (newParentCard) {
              //   newParentCard.css('opacity', `0%`);
              // }
            }
            if (newParentCard) {
              newParentCard.css('opacity', `100%`);
            }
          } else if (ogParentCard && distanceFromUser < sinWordBeginRevealD && distanceFromUser > sinWordEndRevealD) {
            // Transitions for when card is traveling toward user (Sin Word being revealed)
            // sinWord.css('opacity', `${((sinWordBeginRevealD - distanceFromUser) / sinWordRevealSpace * 100)}%`);
          } else if ((ogParentCard && newParentCard) && distanceFromUser < cardChangeBeginD && distanceFromUser > cardChangeEndD) {
            // Transtions for when card is right up to the user (Card change happening to reveal sin sentence)
            ogParentCard.css('opacity', `${100 - ((cardChangeBeginD - distanceFromUser) / cardChangeSpace * 100)}%`);
            // newParentCard.css('opacity', `${((cardChangeBeginD - distanceFromUser) / cardChangeSpace * 100)}%`);
          }

          // TODO rename the beginRevealD variables since they apply to both old and new parent cards
          // if (distanceFromUser < newParentCardBeginRevealD && distanceFromUser > newParentCardEndRevealD) {
          //   let brightness = (newParentCardBeginRevealD - distanceFromUser) / newParentCardRevealSpace * 100;
          //   if (brightness > 100) {
          //     brightness = 100;
          //   } else if (brightness < 20) {
          //     brightness = 20;
          //   }
          //   if (ogParentCard) {
          //     ogParentCard.css('filter', `brightness(${brightness}%)`); 
          //   } else if (newParentCard) {
          //     newParentCard.css('filter', `brightness(${brightness}%)`);
          //   }
          // }

          // TODO rename the beginRevealD variables since they apply to both old and new parent cards
          // if (ogParentCard && distanceFromUser < newParentCardBeginRevealD && distanceFromUser > newParentCardEndRevealD) {
          //   let brightness = (newParentCardBeginRevealD - distanceFromUser) / newParentCardRevealSpace * 100;
          //   if (brightness > 100) {
          //     brightness = 100;
          //   } else if (brightness < 70) {
          //     brightness = 70;
          //   }
          //   // if (ogParentCard) {
          //   ogParentCard.css('filter', `brightness(${brightness}%)`); 
          //   // } else if (newParentCard) {
          //   //   newParentCard.css('filter', `brightness(${brightness}%)`);
          //   // }
          // }

          // if (newParentCard && distanceFromUser < newParentCardBeginRevealD && distanceFromUser > newParentCardEndRevealD) {
          //   let brightness = (newParentCardBeginRevealD - distanceFromUser) / newParentCardRevealSpace * 100;
          //   if (brightness > 100) {
          //     brightness = 100;
          //   } else if (brightness < 20) {
          //     brightness = 20;
          //   }
          //   newParentCard.css('filter', `brightness(${brightness}%)`);
          // }

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
              // if (ogParentCard) {
              //   ogParentCard.css('filter', `brightness(70%)`);
              // } else if (newParentCard) {
              //   newParentCard.css('filter', `brightness(20%)`);
              // }
            } else if (distanceFromUser < newParentCardEndRevealD) {
              cardElements.eq(index).css('background-color', `rgba(17,17,17, ${0}%)`);
              // if (ogParentCard) {
              //   ogParentCard.css('filter', `brightness(100%)`);
              // } else if (newParentCard) {
              //   newParentCard.css('filter', `brightness(100%)`);
              // }
            }



            if (distanceFromUser < sinWordEndRevealD && distanceFromUser > cardChangeBeginD) {
              // complete show the sin word after reveal time unless we've hit the card change time (since that's when sin word begins to fade)
              if (ogParentCard) {
                ogParentCard.css('opacity', `100%`);
                // sinWord.css('opacity', `100%`);
                // if (newParentCard) {
                //   newParentCard.css('opacity', `0%`);
                // }
              }
            } else if (distanceFromUser > sinWordBeginRevealD && distanceFromUser < cardBeginRevealD) {
              if (ogParentCard) {
                // hide sin word before reveal time [ stop checking if we haven't even revealed the card yet ]
                // sinWords.eq(index).css('opacity', `0%`);
              }
            }
            if ((ogParentCard && newParentCard) && distanceFromUser < cardChangeEndD) {
              // sinWords.eq(index).css('opacity', `${sinWordMinOpacity}%`);
              ogParentCard.css('opacity', `0%`);
              newParentCard.css('opacity', `100%`);
            }
          }

          // ONE-TIME TRANSITIONS for the card when it gets right up to the user here
          // if (distanceFromUser < cardChangeBeginD) {
          //   cardElements.eq(index).css('background-image', 'none');
          //   cardElements.eq(index).css('background-color', 'white');
          // } else if (distanceFromUser > cardChangeBeginD && distanceFromUser < sinWordEndRevealD) {
          //   resetBackground(cardElements.eq(index));
          // }
        } else { // final Mark 7 sin word cards
          // if (distanceFromUser < markSinWordsrevealDistance && distanceFromUser > 0) {
          //   cardElements.eq(index).css('opacity', `${100 - (distanceFromUser / markSinWordsrevealDistance * 100)}%`);
          // } else if (distanceFromUser > markSinWordsrevealDistance && distanceFromUser < markSinWordsrevealDistance + 2000) { // Finish up transitions above
          //   cardElements.eq(index).css('opacity', `0%`);
          // } else if (distanceFromUser < 0 && distanceFromUser > -200) {
          //   cardElements.eq(index).css('opacity', `100%`);
          // }

          // // final stacked cards
          // let stackedCards = stackedCardsArray[index - indexOfFirstSinWordElement];
          // if (stackedCards) {
          //   if (distanceFromUser > stackedCardsRevealD && distanceFromUser < stackedCardsRevealD + 500) {
          //     // Mark 7 sin word still far away
          //     // set opacity 0;
          //     stackedCards.each(function(index) {
          //       stackedCards.eq(index).css('opacity', '0%');
          //       stackedCards.eq(index).css('box-shadow', '0px 20px 20px -10px rgba(0, 0, 0, 0.66)');
          //     });
          //   } else if (distanceFromUser < stackedCardsRevealD && distanceFromUser > stackedCardsBeginFadeD) {
          //     // Mark 7 sin word has appeared
          //     stackedCards.each(function(index) {
          //       stackedCards.eq(index).css('opacity', `${((stackedCardsRevealD - distanceFromUser) / stackedCardRevealSpace * 100)}%`);
          //     });
          //   } else if (distanceFromUser < stackedCardsBeginFadeD && distanceFromUser > stackedCardsEndFadeD) {
          //     // Mark 7 sin word is very close
          //     stackedCards.each(function(index) {
          //       stackedCards.eq(index).css('opacity', `${100 - ((stackedCardsBeginFadeD - distanceFromUser) / stackedCardFadeSpace * 0.67 * 100)}%`);
          //     });
          //   } else if (distanceFromUser < -200 && distanceFromUser > -500) {
          //     // Mark 7 sin word has passed
          //     // complete fade here
          //     stackedCards.each(function(index) {
          //       stackedCards.eq(index).css('opacity', '33%');
          //       stackedCards.eq(index).css('box-shadow', 'none');
          //     });
          //   }
          // }
        }
      }
    });

    // finalSceneElementsZValues.forEach(function(value, index) {
    //   // console.log(index, value, window.pageYOffset, value - window.pageYOffset);
    //   const distanceFromUser = value - window.pageYOffset;
    //   if (distanceFromUser < finalSceneElementsFadeDistance) {
    //     finalSceneElements.eq(index).css('opacity', '0'); // fade it out as it gets closer to user
    //   } else if (distanceFromUser < revealDistance && distanceFromUser > 0) { // todo: only run this if you have to
    //     //figure out ways to make this costly code more efficient
        
    //     // finalSceneElements.eq(index).css('visibility', 'visible');
    //     finalSceneElements.eq(index).css('opacity', `${(distanceFromUser - finalSceneElementsFadeDistance) / (revealDistance - finalSceneElementsFadeDistance) * 100}%`);
    //   } else if (distanceFromUser > revealDistance && distanceFromUser < revealDistance + 500) { // small window for it to change back
    //     finalSceneElements.eq(index).css('opacity', '0');
    //   }
    // });

    const lastWorddistanceFromUser = veryLastWordsZValue - window.pageYOffset;
    if (lastWorddistanceFromUser < revealDistance && lastWorddistanceFromUser > 0) {
      veryLastCard.css('opacity', `${100 - (lastWorddistanceFromUser * 1000 / revealDistance / 10) + 10 }%`);
    } else if (lastWorddistanceFromUser > revealDistance && lastWorddistanceFromUser < revealDistance + 200) { // small window for it to change back
      veryLastCard.css('opacity', '0');
    }

    // Show Comments Button and ending sin cards image
    const currentScrollLocation = window.pageYOffset + window.innerHeight;
    if (currentScrollLocation > viewportHeight - 2) {
      $('.ending-sin-cards-image').css('transition', 'opacity 0.5s ease-in 1s');
      $('.ending-sin-cards-image').addClass('show-50');
      $('.open-comments-btn-container').css('transition', 'all 0.5s ease-in 3s');
      $('.open-comments-btn-container').css('visibility', 'visible');
      $('.open-comments-btn-container').addClass('show');
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

// function resetBackground(element) {
//   classes = element[0].classList;
//   for (let CSSclass of classes) {
//     if (imageClassesArray.includes(CSSclass)) {
//       return element.css('background-image', imageClasses[CSSclass]);
//     }
//   }
//   element.css('background-color', '#191919');
// }


function buildStackedCardsArray() {
  stackedCardsArray = [
    $('.sexual-immorality'),
    $('.theft'),
    $('.murder'),
    $('.adultery'),
    $('.coveting'),
    $('.wickedness'),
    $('.deceit'),
    $('.sensuality'),
    $('.envy'),
    $('.slander'),
    $('.pride'),
    $('.foolishness'),
  ];
}

function enterCommentsSection() {
  const viewport = $('.viewport');
  const commentsWrapper = $('.sin-room-comments-wrapper');

  clickSelectCardText.css('display', 'none');
  
  viewport.css('opacity', 0);
  
  window.setTimeout(function() {
    viewport.css('display', 'none');
    // commentsContainer.css('opacity', '0%');
    window.scrollTo(0, 0);
    commentsWrapper.css('display', 'block');
    // window.scrollTo(0, document.body.scrollHeight);
    // $('html, body').animate({ 
    //   scrollTop: document.body.clientHeight - window.innerHeight
    // }, 1400, "linear", function() {
      // after auto scroll, set container to be fixed in place
    // commentsWrapper.css('height', '100vh');
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
              ? `<div class="sin-room-comment-piece sin-room-comment-comment">${comment.text}</div>
                 <div class="sin-room-comment-piece sin-room-comment-name">${comment.name}</div>`
              : `<div class="sin-room-comment-piece sin-room-comment-comment">${comment.text}</div>`,
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
                ? `<div class="sin-room-comment-piece sin-room-comment-comment">${text}</div>
                   <div class="sin-room-comment-piece sin-room-comment-name">${name}</div>`
                : `<div class="sin-room-comment-piece sin-room-comment-comment">${text}</div>`,
      })[0];
      
      fragment.appendChild(newComment);
      commentsContainer[0].insertBefore( fragment, commentsContainer[0].firstChild );
      mansonry.prepended(newComment);

      const newCommentRef = firebase.database().ref('en/sin').push();
      newCommentRef.set({
          name,
          text,
      });

      window.scrollTo(0, 0);

      $('.sin-room-comment-submission-container').css('display', 'none');
      $('.sin-room-comment-submission-message').css('display', 'block');
    }
    event.preventDefault();
  })
}

function waitForFirebase() {
  console.log('waiting for firebase');
  if (!firebase) {
    setTimeout(waitForFirebase, 1000);
  } else {
    console.log('firebase loaded');
    fetchComments();
  }
}

function fetchComments() {
  // Firebase script must run first and define firebase as global variable
  if (firebase) {
    const database = firebase.database();
    const comments = [];
    database.ref('en/sin').limitToLast(300).once('value', function(snapshot) {
      snapshot.forEach((childSnapshot) => {
        comments.unshift(childSnapshot.val());
      });
      console.log(comments);
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
  // window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  window.addEventListener('wheel', preventDefault, { passive: false }); // modern desktop
  window.addEventListener('touchmove', preventDefault, { passive: false }); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

function enableScroll() {
  // window.removeEventListener('DOMMouseScroll', preventDefault, false);
  window.removeEventListener('wheel', preventDefault, { passive: false }); 
  window.removeEventListener('touchmove', preventDefault, { passive: false });
  window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}
