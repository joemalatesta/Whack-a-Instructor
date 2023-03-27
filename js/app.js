const availableCharacters = [
  {
    name: "hunter",
    displayTimeInSeconds: 1.5,
    score: 1,
    role:'TA'
  },
  {
    name: "jackson",
    displayTimeInSeconds: 1.5,
    score: 1,
    role:'TA'
  },
  {
    name: "ian",
    displayTimeInSeconds: 2.5,
    score: 1,
    role:'IA'
  },
  {
    name: "jurgen",
    displayTimeInSeconds: 2.5,
    score: 1,
    role:'IA'
  },
  {
    name: "joe",
    displayTimeInSeconds: 2.5,
    score: 1,
    role:'IA'
  },
  {
    name: "beryl",
    displayTimeInSeconds: 2.5,
    score: 2,
    role:'IA'
  },
  {
    name: "emily",
    displayTimeInSeconds: 2,
    score: 2,
    role:'TA'
  },
  {
    name: "ben",
    displayTimeInSeconds: 1.5,
    score: 3,
    role:'IL'
  },
  {
    name: "david",
    displayTimeInSeconds: 1.5,
    score: 3,
    role:'IL'
  },
]

let boing = new Audio('../sounds/boing.mp3')
let doink = new Audio('../sounds/doink.mp3')
let oof = new Audio('../sounds/Ooof.mp3')
let oww = new Audio('../sounds/Oww.mp3')
let pop = new Audio('../sounds/pop.mp3')

const randomArrayItem = (...value) => { 
  let item = value[Math.floor(Math.random() * value.length)]
  return item
}



class Character {
  constructor(name, displayTimeInSeconds, score) {
    this.name = name
    this.displayTimeInSeconds = displayTimeInSeconds
    this.score = score
  }
}

class Hole {
  constructor(num) {
    this.isDisplaying = false
    this.img = document.querySelector(`.hole${num} > .character`)
    this.holeCircle = document.querySelector(`.hole${num}`)
    this.clickFunction = null
  }

  display(character, game) {
    if (this.isDisplaying) {
      return
    }

    this._showCharacterInHole(character.name)
    this._setClickFunction(character, game)
    this.img.addEventListener("click", this.clickFunction)
    this.isDisplaying = true
    this._clearImgTimeout(character.displayTimeInSeconds)
  }

  _setClickFunction(character, game) {
    this.clickFunction = (e) => {
      e.preventDefault()
      this.holeCircle.style.border = "7px solid gold"
      trackScore(character.score, character.name)
      showHitCharacterScore(character.score)
      this._clearImg();
      clearTimeout(this._clearImgTimeout(character.displayTimeInSeconds))
      this._clearCircle()
    };
  }

  _showCharacterInHole(characterName) {
    this.img.removeAttribute("hidden");
    this.img.setAttribute("src", `images/${characterName}.png`)
  }

  _clearCircle() {
    setTimeout(() => {
      this.holeCircle.style.border = ""
    }, 200)
  }

  _clearImg() {
    this.img.setAttribute("hidden", true)
    this.isDisplaying = false
    this.img.removeEventListener("click", this.clickFunction)
  }

  _clearImgTimeout(characterDisplayTimeInSeconds) {
    setTimeout(() => {
      this._clearImg()
    }, characterDisplayTimeInSeconds * 1000)
  }
}

let gameScore = 0
let gameTimeLeft = 30
let bonusTATime = 20
let bonusILTime = 10
let countDownIntervalTimer = null
let character = null
let holes = new Array(12).fill().map((_, index) => new Hole(index))
let totalHitCharacters = availableCharacters.reduce((acc, curr) => {
  acc[curr.name] = 0
  return acc
}, {})

const startGame = () => {
  document.querySelector(".score").innerText = 0
  countDown()
  createCharacter()
}

const countDown = () => {
  if (countDownIntervalTimer) {
    clearInterval(countDownIntervalTimer)
  }
  const displayTime = document.querySelector(".time")
  countDownIntervalTimer = setInterval(() => {
    gameTimeLeft--;
    displayTime.innerText = gameTimeLeft
    if (gameTimeLeft === bonusILTime) {
      displayTime.style.color = "red"
    }
    if (gameTimeLeft === 0) {
      clearInterval(countDownIntervalTimer)
      displayTime.style.color = "black"
      pop.play()
      gameOver()
    }
  }, 1000);
}

const gameOver = () => {
  button.disabled = false;
  holes.forEach((hole) => hole._clearImg())
  showModal()
}

const  createCharacter = () => {
  const CREATE_CHARACTER_INTERVAL_MS = 700
  const instantiate = setInterval(() => {
    if (gameTimeLeft === 0) {
      clearInterval(instantiate)
      return;
    }
    for (let character of availableCharacters) {
      const char = new Character(
        character.name,
        character.displayTimeInSeconds,
        character.score
      )
      if (
        (gameTimeLeft <= bonusILTime &&
          (character.role === "IL")) ||
        (gameTimeLeft > bonusTATime && character.role === "IA") || 
        (gameTimeLeft <= bonusTATime && gameTimeLeft >= bonusILTime && (character.role === 'TA'))
      ) {
        showCharacter(char)
      }
    }
  }, CREATE_CHARACTER_INTERVAL_MS)
}

const showCharacter = (character) => {
  const randomNumber = Math.floor(Math.random() * 18)
  const hole = holes[randomNumber]
  hole.display(character,this)
}

const trackScore = (score, characterName) => {
  gameScore += score
  document.querySelector(".score").innerText = gameScore
  totalHitCharacters[characterName]++
  let sound = randomArrayItem(oof,oww,boing,doink)
  sound.playbackRate = 4
  sound.play()
}

const showHitCharacterScore = (score) => {
  const showPoints = document.querySelector(".points")
  showPoints.removeAttribute("hidden")
  showPoints.setAttribute("src", `./images/${score}.png`)
  const HIDE_SCORE_DELAY_MS = 400
  setTimeout(() => {
    showPoints.setAttribute("hidden", true)
  }, HIDE_SCORE_DELAY_MS);
}


const showModal = () => {
  document.querySelector(".finalScore").innerText = gameScore;
  const message = Object.entries(totalHitCharacters).reduce(
    (accu, [key, value]) => {
      accu += `${key}: ${value} times </br>`
      return accu;
    },
    ""
  )
  document.querySelector(".scoreDetails").innerHTML = message
  const myModal = new bootstrap.Modal(document.querySelector(".modal"))
  myModal.show();
}


const button = document.querySelector(".gameButton")
button.addEventListener("click", (e) => {
  e.preventDefault()
  gameTimeLeft = 30
  gameScore = 0
  countDownIntervalTimer = null
  character = null
  button.disabled = true
  startGame()
});
