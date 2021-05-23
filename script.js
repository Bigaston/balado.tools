// editable info

const publicSpreadsheetUrl =
  "https://docs.google.com/spreadsheets/d/1cmInVkZw_Qzfbev_v5DQnI8QT6_GBrLa1mQyvyxARm8/edit?usp=sharing"; // change this to your own URL
const categoryStartNum = 3; // let the program know where the categoy begins on the spreadsheet column. Default value is 3.
const sheetName = "Liens"; // this has to match your google doc sheet name
const contribSheetName = "Contributeurs";
const tipsSheet = "Tips";
const punctuation = ": "; // this changes the punctuation between the title and the description. In most cases you'd want to use "," or "-" or ":"

const mdConverter = new showdown.Converter();

var dataTable = [];
var activeButtons = [];

let hash = location.hash.substr(1);

if (hash === "tips") {
  goToTips();
}

// tableTop.js script
function init() {
  Tabletop.init({
    key: publicSpreadsheetUrl,
    callback: showInfo,
    simpleSheet: false,
  });
}

function showInfo(data, tabletop) {
  var checked = "x";
  var columnArray = tabletop.sheets()[sheetName].columnNames;
  var columnName = [columnArray.length];

  document.getElementById("btnContainer").innerHTML = "";
  // create sorting buttons
  for (let j = categoryStartNum; j < columnArray.length; j++) {
    addButton(columnArray[j]);
  }

  let dataLink = data[sheetName].all();

  //makes the data table used later
  for (let j = 0; j < dataLink.length; j++) {
    dataTable[j] = [
      dataLink[j][columnArray[0]],
      dataLink[j][columnArray[1]],
      dataLink[j][columnArray[2]],
      [],
    ];
    //console.log(dataTable[j])
    for (let i = categoryStartNum; i < columnArray.length; i++) {
      if (dataLink[j][columnArray[i]] == checked) {
        dataTable[j][3].push(columnArray[i]);
      }
    }
  }

  let allButton = document.getElementsByName("Tous")[0];
  allButton.classList.add("active");
  activeButtons.push("Tous");
  filterSelection();

  // Ajout des contributeurs
  let dataContrib = data[contribSheetName].all();
  let contribP = document.getElementById("contrib");

  dataContrib.forEach((c) => {
    let a = document.createElement("a");
    a.innerHTML = c.Username;
    a.href = c.Link;
    a.target = "_blank";

    contribP.appendChild(a);
    contribP.innerHTML = contribP.innerHTML + " ";
  });

  // Ajout des tips
  let dataTips = data[tipsSheet].all();
  let tipsContainer = document.getElementById("tipsContainer");

  console.log(dataTips);

  dataTips.forEach((t) => {
    let div = document.createElement("div");

    div.classList.add("tips");

    // Avatar de l'auteur
    let avatar = document.createElement("img");
    avatar.src = t.Avatar;
    avatar.alt = "Avatar de " + t.Auteur;

    div.appendChild(avatar);

    // Conteneur de droite
    let rightDiv = document.createElement("div");

    div.appendChild(rightDiv);

    // Tips
    let div2 = document.createElement("div");
    div2.innerHTML = mdConverter.makeHtml(t.Texte);

    rightDiv.appendChild(div2);

    // Nom
    let a = document.createElement("a");
    a.innerHTML = t.Auteur;
    a.href = t.URL;

    rightDiv.appendChild(a);

    tipsContainer.appendChild(div);
  });
}

function addButton(columnName) {
  const newButton = document.createElement("BUTTON");
  const newButtonContent = document.createTextNode(columnName);

  newButton.appendChild(newButtonContent);
  newButton.name = columnName;
  newButton.className = "btn";
  newButton.addEventListener("click", function () {
    var allButton = document.getElementsByName("Tous")[0];
    if (newButton.name == "Tous") {
      removeAllFilters();
    }
    if (newButton.classList.contains("active")) {
      newButton.classList.remove("active");
      activeButtons.splice(activeButtons.indexOf(newButton.name), 1);
    } else {
      allButton.classList.remove("active"); //turn off all
      if (activeButtons.indexOf("Tous") != -1) {
        activeButtons.splice(activeButtons.indexOf("Tous"), 1);
      }
      newButton.classList.add("active"); // turn this button on
      activeButtons.push(newButton.name);
    }
    filterSelection();
  });
  document.getElementById("btnContainer").appendChild(newButton);
}

function addElement(element, divToAppend) {
  let title = element[0];
  let url = element[1];
  let description = element[2];
  //element[3].splice(element[3].indexOf("All"), 1);
  let tags = element[3].toString().replace(/,/g, " -- ");

  let para = document.createElement("p");
  // place individual link inside individual paragraph
  for (let i = 0; i < 1; i++) {
    let link = document.createElement("a");
    let linkContent = document.createTextNode(title);
    link.appendChild(linkContent);
    link.title = title;
    link.href = url;
    link.target = "_blank";
    link.className = "itemLink";

    para.className = "itemPara";
    para.appendChild(link); // put <a> into <p>
    para.innerHTML +=
      " " +
      punctuation +
      "<dfn data-info='" +
      tags +
      "'>" +
      description +
      "</dfn>";
  }
  divToAppend.appendChild(para);
}

function removeAllFilters() {
  activeButtons = [];
  var activeButtonElements = document.getElementsByClassName("active").length;

  for (let l = 0; l < activeButtonElements; l++) {
    document.getElementsByClassName("active")[0].classList.remove("active");
  }

  filterSelection();
}

function randomizeSearch() {
  removeAllFilters();
  var buttonList = document.getElementById("btnContainer").children;
  for (let l = 0; l < 2; l++) {
    var pickedButton =
      buttonList[Math.floor(Math.random() * buttonList.length)];
    //make it not repeat
    if (activeButtons.indexOf(pickedButton.name) == 1) {
      pickedButton = buttonList[Math.floor(Math.random() * buttonList.length)];
    }
    pickedButton.classList.add("active"); // turn this button on
    activeButtons.push(pickedButton.name);
  }
  //activeButtons = [];
  //var activeButtonElements = document.getElementsByClassName("active").length;

  filterSelection();
}

// filter script
function filterSelection() {
  let containerDiv = document.getElementById("container");
  containerDiv.innerHTML = "";

  var toolCount = 0;

  for (let r = 0; r < dataTable.length; r++) {
    if (activeButtons.length > 0 && isTrue(activeButtons, dataTable[r][3])) {
      addElement(dataTable[r], containerDiv);
      toolCount++;
    }
  }

  let currentlyShowing = document.getElementById("currentlyShowing");
  currentlyShowing.innerHTML =
    "<strong>Montre actuellement: </strong> " +
    toolCount +
    " outils avec <strong>tous</strong> les attributs suivants - ";

  for (let u = 0; u < activeButtons.length; u++) {
    currentlyShowing.innerHTML += "[<strong>" + activeButtons[u] + "</strong>]";
    if (u + 1 == activeButtons.length) {
      currentlyShowing.innerHTML += ".";
    } else {
      currentlyShowing.innerHTML += ", ";
    }
  }

  if (activeButtons.length == 0) {
    currentlyShowing.innerHTML +=
      "Aucun. Cliquez sur un attribut pour commencer! ";
  } else {
    currentlyShowing.innerHTML +=
      ' <a onclick=removeAllFilters() class="removeFilter">Retirer tous les filtres.</a>';
  }

  //add a function to switch to ANY of the tags?

  function isTrue(arr, arr2) {
    return arr.every((i) => arr2.includes(i));
  }
}

window.addEventListener("DOMContentLoaded", init);

// PARTIE TIPS
function goToTips() {
  document.getElementById("mainPage").style.display = "none";
  document.getElementById("tipsPage").style.display = "block";

  document.getElementById("mainLink").classList.remove("selectedLink");
  document.getElementById("tipsLink").classList.add("selectedLink");

  window.location.hash = "tips";
}

function goToMain() {
  document.getElementById("mainPage").style.display = "block";
  document.getElementById("tipsPage").style.display = "none";

  document.getElementById("mainLink").classList.add("selectedLink");
  document.getElementById("tipsLink").classList.remove("selectedLink");

  window.location.hash = "";
}
