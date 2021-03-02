/* 
Actual Values stored in CSS. Defaults are here just in case.
Can probably remove because the code that needs these value only runs after these values are set.
*/
let itemZ = 1;
let scenePerspective = 1;
let cameraSpeed = 600;
let perspectiveOrigin = { x: 50, y: 50, maxGap: 30 };

let numberOfLayers = 1;
let numberOfElementsPerLayer =  [1, 1, 8]; //[8, 8, 8]; // [1, 1, 2, 3, 4, 4];
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
let sinWords; // only the one on cards not the ones at the end
let sinSentences;
let veryLastWordsZValue = 0;
let veryLastCard;

Webflow.push(function () {
  // DOMready has fired
  // May now use jQuery and Webflow api
  window.addEventListener("scroll", moveCamera);
  // window.addEventListener("mousemove", moveCameraAngle);
  getCSSComputedStyles();

  const allElements = $('.cards-scene').children();
  finalSceneElements = $('.final-scene-card');
  indexOfFirstSinWordElement = allElements.index(finalSceneElements.first());

  sinSentences = $('.sin-sentence');
  sinWords = $('.sin-word');
  veryLastCard = $('.very-last-card');

  cardElements = $('.card');  // $('.cards-scene').children();
  numberOfLayers = getNumberOfLayers(cardElements.length);

  let elementsInLayerArrayIndex = 0;
  let numElementsLeftInLayer = numberOfElementsPerLayer[elementsInLayerArrayIndex];
  let currentLayerNumber = 1;

  cardElements.each(function(index) {
    if (index < indexOfFirstSinWordElement) {
      // TODO: Fix random so they can't overlap over each other (e.g. one card is high and one card is low)
      // const randomX =  Math.floor(Math.random() * 50) - 25;
      // const randomY = Math.floor(Math.random() * 100) - 50;
      // const randomY = Math.floor(Math.random() * 50) - 25;

      const randomX = 0;
      const randomY = 0;
      const zValue = itemZ * cameraSpeed * currentLayerNumber + initialDistanceBuffer + (Math.random() * 1500);
      // give the same value to the next 4 elements
      // add a little bit of variation at the end.
      cardElementsZValues.push(zValue);

      // logic for making sure that we set the right number of cards per layer
      numElementsLeftInLayer -= 1;
      if (!numElementsLeftInLayer) {
        currentLayerNumber += 1;
        elementsInLayerArrayIndex += 1;
        numElementsLeftInLayer = elementsInLayerArrayIndex < numberOfElementsPerLayer.length
          ? numberOfElementsPerLayer[elementsInLayerArrayIndex] : 4;
      }

      // $(this).children().each(function() { $(this).text(index) });
      $(this).css('transform', `translate3d(${randomX}%, ${randomY}%, -${zValue}px`);
      // $(this).css('opacity', '0%');
    }
  });

  const startZValueForFinalScene = cardElementsZValues[cardElementsZValues.length - 1] + 2000;
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
      const zValue = itemZ * cameraSpeed * currentLayerNumber + startZValueForSinWordElements + (Math.random() * 100);
      // give the same value to the next 4 elements
      // add a little bit of variation at the end.
      cardElementsZValues.push(zValue);

      currentLayerNumber += 1;

      // $(this).children().each(function() { $(this).text(index) });
      $(this).css('transform', `translate3d(${randomX}%, ${randomY}%, -${zValue}px`);
      // $(this).css('opacity', '0%');
    }
  });

  veryLastWordsZValue = cardElementsZValues[cardElementsZValues.length - 1] + 1500;
  veryLastCard.css('transform', `translate3d(${0}%, ${0}%, -${veryLastWordsZValue}px`);
  // veryLastCard.css('visibility', 'hidden');


  setSceneHeight(); // after the number of layers and z-index values are determined
  $('.viewport').css('visibility', 'visible');

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

const cardChangeBeginD = 350;
const cardChangeEndD = 250;
const cardChangeSpace = cardChangeBeginD - cardChangeEndD;

const markSinWordsrevealDistance = 1500;

const sinWordMinOpacity = 10;

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
    // console.log(index, value, window.pageYOffset, value - window.pageYOffset);
    const distanceFromUser = value - window.pageYOffset;
    if (index < indexOfFirstSinWordElement) {
      if (distanceFromUser < cardBeginRevealD && distanceFromUser > cardEndRevealD) {
        // Transitions for when card is just appearing
        cardElements.eq(index).css('opacity', `${((cardBeginRevealD - distanceFromUser) / cardRevealSpace * 100)}%`);
      } else if (distanceFromUser < sinWordBeginRevealD && distanceFromUser > sinWordEndRevealD) {
        // Transitions for when card is traveling toward user (Sin Word being revealed)
        sinWords.eq(index).css('opacity', `${((sinWordBeginRevealD - distanceFromUser) / sinWordRevealSpace * 100)}%`);
      } else if (distanceFromUser < cardChangeBeginD && distanceFromUser > cardChangeEndD) {
        // Transtions for when card is right up to the user (Card change happening to reveal sin sentence)
        sinWords.eq(index).css('opacity', `${100 - ((cardChangeBeginD - distanceFromUser) / cardChangeSpace * 100) + sinWordMinOpacity}%`);
        sinSentences.eq(index).css('opacity', `${((cardChangeBeginD - distanceFromUser) / cardChangeSpace * 100)}%`);
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
          sinWords.eq(index).css('opacity', `100%`);
          sinSentences.eq(index).css('opacity', `0%`);
        } else if (distanceFromUser > sinWordBeginRevealD && distanceFromUser < cardBeginRevealD) {
          // hide sin word before reveal time [ stop checking if we haven't even revealed the card yet ]
          sinWords.eq(index).css('opacity', `0%`);
        }
        if (distanceFromUser < cardChangeEndD) {
          sinWords.eq(index).css('opacity', `${sinWordMinOpacity}%`);
          sinSentences.eq(index).css('opacity', `100%`);
        }
      }

      // ONE-TIME TRANSITIONS for the card when it gets right up to the user here
      if (distanceFromUser < cardChangeBeginD) {
        cardElements.eq(index).css('background-image', 'none');
        cardElements.eq(index).css('background-color', 'white');
      } else if (distanceFromUser > cardChangeBeginD && distanceFromUser < sinWordEndRevealD) {
        cardElements.eq(index).css('background-color', '#222'); 
        
        
        
        // TODO: Change image back to cracked image
         // store the URLs on page load into a hashmap
         // then depending on what class this card element has, change it back to one of the images (separate function)
      
      
      
      
      }
    } else { // final Mark 7 sin word cards
      if (distanceFromUser < markSinWordsrevealDistance && distanceFromUser > 0) {
        cardElements.eq(index).css('opacity', `${100 - (distanceFromUser / markSinWordsrevealDistance * 100)}%`);
      } else if (distanceFromUser > markSinWordsrevealDistance && distanceFromUser < markSinWordsrevealDistance + 2000) { // Finish up transitions above
        cardElements.eq(index).css('opacity', `0%`);
      } else if (distanceFromUser < 0 && distanceFromUser > -200) {
        cardElements.eq(index).css('opacity', `100%`);
      }
    }
  });

  // TODO: Clean up this opacity fade in and fade out - finish the transition from visibility to opacity
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

  // TODO: Clean up this opacity fade in and fade out - finish the transition from visibility to opacity
  const lastWorddistanceFromUser = veryLastWordsZValue - window.pageYOffset;
  if (lastWorddistanceFromUser < revealDistance && lastWorddistanceFromUser > 0) {
    veryLastCard.css('opacity', `${100 - (lastWorddistanceFromUser * 1000 / revealDistance / 10) + 10 }%`);
  } else if (lastWorddistanceFromUser > revealDistance && lastWorddistanceFromUser < revealDistance + 200) { // small window for it to change back
    veryLastCard.css('opacity', '0');
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
