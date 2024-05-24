let pause = document.querySelector("#pause");
let LevelAnzeige = document.querySelector("#LevelAnzeige");
let blöcke = document.querySelector("#blöcke");
let download = document.getElementById("Download");
let load = document.getElementById("Load");
let levelgröße = document.getElementById("levelgröße");
let jsonData = document.getElementById("jsonData").textContent
let seeddownload = document.getElementById("DownloadSeed");
let seedload = document.getElementById("LoadSeed");
let seed
let levelNummer = 1
let mausrad = 0
let anleitung = false
let id
let levels = []
let breiteste = 1
let höchste = 1
let pixelgröße = 50
let reset
LevelAnzeige.textContent = levelNummer + 1
pause.textContent = "Bauphase"
let c = document.getElementById("myCanvas");
var context = c.getContext("2d");
let auswahl = document.getElementById("auswahl")
let auco = auswahl.getContext("2d");
let umgebung = [[0, -1], [1, 0], [0, 1], [-1, 0]]
let wertÜbersetztung = [0, 9, 1, 2, 5, 7, 8, 6, 4, 3]
let kombination = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
  [1, 5, 4, 7, 6, 4, 5, 3, 6],
  [2, 4, 7, 8, 7, 7, 4, 5, 7],
  [3, 7, 8, 6, 6, 7, 7, 4, 4],
  [4, 6, 7, 6, 8, 6, 8, 2, 2],
  [5, 4, 7, 7, 6, 2, 2, 8, 6],
  [6, 5, 4, 7, 8, 2, 4, 2, 3],
  [7, 3, 5, 4, 2, 8, 2, 3, 3],
  [8, 6, 7, 4, 2, 6, 3, 3, 5]]
let farben = [
  [[255, 255, 255], [255, 255, 255]],
  [[122, 122, 122], [122, 122, 122]],
  [[0, 0, 255], [0, 0, 155]],
  [[255, 0, 0], [155, 0, 0]],
  [[0, 255, 0], [0, 155, 0]],
  [[0, 255, 255], [0, 155, 155]],
  [[255, 255, 0], [155, 155, 0]],
  [[150, 0, 255], [100, 0, 155]],
  [[255, 150, 0], [155, 75, 0]],
  [[0, 0, 0], [0, 0, 0]]]
let front = [[1, 0.2, 0, 0], [0.2, 1, 0, 0.8], [1, 0.2, 0.8, 0], [0.2, 1, 0, 0]]
let kante = [
  [[0.2, 0.5, 0, 0], [0.5, 0.2, 0, 0.5], [0.2, 0.5, 0.5, 0.8], [0.5, 0.2, 0.8, 0]],
  [[0.2, 0.5, 0, 0.8], [0.5, 0.2, 0.8, 0.5], [0.2, 0.5, 0.5, 0], [0.5, 0.2, 0, 0]]]
class bauteil {
  constructor(wert, richtung, extra, aktiviert) {
    this.wert = wert
    this.richtung = richtung
    this.extra = extra
    this.aktiviert = aktiviert
    this.ausgewählt = false
  }
  clear() {
    this.wert = 0
    this.richtung = 0
    this.extra = 0
    this.aktiviert = 0
  }
  copy(obj) {
    this.wert = obj.wert
    this.richtung = obj.richtung
    this.extra = obj.extra
    this.aktiviert = obj.aktiviert
  }
}
class level {
  constructor(breite, höhe, fahne, baufelder, buildableBauteile) {
    this.generator = false
    this.sandbox = false
    this.whileblock = true
    this.buildableBauteile = buildableBauteile
    this.buildstage = true
    this.cursor = 0
    this.baufelderpos = []
    this.breite = breite
    this.höhe = höhe
    this.größe = breite * höhe
    this.bauteilIteration = 0
    this.bauteile = []
    this.resetbauteile = []
    this.fahne = fahne
    this.baufeld = Array(this.größe)
    this.feld = Array(this.größe)
    while (this.fahne[0] >= breite) {
      this.fahne[0] -= this.breite
    }
    while (this.fahne[1] >= höhe) {
      this.fahne[1] -= this.höhe
    }
    for (let x = 0; x < this.größe; x++) {
      this.baufeld[x] = new bauteil(0, 0, 0, 0)
      this.feld[x] = new bauteil(0, 0, 0, 0)
    }
    for (let x = 0; x < baufelder.length; x++) {
      while (baufelder[x][0] >= this.breite) {
        baufelder[x][0] -= this.breite
      }
      while (baufelder[x][1] >= this.höhe) {
        baufelder[x][1] -= this.höhe
      }
      if (!this.baufelderpos.includes(baufelder[x][1] * this.breite + baufelder[x][0])) {
        this.baufelderpos.push(baufelder[x][1] * this.breite + baufelder[x][0])
      }
    }
    if (baufelder == "sandbox") {
      this.sandbox = true
      this.baufelderpos = []
    }
  }
  cord(x, y) {
    while (x >= this.breite) {
      x -= this.breite
    }
    while (y >= this.höhe) {
      y -= this.höhe
    }
    while (y < 0) {
      y += this.höhe
    }
    while (x < 0) {
      x += this.breite
    }
    return y * this.breite + x
  }
  posRich(pos, richtung) {
    return this.cord(pos % this.breite + umgebung[richtung][0], Math.floor(pos / this.breite) + umgebung[richtung][1])
  }
  bereich(pos, richtung) {
    this.feld[pos].ausgewählt = true
    let neu = [pos]
    let gesamt = []
    while (neu.length > 0) {
      for (let x of neu) {
        neu.splice(neu.indexOf(x), 1)
        gesamt.push(x)
        for (let z = 0; z < umgebung.length; z++) {
          if (!this.feld[this.posRich(x, z)].ausgewählt && this.feld[this.posRich(x, z)].wert != 0 && this.feld[this.posRich(x, z)].wert != 9) {
            this.feld[this.posRich(x, z)].ausgewählt = true
            neu.push(this.posRich(x, z))
          }
          if (this.feld[this.posRich(x, z)].wert == 9 && richtung == z) {
            for (let y of neu) {
              this.feld[y].ausgewählt = false
            }
            for (let y of gesamt) {
              this.feld[y].ausgewählt = false
            }
            return []
          }
        }
      }
    }
    for (let y of gesamt) {
      this.feld[y].ausgewählt = false
    }
    return gesamt
  }
  reihe(pos, richtung) {
    let origin = pos
    let reihe = []
    let x = 0
    while (true) {
      x++
      pos = this.posRich(pos, richtung)
      if (this.feld[pos].wert > 0 && this.feld[pos].wert != 9) {
        reihe.push(pos)
        if (origin == pos) {
          return reihe
        }
      } else {
        if (this.feld[pos].wert == 9) {
          return []
        }
        return reihe
      }
    }
  }
  bewegen(objekt, richtung) {
    let neubauteile = []
    for (let x of this.bauteile) {
      neubauteile.push(x)
    }
    let feldwerte = Array(objekt.length)
    for (let x = 0; x < objekt.length; x++) {
      feldwerte[x] = new bauteil(0, 0, 0, 0)
      feldwerte[x].copy(this.feld[objekt[x]])
      this.feld[objekt[x]].clear()
    }
    for (let x = 0; x < objekt.length; x++) {
      this.feld[this.posRich(objekt[x], richtung)].copy(feldwerte[x])
      neubauteile[this.bauteile.indexOf(objekt[x])] = this.posRich(objekt[x], richtung)
    }
    this.bauteile = neubauteile
  }
  ballern(pos, richtung) {
    let hit = false
    let position = pos
    while (!hit) {
      position = this.posRich(position, richtung)
      if (this.feld[position].wert > 0) {
        if (this.feld[position].wert != 9) {
          this.feld[position].clear()
          this.bauteile.splice(this.bauteile.indexOf(position), 1)
        }
        hit = true
      }
    }
  }
  kombiniere(pos, richtung) {
    let näherpos = this.posRich(pos, richtung)
    let fernerpos = this.posRich(näherpos, richtung)
    if (this.feld[näherpos].wert > 0 && this.feld[näherpos].wert != 9 && this.feld[fernerpos].wert != 9) {
      let näher = this.feld[näherpos].wert
      let ferner = this.feld[fernerpos].wert
      let fernrich = this.feld[fernerpos].richtung
      this.feld[näherpos].clear()
      this.bauteile.splice(this.bauteile.indexOf(näherpos), 1)
      if (ferner > 0) {
        this.bauteile.splice(this.bauteile.indexOf(fernerpos), 1)
      }
      this.bauteile.push(fernerpos)
      let dazu = 0
      if (kombination[näher][ferner] == 8 && (fernrich == richtung || fernrich - richtung == 1 || fernrich - richtung == -3)) {
        dazu = 1
      }
      this.feld[fernerpos] = new bauteil(kombination[näher][ferner], richtung, dazu, 1)
    }
  }
  ziehen(pos, richtung) {
    let position = this.posRich(pos, richtung)
    while (this.feld[position].wert == 0) {
      position = this.posRich(position, richtung)
    }
    if (this.posRich(pos, richtung) != position && this.feld[position].wert != 9) {
      this.feld[this.posRich(pos, richtung)].copy(this.feld[position])
      this.feld[position].clear()
      this.bauteile[this.bauteile.indexOf(position)] = this.posRich(pos, richtung)
    }
  }
  drehen(teil, liRe) {
    if (liRe == 0) {
      teil.richtung++
    } else {

      teil.richtung--
    }
    if (teil.richtung > 3) {
      teil.richtung -= 4
    }
    if (teil.richtung < 0) {
      teil.richtung += 4
    }
  }
  next(x) {
    this.feld[x].aktiviert = 1
    switch (this.feld[x].wert) {
      case 2:
        this.bewegen(this.bereich(x, this.feld[x].richtung), this.feld[x].richtung)
        break;
      case 3:
        this.ballern(x, this.feld[x].richtung)
        this.bauteilIteration--
        break;
      case 4:
        if (this.feld[this.posRich(x, this.feld[x].richtung)].wert == 0) {
          this.bauteile.push(this.posRich(x, this.feld[x].richtung))
          this.feld[this.posRich(x, this.feld[x].richtung)].wert = 1
        }
        break;
      case 5:
        this.bewegen(this.reihe(x, this.feld[x].richtung), this.feld[x].richtung)
        break;
      case 6:
        this.kombiniere(x, this.feld[x].richtung)
        this.bauteilIteration -= 2
        break;
      case 7:
        this.ziehen(x, this.feld[x].richtung)
        break;
      case 8:
        if (this.feld[this.posRich(x, this.feld[x].richtung)].wert > 0) {
          this.drehen(this.feld[this.posRich(x, this.feld[x].richtung)], this.feld[x].extra)
        }
        break;
    }
    if (this.bauteilIteration < 0) {
      this.bauteilIteration = 0
    }
  }
  malePixel(co, bauteil, pos, breite) {
    let farbe = farben[bauteil.wert][bauteil.aktiviert]
    co.fillStyle = "rgb(" + farbe[0] + " " + farbe[1] + " " + farbe[2] + ")"
    co.fillRect((pos % breite) * pixelgröße, Math.floor(pos / breite) * pixelgröße, pixelgröße, pixelgröße)
    if (bauteil.wert > 1 && bauteil.wert < 9) {
      co.fillStyle = "rgb(0 0 0)"
      let seite = front[bauteil.richtung]
      co.fillRect((pos % breite + seite[3]) * pixelgröße, (Math.floor(pos / breite) + seite[2]) * pixelgröße, seite[0] * pixelgröße, seite[1] * pixelgröße)
      if (bauteil.wert == 8) {
        let stück = kante[bauteil.extra][bauteil.richtung]
        co.fillRect((pos % breite + stück[3]) * pixelgröße, (Math.floor(pos / breite) + stück[2]) * pixelgröße, stück[0] * pixelgröße, stück[1] * pixelgröße)
      }
    }
  }
  male() {
    let gesamtbreite = window.innerWidth
    let gesamthöhe = window.innerHeight
    pixelgröße = Math.floor(Math.min((gesamtbreite * 0.8) / breiteste, (gesamthöhe * 0.8) / höchste))
    c.height = this.höhe * pixelgröße
    c.width = this.breite * pixelgröße
    auswahl.height = pixelgröße
    if (this.sandbox) {
      auswahl.width = pixelgröße * (this.buildableBauteile.length + 2)
    } else {
      auswahl.width = pixelgröße * this.buildableBauteile.length
    }
    for (let x of this.buildableBauteile) {
      this.malePixel(auco, new bauteil(wertÜbersetztung[x], 0, 0, 0), this.buildableBauteile.indexOf(x), this.buildableBauteile.length)
    }
    if (this.sandbox) {
      auco.fillStyle = "rgb(200  200 200)"
      auco.fillRect((10.3) * pixelgröße, (0.3) * pixelgröße, 0.4 * pixelgröße, 0.4 * pixelgröße)
      auco.fillStyle = "rgb(255  0 255)"
      auco.fillRect((11.3) * pixelgröße, (0.3) * pixelgröße, 0.4 * pixelgröße, 0.4 * pixelgröße)
    }
    context.fillStyle = "rgb(255 255 255)"
    context.fillRect(0, 0, this.breite * pixelgröße, this.höhe * pixelgröße)
    for (let x of this.bauteile) {
      this.malePixel(context, this.feld[x], x, this.breite)
    }
    context.fillStyle = "rgb(255  0 255)"
    context.fillRect((this.fahne[0] + 0.3) * pixelgröße, (this.fahne[1] + 0.3) * pixelgröße, 0.4 * pixelgröße, 0.4 * pixelgröße)
    context.fillStyle = "rgb(200  200 200)"
    for (let x of this.baufelderpos) {
      context.fillRect((x % this.breite + 0.3) * pixelgröße, (Math.floor(x / this.breite) + 0.3) * pixelgröße, 0.4 * pixelgröße, 0.4 * pixelgröße)
    }
    context.strokeStyle = "rgb(255 50 50)"
    context.lineWidth = 0.1 * pixelgröße
    context.strokeRect((this.cursor % this.breite) * pixelgröße, Math.floor(this.cursor / this.breite) * pixelgröße, pixelgröße, pixelgröße)
    if (this.buildstage) {
      pause.textContent = "Bauen"
    } else {
      pause.textContent = "Simulation"
    }
    if (this.sandbox) {
      levelgröße.style.display = "block"
      download.style.display = "block"
      load.style.display = "block"
    } else {
      download.style.display = "none"
      levelgröße.style.display = "none"
      load.style.display = "none"
    }
    if (this.generator) {
      seeddownload.style.display = "block"
      seedload.style.display = "block"
    } else {
      seeddownload.style.display = "none"
      seedload.style.display = "none"
    }
    let nachricht = ""
    for (let x = 0; x < this.buildableBauteile.length - 1; x++) {
      nachricht = nachricht + this.buildableBauteile[x] + ", "
    }
    nachricht = nachricht + this.buildableBauteile[this.buildableBauteile.length - 1]
    blöcke.textContent = nachricht
    if (!this.sandbox && !this.generator) {
      LevelAnzeige.textContent = levelNummer
    } else if (this.sandbox) {
      LevelAnzeige.textContent = "Editor"
    } else if (this.generator) {
      LevelAnzeige.textContent = "Generierer"
    }
  }
  erschaffe(pos, wert, richtung, zusatz) {
    if (!this.bauteile.includes(this.cord(pos[0], pos[1]))) {
      this.feld[this.cord(pos[0], pos[1])] = new bauteil(wert, richtung, zusatz, 0)
      this.baufeld[this.cord(pos[0], pos[1])] = new bauteil(wert, richtung, zusatz, 0)
      this.bauteile.push(this.cord(pos[0], pos[1]))
      this.resetbauteile.push(this.cord(pos[0], pos[1]))
    }
  }
  entferne(pos) {
    if (this.bauteile.includes(pos)) {
      this.bauteile.splice(this.bauteile.indexOf(pos), 1)
      this.resetbauteile.splice(this.resetbauteile.indexOf(pos), 1)
      this.feld[pos] = new bauteil(0, 0, 0, 0)
      this.baufeld[pos] = new bauteil(0, 0, 0, 0)
    }
  }
  start(malen) {
    let happened = false
    let zwischen = false
    if (this.bauteile.length == 0) {
      happened = true
      zwischen = true
      reset = true
      if (malen === undefined) {
        clearInterval(id)
        this.buildstage = true
      }
    }
    while (!happened) {
      if (this.feld[this.bauteile[this.bauteilIteration]].wert > 1 && this.feld[this.bauteile[this.bauteilIteration]].aktiviert == 0 && this.feld[this.bauteile[this.bauteilIteration]].wert < 9) {
        this.next(this.bauteile[this.bauteilIteration])
        zwischen = true
        this.whileblock = false
      }
      this.bauteilIteration++
      if (this.bauteilIteration >= this.bauteile.length) {
        reset = true
        this.bauteilIteration = 0
        for (let x of this.bauteile) {
          this.feld[x].aktiviert = 0
        }
        if (this.whileblock) {
          zwischen = true
          reset = true
          if (malen === undefined) {
            clearInterval(id)
            this.buildstage = true
          }
        }
        this.whileblock = true
      }
      happened = zwischen
    }
    if (malen === undefined) {
      this.male()
    }
    if (this.feld[this.cord(this.fahne[0], this.fahne[1])].wert > 0) {
      if (malen === undefined) {
        clearInterval(id)
        setTimeout(function() {
          if (levelNummer < levels.length - 1) {
            levelNummer++
          } else {
            levelNummer = 0
          }
          levels[levelNummer].male()
        }, 1000)
      } else {
        this.buildstage = true
      }
    }
  }
}
function levelPrompt() {
  let eingabe = prompt("X Y")
  eingabe = eingabe.split(/[,\s]+/)
  for (let x = 0; x < eingabe.length; x++) {
    while (eingabe[x] == "") {
      eingabe.splice(x, 1)
    }
    eingabe[x] = parseInt(eingabe[x])
  }
  let xgröße = eingabe[0]
  let ygröße = eingabe[1]
  if (xgröße > 0 && ygröße > 0) {
    levels[levelNummer] = decomprimiere(JSON.parse(comprimiere(xgröße, ygröße)))
    levels[levelNummer].sandbox = true
    breiteste = 0
    höchste = 0
    for (let x of levels) {
      if (x.breite > breiteste) {
        breiteste = x.breite
      }
      if (x.höhe > höchste) {
        höchste = x.höhe
      }
    }
    levels[levelNummer].male()
  }
}
function comprimiere(xgröße, ygröße) {
  let cur = levels[levelNummer]
  let nachricht = "[\n["
  if (xgröße === undefined) {
    nachricht += cur.breite + ", "
  } else {
    nachricht += xgröße + ", "
  }
  if (ygröße === undefined) {
    nachricht += cur.höhe + ", ["
  } else {
    nachricht += ygröße + ", ["
  }
  nachricht += cur.fahne[0] + ", " + cur.fahne[1] + "], ["
  if (cur.baufelderpos.length > 0) {
    for (let x = 0; x < cur.baufelderpos.length; x++) {
      nachricht += "[" + cur.baufelderpos[x] % cur.breite + ", " + Math.floor(cur.baufelderpos[x] / cur.breite) + "]"
      if (x < cur.baufelderpos.length - 1) {
        nachricht += ", "
      } else {
        nachricht += "], ["
      }
    }
  } else {
    nachricht += "], ["
  }
  for (let x = 0; x < cur.buildableBauteile.length; x++) {
    nachricht += cur.buildableBauteile[x]
    if (x < cur.buildableBauteile.length - 1) {
      nachricht += ", "
    } else {
      nachricht += "]]"
    }
  }
  for (let x of cur.bauteile) {
    nachricht += ",\n[[" + x % cur.breite + ", " + Math.floor(x / cur.breite) + "], " + cur.feld[x].wert + ", " + cur.feld[x].richtung + ", " + cur.feld[x].extra + "]"
  }
  nachricht += "\n]"
  return (nachricht)
}
function decomprimiere(x) {
  let ini = x[0]
  let neuLevel = new level(ini[0], ini[1], ini[2], ini[3], ini[4])
  if (ini[0] > breiteste) {
    breiteste = ini[0]
  }
  if (ini[1] > höchste) {
    höchste = ini[1]
  }
  for (let y = 1; y < x.length; y++) {
    neuLevel.erschaffe(x[y][0], x[y][1], x[y][2], x[y][3])
  }
  return neuLevel
}
let data = JSON.parse(jsonData)
for (let x of data) {
  levels.push(decomprimiere(x))
}
levels[levelNummer].male()
let current = levels[levelNummer]
let nachricht = ""
for (let x = 0; x < current.buildableBauteile.length - 1; x++) {
  nachricht = nachricht + x + ", "
}
nachricht = nachricht + current.buildableBauteile[current.buildableBauteile.length - 1]
blöcke.textContent = nachricht
document.addEventListener("keydown", function addPixel(event) {
  let cur = levels[levelNummer]
  if (cur.buildstage) {
    switch (event.key) {
      case "o":
        navigator.clipboard.writeText(comprimiere())
        console.log(comprimiere())
        break;
      case "p":
        if (cur.sandbox) {
          let eingabe = prompt("Leveldaten")
          levels[levelNummer] = decomprimiere(JSON.parse(eingabe))
          cur = levels[levelNummer]
          cur.sandbox = true
          cur.buildableBauteile = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        }
        break;
      case "l":
        if (cur.sandbox) {
          levelPrompt()
        }
        break;
      case "g":
        if (cur.sandbox) {
          cur.fahne = [cur.cursor % cur.breite, Math.floor(cur.cursor / cur.breite)]
        }
        break;
      case "v":
        if (cur.sandbox) {
          if (cur.baufelderpos.includes(cur.cursor)) {
            cur.baufelderpos.splice(cur.baufelderpos.indexOf(cur.cursor), 1)
          } else {
            cur.baufelderpos.push(cur.cursor)
          }
        }
        break;
      case "y":
        if (cur.sandbox) {
          while (cur.bauteile.length > 0) {
            cur.feld[cur.bauteile[0]].clear()
            cur.baufeld[cur.bauteile[0]].clear()
            cur.resetbauteile.splice(0, 1)
            cur.bauteile.splice(0, 1)
          }
          cur.baufelderpos = []
        } else {
          for (let x of cur.baufelderpos) {
            if (cur.bauteile.includes(x)) {
              cur.bauteile.splice(cur.bauteile.indexOf(x), 1)
              cur.resetbauteile.splice(cur.resetbauteile.indexOf(x), 1)
              cur.feld[x].clear()
              cur.baufeld[x].clear()
            }
          }
        }
        break;
      case "a":
      case "ArrowLeft":
        cur.cursor = cur.posRich(cur.cursor, 3)
        break;
      case "w":
      case "ArrowUp":
        cur.cursor = cur.posRich(cur.cursor, 0)
        break;
      case "d":
      case "ArrowRight":
        cur.cursor = cur.posRich(cur.cursor, 1)
        break;
      case "s":
      case "ArrowDown":
        cur.cursor = cur.posRich(cur.cursor, 2)
        break;
      case "r":
        cur.bauteilIteration = 0
        cur.buildstage = false
        cur.start()
        break;
      case " ":
        cur.bauteilIteration = 0
        cur.buildstage = false
        id = setInterval(function() { cur.start() }, 700)
        document.body.classList.add("remove-scrolling")
        setTimeout(function() {
          document.body.classList.remove("remove-scrolling")
        }, 100)
        break;
      case "n":
        if (levelNummer < levels.length - 1) {
          levelNummer++
        } else {
          levelNummer = 0
        }
        break;
      case "b":
        if (levelNummer != 0) {
          levelNummer--
        } else {
          levelNummer = levels.length - 1
        }
        break;
      case "c":
        for (let x of cur.baufelderpos) {
          cur.entferne(x)
        }
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        if (cur.baufelderpos.includes(cur.cursor) || cur.sandbox) {
          if (cur.bauteile.includes(cur.cursor)) {
            cur.bauteile.splice(cur.bauteile.indexOf(cur.cursor), 1)
            cur.resetbauteile.splice(cur.resetbauteile.indexOf(cur.cursor), 1)
            cur.feld[cur.cursor].clear()
            cur.baufeld[cur.cursor].clear()
          }
          if (event.key != "0" && cur.buildableBauteile.includes(parseInt(event.key))) {
            cur.feld[cur.cursor] = new bauteil(wertÜbersetztung[parseInt(event.key)], 0, 0, 0)
            cur.baufeld[cur.cursor] = new bauteil(wertÜbersetztung[parseInt(event.key)], 0, 0, 0)
            cur.bauteile.push(cur.cursor)
            cur.resetbauteile.push(cur.cursor)
          }
        }
        break;
      case "e":
        if (cur.baufelderpos.includes(cur.cursor) || cur.sandbox) {
          cur.baufeld[cur.cursor].richtung++
          cur.feld[cur.cursor].richtung++
          if (cur.feld[cur.cursor].richtung == 4) {
            cur.baufeld[cur.cursor].richtung = 0
            cur.feld[cur.cursor].richtung = 0
          }
        }
        break;
      case "q":
        if (cur.baufelderpos.includes(cur.cursor) || cur.sandbox) {
          cur.baufeld[cur.cursor].extra++
          cur.feld[cur.cursor].extra++
          if (cur.feld[cur.cursor].extra == 2) {
            cur.baufeld[cur.cursor].extra = 0
            cur.feld[cur.cursor].extra = 0
          }
        }
        break;
      case "i":
        var text = document.getElementById("anleitung")
        if (anleitung) {
          text.style.display = "none"
          anleitung = false
        } else {
          text.style.display = "block"
          anleitung = true
        }
        break;
    }
  } else {
    switch (event.key) {
      case "n":
        clearInterval(id)
        if (levelNummer < levels.length - 1) {
          levelNummer++
        } else {
          levelNummer = 0
        }
        break;
      case "b":
        clearInterval(id)
        if (levelNummer != 0) {
          levelNummer--
        } else {
          levelNummer = levels.length - 1
        }
        break;
      case "h":
        clearInterval(id)
        break;
      case " ":
        cur.buildstage = true
        clearInterval(id)
        for (let x = 0; x < cur.baufeld.length; x++) {
          cur.feld[x].copy(cur.baufeld[x])
        }
        cur.bauteile = []
        for (let x of cur.resetbauteile) {
          cur.bauteile.push(x)
        }
        document.body.classList.add("remove-scrolling")
        setTimeout(function() {
          document.body.classList.remove("remove-scrolling")
        }, 100)
        break;
      case "a":
      case "ArrowLeft":
        cur.cursor = cur.posRich(cur.cursor, 3)
        break;
      case "w":
      case "ArrowUp":
        cur.cursor = cur.posRich(cur.cursor, 0)
        break;
      case "d":
      case "ArrowRight":
        cur.cursor = cur.posRich(cur.cursor, 1)
        break;
      case "s":
      case "ArrowDown":
        cur.cursor = cur.posRich(cur.cursor, 2)
        break;
      case "f":
        clearInterval(id)
        id = setInterval(function() { cur.start() }, 100)
        break;
      case "u":
        clearInterval(id)
        id = setInterval(function() { cur.start() }, 700)
        break;
      case "r":
        cur.start()
        break;
      case "i":
        var text = document.getElementById("anleitung")
        if (anleitung) {
          text.style.display = "none"
          anleitung = false
        } else {
          text.style.display = "block"
          anleitung = true
        }
        break;
    }
  }
  levels[levelNummer].male()
  mausrad = 0
})
window.addEventListener('resize', function() {
  levels[levelNummer].male()
})
c.addEventListener('click', function(event) {
  let rect = c.getBoundingClientRect();
  let scaleX = c.width / rect.width
  let scaleY = c.height / rect.height
  let clickX = (event.clientX - rect.left) * scaleX
  let clickY = (event.clientY - rect.top) * scaleY
  let gesamtbreite = window.innerWidth
  let gesamthöhe = window.innerHeight
  pixelgröße = Math.floor(Math.min((gesamtbreite * 0.8) / breiteste, (gesamthöhe * 0.8) / höchste))
  let x = Math.floor(clickX / pixelgröße)
  let y = Math.floor(clickY / pixelgröße)
  if (levels[levelNummer].cursor == levels[levelNummer].cord(x, y) && levels[levelNummer].buildstage) {
    cur = levels[levelNummer]
    if (cur.baufelderpos.includes(cur.cursor) || cur.sandbox) {
      cur.baufeld[cur.cursor].richtung++
      cur.feld[cur.cursor].richtung++
      if (cur.feld[cur.cursor].richtung == 4) {
        cur.baufeld[cur.cursor].richtung = 0
        cur.feld[cur.cursor].richtung = 0
      }
    }
  } else {
    levels[levelNummer].cursor = levels[levelNummer].cord(x, y)
  }
  levels[levelNummer].male()
})
document.addEventListener('wheel', function(event) {
  mausrad += event.deltaY
  cur = levels[levelNummer]
  if (cur.buildstage) {
    if (mausrad > 100) {
      if (cur.baufelderpos.includes(cur.cursor) || cur.sandbox) {
        cur.baufeld[cur.cursor].richtung++
        cur.feld[cur.cursor].richtung++
        if (cur.feld[cur.cursor].richtung == 4) {
          cur.baufeld[cur.cursor].richtung = 0
          cur.feld[cur.cursor].richtung = 0
        }
      }
      mausrad = 0
    } else if (mausrad < -100) {
      if (cur.baufelderpos.includes(cur.cursor) || cur.sandbox) {
        cur.baufeld[cur.cursor].richtung--
        cur.feld[cur.cursor].richtung--
        if (cur.feld[cur.cursor].richtung == -1) {
          cur.baufeld[cur.cursor].richtung = 3
          cur.feld[cur.cursor].richtung = 3
        }
      }
      mausrad = 0
    }
    levels[levelNummer].male()
  }
})
document.getElementById('Download').addEventListener('click', function() {
  navigator.clipboard.writeText(comprimiere())
  console.log(comprimiere())
})
document.getElementById('Load').addEventListener('click', function() {
  let eingabe = prompt("Leveldaten")
  levels[levelNummer] = decomprimiere(JSON.parse(eingabe))
  let cur = levels[levelNummer]
  cur.sandbox = true
  cur.buildableBauteile = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  cur.male()
})
document.getElementById('levelgröße').addEventListener('click', function() {
  levelPrompt()
})
document.getElementById('Starop').addEventListener('click', function() {
  cur = levels[levelNummer]
  if (cur.buildstage) {
    cur.bauteilIteration = 0
    cur.buildstage = false
    id = setInterval(function() { cur.start() }, 700)
  } else {
    cur.buildstage = true
    clearInterval(id)
    for (let x = 0; x < cur.baufeld.length; x++) {
      cur.feld[x].copy(cur.baufeld[x])
    }
    cur.bauteile = []
    for (let x of cur.resetbauteile) {
      cur.bauteile.push(x)
    }
  }
  cur.male()
})
document.getElementById('zurück').addEventListener('click', function() {
  clearInterval(id)
  if (levelNummer != 0) {
    levelNummer--
  } else {
    levelNummer = levels.length - 1
  }
  levels[levelNummer].male()
})

document.getElementById('weiter').addEventListener('click', function() {
  clearInterval(id)
  if (levelNummer < levels.length - 1) {
    levelNummer++
  } else {
    levelNummer = 0
  }
  levels[levelNummer].male()
})
auswahl.addEventListener('click', function(event) {
  let rect = c.getBoundingClientRect();
  let scaleX = c.width / rect.width
  let clickX = (event.clientX - rect.left) * scaleX
  let x = Math.floor(clickX / pixelgröße)
  let cur = levels[levelNummer]
  if (cur.buildstage) {
    if (x < cur.buildableBauteile.length) {
      if (cur.baufelderpos.includes(cur.cursor) || cur.sandbox) {
        if (cur.bauteile.includes(cur.cursor)) {
          cur.bauteile.splice(cur.bauteile.indexOf(cur.cursor), 1)
          cur.resetbauteile.splice(cur.resetbauteile.indexOf(cur.cursor), 1)
          cur.feld[cur.cursor].clear()
          cur.baufeld[cur.cursor].clear()
        }
        if (cur.buildableBauteile[x] != "0") {
          cur.feld[cur.cursor] = new bauteil(wertÜbersetztung[cur.buildableBauteile[x]], 0, 0, 0)
          cur.baufeld[cur.cursor] = new bauteil(wertÜbersetztung[cur.buildableBauteile[x]], 0, 0, 0)
          cur.bauteile.push(cur.cursor)
          cur.resetbauteile.push(cur.cursor)
        }
      }
    } else if (x == 11) {
      if (cur.sandbox) {
        cur.fahne = [cur.cursor % cur.breite, Math.floor(cur.cursor / cur.breite)]
      }
    } else if (x == 10) {
      if (cur.sandbox) {
        if (cur.baufelderpos.includes(cur.cursor)) {
          cur.baufelderpos.splice(cur.baufelderpos.indexOf(cur.cursor), 1)
        } else {
          cur.baufelderpos.push(cur.cursor)
        }
      }
    }
  }
  cur.male()
})
c.addEventListener("dblclick", function() {
  let cur = levels[levelNummer]
  if (cur.baufelderpos.includes(cur.cursor) || cur.sandbox) {
    cur.baufeld[cur.cursor].extra++
    cur.feld[cur.cursor].extra++
    if (cur.feld[cur.cursor].extra == 2) {
      cur.baufeld[cur.cursor].extra = 0
      cur.feld[cur.cursor].extra = 0
    }
  }
})
function displayText() {
  var text = document.getElementById("anleitung")
  if (anleitung) {
    text.style.display = "none"
    anleitung = false
  } else {
    text.style.display = "block"
    anleitung = true
  }
}
function levelGenerator(sed) {
  while (sed < 100000000000000) {
    sed *= 23
  }
  seed = sed
  let se = seed
  const onstant = 253469709
  function rand(max) {
    se = (se * onstant) % 163754673 + 35467
    return se % (max)
  }
  let sol = "0,0,0"
  let breite = rand(16) +5
  let höhe = rand(16) + 5
  function randPos() {
    return [rand(breite), rand(höhe)]
  }
  let ziel = randPos()
  let platzierbareBau = [0]
  for (let x = 1; x < 10; x++) {
    if (rand(2) > 0) {
      platzierbareBau.push(x)
    }
  }
  let randLevel = new level(breite, höhe, ziel, [], platzierbareBau)
  for (let x = 0; x < rand(breite * höhe) + breite + höhe; x++) {
    randLevel.erschaffe(randPos(), wertÜbersetztung[platzierbareBau[rand(platzierbareBau.length - 1) + 1]], rand(4), rand(2))
  }
  function compri() {
    let nachricht = ""
    for (let x of randLevel.bauteile) {
      nachricht += x + "," + randLevel.feld[x].wert + ", " + randLevel.feld[x].richtung + ", " + randLevel.feld[x].extra + "|"
    }
    return nachricht
  }
  function solution(clear) {
    let retutru = true
    let save = []
    reset = false
    save.push(compri())
    randLevel.buildstage = false
    while (!randLevel.buildstage) {
      randLevel.start(false)
      if (reset) {
        reset = false
        let now = compri()
        for (let x of save) {
          if (x.localeCompare(now) == 0 || save.length >= 500) {
            randLevel.buildstage = true
            retutru = false
            break
          }
        }
        save.push(now)
      }
      old = randLevel.bauteilIteration
    }
    if (clear) {
      for (let x = 0; x < randLevel.baufeld.length; x++) {
        randLevel.feld[x].copy(randLevel.baufeld[x])
      }
      randLevel.bauteile = []
      for (let x of randLevel.resetbauteile) {
        randLevel.bauteile.push(x)
      }
      randLevel.bauteilIteration = 0
    } else {
      randLevel.buildstage = false
    }
    return retutru
  }
  function mutate() {
    let baulänge = randLevel.bauteile.length
    if (rand(2) > 0 && randLevel.bauteile.length > 0) {
      randLevel.entferne(randLevel.bauteile[rand(randLevel.bauteile.length)])
    } else if (randLevel.größe > randLevel.bauteile.length) {
      while (baulänge == randLevel.bauteile.length) {
        randLevel.erschaffe(randPos(), wertÜbersetztung[platzierbareBau[rand(platzierbareBau.length - 1) + 1]], rand(4), rand(2))
      }
    }
  }
  function teste(objekte, zeige) {
    let cur = randLevel
    for (let x of objekte) {
      cur.feld[x[3]] = new bauteil(x[0], x[1], x[2], 0)
      cur.baufeld[x[3]] = new bauteil(x[0], x[1], x[2], 0)
      cur.bauteile.push(x[3])
      cur.resetbauteile.push(x[3])
    }
    let ausgabe = 0
    if (solution(true)) {
      if (zeige) {
        sol = ""
        for (let x of objekte) {
          sol += "|" + wertÜbersetztung.indexOf(x[0]) + ", " + x[1] + ", " + x[2] + "," + x[3] + "|"
        }
      }
      ausgabe = 1
    }
    for (let x of objekte) {
      cur.bauteile.splice(cur.bauteile.indexOf(x[3]), 1)
      cur.resetbauteile.splice(cur.resetbauteile.indexOf(x[3]), 1)
      cur.feld[x[3]].clear()
      cur.baufeld[x[3]].clear()
    }
    return ausgabe
  }
  let solvable = true
  solvable = solution(true)
  while (solvable) {
    mutate()
    solvable = solution(true)
  }
  function permute(arr) {
    if (arr.length === 0) return [[]]
    let result = []
    for (let i = 0; i < arr.length; i++) {
      let rest = arr.slice(0, i).concat(arr.slice(i + 1))
      let permutations = permute(rest)
      for (let permutation of permutations) {
        result.push([arr[i]].concat(permutation))
      }
    }
    return result
  }
  function generateCombinations(pos) {
    let results = []
    function helper(currentCombination, depth) {
      if (depth == pos.length) {
        results.push([...currentCombination])
        return
      }
      for (let x of platzierbareBau) {
        if (!(x < 2 || x == 9)) {
          for (let y = 0; y < 4; y++) {
            if (x == 8) {
              for (let z = 0; z < 2; z++) {
                currentCombination[depth] = [wertÜbersetztung[x], y, z]
                helper(currentCombination, depth + 1)
              }
            } else {
              currentCombination[depth] = [wertÜbersetztung[x], y, 0]
              helper(currentCombination, depth + 1)
            }
          }
        } else {
          currentCombination[depth] = [wertÜbersetztung[x], 0, 0]
          helper(currentCombination, depth + 1)
        }
      }
    }
    helper(new Array(pos.length), 0);
    return results
  }
  function posisolutions(pos, max, zeige) {
    let reihenfolgen = permute(pos)
    let kombinationen = generateCombinations(pos)
    let output = 0
    for (let x of reihenfolgen) {
      for (let y of kombinationen) {
        let copy = []
        for (let j of y) {
          copy.push([...j])
        }
        for (let z = 0; z < x.length; z++) {
          copy[z].push(x[z])
        }
        output += teste(copy, zeige)
        if (output > max) {
          return false
        }
      }
    }
    return max == output
  }
  for (let x = 0; x < randLevel.größe; x++) {
    if (!randLevel.bauteile.includes(x)) {
      if (posisolutions([x], 0, false)) {
        randLevel.baufelderpos.push(x)
        break
      }
    }
  }
  let zweitesFeld = false
  for (let x = 0; x < randLevel.größe; x++) {
    if (!randLevel.bauteile.includes(x)) {
      if (randLevel.baufelderpos.length == 0) {
        if (posisolutions([x], 1, false)) {
          randLevel.baufelderpos.push(x)
          zweitesFeld = true
          break
        }
      } else {
        if (posisolutions([x], 0, false)) {
          if (posisolutions([randLevel.baufelderpos[0], [x]], 1, false)) {
            randLevel.baufelderpos.push(x)
            zweitesFeld = true
            break
          }
        }
      }
    }
  }
  if (zweitesFeld) {
    posisolutions(randLevel.baufelderpos, 1, true)
    let before = sol
    let wiederholung = 0
    while (true) {
      let startlänge = randLevel.bauteile.length
      for (let x = 1; x < randLevel.bauteile.length; x++) {
        const save = [randLevel.bauteile[x], [randLevel.feld[randLevel.bauteile[x]].wert, randLevel.feld[randLevel.bauteile[x]].richtung, randLevel.feld[randLevel.bauteile[x]].extra]]
        randLevel.entferne(randLevel.bauteile[x])
        if (!posisolutions(randLevel.baufelderpos, 1, true) || sol.localeCompare(before) != 0) {
          randLevel.bauteile.splice(x, 0, save[0])
          randLevel.resetbauteile.splice(x, 0, save[0])
          randLevel.feld[save[0]].wert = save[1][0]
          randLevel.feld[save[0]].richtung = save[1][1]
          randLevel.feld[save[0]].extra = save[1][2]
          randLevel.baufeld[save[0]].wert = save[1][0]
          randLevel.baufeld[save[0]].richtung = save[1][1]
          randLevel.baufeld[save[0]].extra = save[1][2]
        }
      }
      if (startlänge == randLevel.bauteile.length) {
        wiederholung++
        if (wiederholung == 2) {
          break
        }
      } else {
        wiederholung = 0
      }
    }
    randLevel.generator = true
    return randLevel
  } else {
    return levelGenerator(se)
  }
}
levels[levels.length - 1].generator = true
document.getElementById('DownloadSeed').addEventListener('click', function() {
  navigator.clipboard.writeText(seed)
  console.log(seed)
})
document.getElementById('LoadSeed').addEventListener('click', function() {
  let eingabe = prompt("Seed")
  let ausgabe = parseInt(eingabe)
  if (isNaN(ausgabe)) {
    ausgabe = 1
    for (let i = 0; i < eingabe.length && ausgabe < 100000000000; i++) {
      ausgabe *= eingabe.charCodeAt(i);
    }
    if (eingabe.length == 0) {
      ausgabe = Math.floor(Math.random() * 5845937485738457)
    }
  }
  levels[levelNummer] = levelGenerator(ausgabe)
  levels[levelNummer].male()
})
document.addEventListener("keydown", function addPixel(event) {
  let cur = levels[levelNummer]
  if (cur.buildstage && cur.generator) {
    switch (event.key) {
      case "x":
        levels[levelNummer] = levelGenerator(Math.floor(Math.random() * 5845937485738457))
        break
      case "t":
        let eingabe = prompt("Seed")
        let ausgabe = parseInt(eingabe)
        if (isNaN(ausgabe)) {
          ausgabe = 1
          for (let i = 0; i < eingabe.length && ausgabe < 100000000000; i++) {
            ausgabe *= eingabe.charCodeAt(i);
          }
          if (eingabe.length == 0) {
            ausgabe = Math.floor(Math.random() * 5845937485738457)
          }
        }
        levels[levelNummer] = levelGenerator(ausgabe)
        break
      case "z":
        navigator.clipboard.writeText(seed)
        console.log(seed)
        break
    }
    levels[levelNummer].male()
  }
})
