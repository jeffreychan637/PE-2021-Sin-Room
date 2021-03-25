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
let numberOfElementsPerLayer =  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 2, 2, 3, 3, 0, 4, 4, 4, 5, 5, 5, 6, 6];
let revealDistance = 1500; // the distance when we begin to reveal a card
let changeDistance = 300; // the distance we begin to change a card from the sin word to the sentence
let finalSceneElementsFadeDistance = -100; // the distance that the final scene card fades out (visibility -> hidden)
let initialDistanceBuffer = 1500;
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

let slope = (0.5 - 2) / (8 - 1);
let b = (1.5 / 7) + 2;

// let imageClasses = {};
// let imageClassesArray;

let endingStackedCards;
let stackedCardsArray = [];

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
  console.log(usedPositions);
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

function onSinCardButtonClick() {
  const button = $(this);
  const sinCard = button.parent();
  const sinWord = sinCard.children().first();
  if (!button.hasClass('buttonClicked')) {
    button.addClass('buttonClicked');
    sinCard.addClass('sin-card-red-border');
    sinWord.addClass('fill-in');
  } else {
    button.removeClass('buttonClicked');
    sinCard.removeClass('sin-card-red-border');
    sinWord.removeClass('fill-in')
  }
}


Webflow.push(function () {
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
  finalSceneElements = $('.final-scene-card');
  indexOfFirstSinWordElement = allElements.index(finalSceneElements.first());
  console.log(indexOfFirstSinWordElement);

  ogCardParents = $('.og-card-parent');
  newCardParents = $('.new-card-parent');
  sinSentences = $('.sin-sentence');
  sinWords = $('.sin-word');
  veryLastCard = $('.very-last-card');
  endingStackedCards = $('.ending-stacked-card');

  cardElements = $('.card');  // $('.cards-scene').children();
  numberOfLayers = getNumberOfLayers(cardElements.length);

  let elementsInLayerArrayIndex = 0;
  let numElementsLeftInLayer = numberOfElementsPerLayer[elementsInLayerArrayIndex];
  let currentLayerNumber = 1;

  for (let i = 0; i < indexOfFirstSinWordElement;) {
    // TODO: Fix random so they can't overlap over each other (e.g. one card is high and one card is low)
    // const randomX =  Math.floor(Math.random() * 50) - 25;
    // const randomY = Math.floor(Math.random() * 100) - 50;
    // const randomY = Math.floor(Math.random() * 50) - 25;

    if (numElementsLeftInLayer !== 0) {
      const numberOfElementsInLayer = (numberOfElementsPerLayer[elementsInLayerArrayIndex] || 8);
      const randomX = 0;
      const randomY = 0;
      const zValue = itemZ * cameraSpeed * 
        (currentLayerNumber) 
        + initialDistanceBuffer + 
        (Math.random() * 300 * numberOfElementsInLayer);
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

  const startZValueForFinalScene = cardElementsZValues[cardElementsZValues.length - 1] + 3000;
  console.log(cardElementsZValues);
  console.log(startZValueForFinalScene);


  finalSceneElements.each(function(index) {
    const zValue = startZValueForFinalScene + ((index + 1) * 1000);
    $(this).css('transform', `translateZ(-${zValue}px)`);
    // $(this).css('visibility', 'hidden');
    finalSceneElementsZValues.push(zValue);
  });

  // elementsInLayerArrayIndex = 0;
  // numElementsLeftInLayer = numberOfElementsPerLayer[elementsInLayerArrayIndex];
  currentLayerNumber = 1;
  const startZValueForSinWordElements = finalSceneElementsZValues[finalSceneElementsZValues.length - 1] + 100;

  // Positioning of sin words at the end
  cardElements.each(function(index) {
    if (index >= indexOfFirstSinWordElement) {
      // TODO: Fix random so they can't overlap over each other (e.g. one card is high and one card is low)
      // const randomX =  Math.floor(Math.random() * 50) - 25;
      // const randomY = Math.floor(Math.random() * 100) - 50;
      // const randomY = Math.floor(Math.random() * 50) - 25;

      const randomX = 0;
      const randomY = 0;
      const zValue = itemZ * cameraSpeed * currentLayerNumber + startZValueForSinWordElements;
      cardElementsZValues.push(zValue);
      console.log(itemZ, cameraSpeed, currentLayerNumber, startZValueForSinWordElements, zValue);

      currentLayerNumber += 1.5;

      // $(this).children().each(function() { $(this).text(index) });
      $(this).css('transform', `translate3d(${randomX}%, ${randomY}%, -${zValue}px`);
      // $(this).css('opacity', '0%');
    }
  });

  veryLastWordsZValue = cardElementsZValues[cardElementsZValues.length - 1] + 2000;
  veryLastCard.css('transform', `translate3d(${0}%, ${0}%, -${veryLastWordsZValue}px`);
  // veryLastCard.css('visibility', 'hidden');

  setFinalCardPositions(endingStackedCards);
  buildStackedCardsArray();
  
  // Setup button on-click functions
  $('.button').click(onSinCardButtonClick);
  $('.open-comments-btn').click(enterCommentsSection);



  viewportHeight = setSceneHeight(); // after the number of layers and z-index values are determined
  console.log('viewportHeight', viewportHeight);
  $('.viewport').css('visibility', 'visible');

  // Auto Scroll Testing
  $('html, body').animate({ 
    scrollTop: document.body.clientHeight - window.innerHeight
  }, 90000, "linear");

  $('.viewport').click(function() {
    $('html, body').stop();
  })

  setupCommentsSection();

  // $('.sin-word-scene').children().each(function(index) {
  //   const zValue = Math.floor(((itemZ / 1) * cameraSpeed * numberOfLayers) / 2 * (index + 1)) + initialDistanceBuffer;
  //   // divide distance because it's traveling at a lower speed than the regular cards
  //   sinWordElementZValues.push(zValue);
  //   $(this).css('transform', `translateZ(-${zValue}px)`);
  //   $(this).css('visibility', 'hidden');
  // });
});

const cardBeginRevealD = 2500;
const cardEndRevealD = 2250;
const cardRevealSpace = cardBeginRevealD - cardEndRevealD;

const sinWordBeginRevealD = 1000;
const sinWordEndRevealD = 500;
const sinWordRevealSpace = sinWordBeginRevealD - sinWordEndRevealD;

const cardChangeBeginD = 300;
const cardChangeEndD = 100;
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


  // console.log(window.pageYOffset);
  cardElementsZValues.forEach(function(value, index) {
    // TODO - store cardElements.eq(index) in a variable for more efficiency???

    // console.log(index, value, window.pageYOffset, value - window.pageYOffset);
    const distanceFromUser = value - window.pageYOffset;
    if (index < indexOfFirstSinWordElement) {
      // get the second child of the current card element
      // is is an empty object if the card does not have a newCardParent
      let oldCardParent;
      let newCardParent;
      const cardParent = $(cardElements.eq(index).children()[0]);
      if  (cardParent.hasClass('og-card-parent')) {
        oldCardParent = cardParent;
        if ($(cardElements.eq(index).children()[1]).length) {
            newCardParent = $(cardElements.eq(index).children()[1]); // TODO: cleanup
        }
      } else {
          newCardParent = cardParent;
      }
    //   const newCardParent = $(cardElements.eq(index).children()[1]);
    //   let hasNewCardParent = newCardParent.length;

      if (distanceFromUser < cardBeginRevealD && distanceFromUser > cardEndRevealD) {
        // Transitions for when card is just appearing
        cardElements.eq(index).css('opacity', `${((cardBeginRevealD - distanceFromUser) / cardRevealSpace * 100)}%`);
        // Also reset cards (e.g. remove sin word and sin sentences) just in case they never changed back
        if (oldCardParent) {
            ogCardParents.eq(index).css('opacity', `100%`);
            sinWords.eq(index).css('opacity', `0%`);
            if (newCardParent) {
                newCardParent.css('opacity', `0%`);
            }
        } else if (newCardParent) {
            newCardParent.css('opacity', `100%`);
        }
      } else if (oldCardParent && distanceFromUser < sinWordBeginRevealD && distanceFromUser > sinWordEndRevealD) {
        // Transitions for when card is traveling toward user (Sin Word being revealed)
        sinWords.eq(index).css('opacity', `${((sinWordBeginRevealD - distanceFromUser) / sinWordRevealSpace * 100)}%`);
      } else if (newCardParent && oldCardParent && distanceFromUser < cardChangeBeginD && distanceFromUser > cardChangeEndD) {
        // Transtions for when card is right up to the user (Card change happening to reveal sin sentence)
        ogCardParents.eq(index).css('opacity', `${100 - ((cardChangeBeginD - distanceFromUser) / cardChangeSpace * 100)}%`);
        newCardParent.css('opacity', `${((cardChangeBeginD - distanceFromUser) / cardChangeSpace * 100)}%`);
      }

      // Finish up the transitions above in case user scrolls quickly and events don't fire within the reveal/change space
      if (distanceFromUser > 0) {
        if (distanceFromUser < cardEndRevealD) {
          cardElements.eq(index).css('opacity', `100%`);
        } else if (distanceFromUser > cardBeginRevealD && distanceFromUser < cardBeginRevealD + 2000) {
          cardElements.eq(index).css('opacity', `0%`);
        }
        if (distanceFromUser < sinWordEndRevealD && distanceFromUser > cardChangeBeginD) {
          // complete show the sin word after reveal time unless we've hit the card change time (since that's when sin word begins to fade)
          if (oldCardParent) {
            ogCardParents.eq(index).css('opacity', `100%`);
            sinWords.eq(index).css('opacity', `100%`);
          }
          if (newCardParent && !oldCardParent) {
            newCardParent.css('opacity', `0%`);
          }
        } else if (oldCardParent && distanceFromUser > sinWordBeginRevealD && distanceFromUser < cardBeginRevealD) {
          // hide sin word before reveal time [ stop checking if we haven't even revealed the card yet ]
          sinWords.eq(index).css('opacity', `0%`);
        }
        if (newCardParent && distanceFromUser < cardChangeEndD) {
          // sinWords.eq(index).css('opacity', `${sinWordMinOpacity}%`);
          ogCardParents.eq(index).css('opacity', `0%`);
          newCardParent.css('opacity', `100%`);
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
      if (distanceFromUser < markSinWordsrevealDistance && distanceFromUser > 0) {
        cardElements.eq(index).css('opacity', `${100 - (distanceFromUser / markSinWordsrevealDistance * 100)}%`);
      } else if (distanceFromUser > markSinWordsrevealDistance && distanceFromUser < markSinWordsrevealDistance + 2000) { // Finish up transitions above
        cardElements.eq(index).css('opacity', `0%`);
      } else if (distanceFromUser < 0 && distanceFromUser > -200) {
        cardElements.eq(index).css('opacity', `100%`);
      }

      // final stacked cards
      let stackedCards = stackedCardsArray[index - indexOfFirstSinWordElement];
      if (stackedCards) {
        if (distanceFromUser > stackedCardsRevealD && distanceFromUser < stackedCardsRevealD + 500) {
          // Mark 7 sin word still far away
          // set opacity 0;
          stackedCards.each(function(index) {
            stackedCards.eq(index).css('opacity', '0%');
            stackedCards.eq(index).css('box-shadow', '0px 20px 20px -10px rgba(0, 0, 0, 0.66)');
          });
        } else if (distanceFromUser < stackedCardsRevealD && distanceFromUser > stackedCardsBeginFadeD) {
          // Mark 7 sin word has appeared
          stackedCards.each(function(index) {
            stackedCards.eq(index).css('opacity', `${((stackedCardsRevealD - distanceFromUser) / stackedCardRevealSpace * 100)}%`);
          });
        } else if (distanceFromUser < stackedCardsBeginFadeD && distanceFromUser > stackedCardsEndFadeD) {
          // Mark 7 sin word is very close
          stackedCards.each(function(index) {
            stackedCards.eq(index).css('opacity', `${100 - ((stackedCardsBeginFadeD - distanceFromUser) / stackedCardFadeSpace * 0.67 * 100)}%`);
          });
        } else if (distanceFromUser < -200 && distanceFromUser > -500) {
          // Mark 7 sin word has passed
          // complete fade here
          stackedCards.each(function(index) {
            stackedCards.eq(index).css('opacity', '33%');
            stackedCards.eq(index).css('box-shadow', 'none');
          });
        }
      }
    }
  });

  finalSceneElementsZValues.forEach(function(value, index) {
    // console.log(index, value, window.pageYOffset, value - window.pageYOffset);
    const distanceFromUser = value - window.pageYOffset;
    if (distanceFromUser < finalSceneElementsFadeDistance) {
      finalSceneElements.eq(index).css('opacity', '0'); // fade it out as it gets closer to user
    } else if (distanceFromUser < revealDistance && distanceFromUser > 0) { // todo: only run this if you have to
      //figure out ways to make this costly code more efficient
      
      // finalSceneElements.eq(index).css('visibility', 'visible');
      finalSceneElements.eq(index).css('opacity', `${(distanceFromUser - finalSceneElementsFadeDistance) / (revealDistance - finalSceneElementsFadeDistance) * 100}%`);
    } else if (distanceFromUser > revealDistance && distanceFromUser < revealDistance + 500) { // small window for it to change back
      finalSceneElements.eq(index).css('opacity', '0');
    }
  });

  const lastWorddistanceFromUser = veryLastWordsZValue - window.pageYOffset;
  if (lastWorddistanceFromUser < revealDistance && lastWorddistanceFromUser > 0) {
    veryLastCard.css('opacity', `${100 - (lastWorddistanceFromUser * 1000 / revealDistance / 10) + 10 }%`);
  } else if (lastWorddistanceFromUser > revealDistance && lastWorddistanceFromUser < revealDistance + 200) { // small window for it to change back
    veryLastCard.css('opacity', '0');
  }

  // Show Comments Button
  const currentScrollLocation = window.pageYOffset + window.innerHeight;
  if (currentScrollLocation > viewportHeight - 2) {
    $('.open-comments-btn-container').addClass('show');
  } else if (currentScrollLocation < viewportHeight - 2 && currentScrollLocation > viewportHeight - 500) {
    // hide if we're not at the end
    // but stop hiding at a certain point because it should have already been hidden
    $('.open-comments-btn-container').removeClass('show');
  }
}

function setSceneHeight() {
  const height =
    window.innerHeight +                                             // viewport height
    scenePerspective * cameraSpeed +                                 // container perspective value
    veryLastWordsZValue - 800;    // stop 200 before we get to last words so last words just pauses there.
    // itemZ * cameraSpeed * numberOfLayers + initialDistanceBuffer;    // translateZ value of last element

  // Update --viewportHeight value
  document.documentElement.style.setProperty("--viewportHeight", height);
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
  console.log('clicked enter comments button');
  
  viewport.css('opacity', 0);
  
  window.setTimeout(function() {
    viewport.css('display', 'none');
    window.scrollTo(0, 0);
    $('.sin-room-comments-wrapper').css('display', 'block');
    // window.scrollTo(0, document.body.scrollHeight);
    $('html, body').animate({ 
      scrollTop: document.body.clientHeight - window.innerHeight
    }, 1400, "linear", function() {
      // after auto scroll, set container to be fixed in place
      commentsWrapper.css('height', '100vh');
    });
  }, 500); // wait till after fixed elements in sin room finish fading
}

function setupCommentsSection() {
  // This could have easily been done in Webflow. I didn't like their very specific
  // format for forms that we'd be forced to use though, so I decided to just do this manually myself.
  const commentSubmissionBox = document.querySelector('.sin-room-comment-submission-container');
  const textarea = document.createElement('textarea');
  textarea.placeholder = 'How did you relate to the crowd?';
  
  const input = document.createElement('input');
  input.placeholder = 'Name (optional)';
  
  const button = document.createElement('button');
  button.textContent = 'Submit';

  commentSubmissionBox.appendChild(textarea);
  commentSubmissionBox.appendChild(input);
  commentSubmissionBox.appendChild(button);
  
  fetchComments();
}

function fetchComments() {
  // make sure runs asynchronously fetching comments in background
  // once comments arrive, place them into grid
}
