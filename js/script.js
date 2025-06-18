const display = document.querySelector(".display");
const buttons = document.querySelector(".buttons");

let currentInput = "0"; // ilk başta ekranda hep 0 gözükecek
let firstValue = null; // işlem yapılacak ilk sayıyı tutacak
let operator = null; // hangi işlem yapılacak bakmak için
let waitingForSecond = false; // ikinci sayıya geçildi mi kontrolü
let resetNext = false; // eşittirden sonra yeni sayı başlatmak için

// ekranı güncellemek için
function updateDisplay() {
  if (waitingForSecond && operator && firstValue !== null) {
    // işlem seçildiğinde ekranda örn: 15 + gibi gözüksün diye
    const displayOperator = operator === 'x' ? '×' : operator === '/' ? '÷' : operator;
    display.textContent = `${firstValue} ${displayOperator}`;
  } else {
    display.textContent = currentInput;
  }
}

// butonlara tıklanınca işlem yapılmalı
buttons.addEventListener("click", function (e) {
  const el = e.target;
  if (!el.matches("button")) return;

  const value = el.textContent;

  if (el.classList.contains("number")) {
    handleNumber(value);
  } else if (el.classList.contains("operator")) {
    handleOperator(value);
  } else if (el.classList.contains("equal")) {
    handleEqual();
  } else if (el.classList.contains("clear")) {
    clearAll();
  } else if (el.classList.contains("dot")) {
    inputDecimal();
  } else if (el.classList.contains("del")) {
    deleteLast();
  } else if (el.classList.contains("history")) {
    toggleHistory();
  }

  updateDisplay();
});

// sayıya basıldığında ekrana yazmak için
function handleNumber(number) {
  if (resetNext || waitingForSecond) {
    currentInput = number;
    resetNext = false;
    waitingForSecond = false;
  } else {
    if (currentInput.length >= 15) return; // sayı 15 haneli sınır olsun ki taşmalar olmasın 
    currentInput = currentInput === "0" ? number : currentInput + number;
  }
}

// operatör basıldığında işlem yapılacak
function handleOperator(nextOperator) {
  const inputValue = parseFloat(currentInput);

  if (operator && waitingForSecond) {
    operator = nextOperator;
    return;
  }

  if (firstValue === null && !isNaN(inputValue)) {
    firstValue = inputValue;
  } else if (operator) {
    const result = performCalculation(firstValue, inputValue, operator);
    currentInput = result.toString();
    firstValue = result;
  }

  operator = nextOperator;
  waitingForSecond = true;
}

// işlemi hesaplayan fonksiyon
function performCalculation(a, b, operator) {
  switch (operator) {
    case "+": return a + b;
    case "-": return a - b;
    case "x": return a * b;
    case "/": return b !== 0 ? a / b : "HATA";
    default: return b;
  }
}

// eşittir basıldığında sonucu verir
function handleEqual() {
  const inputValue = parseFloat(currentInput);

  if (operator === null || waitingForSecond) return;

  const result = performCalculation(firstValue, inputValue, operator);
  addToHistory(`${firstValue} ${operator} ${inputValue} = ${result}`);

  currentInput = result.toString();
  firstValue = null;
  operator = null;
  waitingForSecond = false;
  resetNext = true;
}

// tüm verileri sıfırlamak için AC butonu
function clearAll() {
  currentInput = "0";
  firstValue = null;
  operator = null;
  waitingForSecond = false;
  resetNext = false;
}

// virgül tuşuna basıldığında sayı ondalıklı yapılmalı
function inputDecimal() {
  if (waitingForSecond || resetNext) {
    currentInput = "0.";
    waitingForSecond = false;
    resetNext = false;
    return;
  }

  if (!currentInput.includes(".")) {
    currentInput += ".";
  }
}

// son basılan rakamı silmek için
function deleteLast() {
  if (waitingForSecond || resetNext) return;
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
}

// geçmiş butonuna basınca görünürlük değiştir
function toggleHistory() {
  document.querySelector("#historyPanel").classList.toggle("show");
  updateHistory();
}

// geçmiş işlemleri localStorage ile tut
let history = JSON.parse(localStorage.getItem("calcHistory")) || [];

function addToHistory(entry) {
  history.push(entry);
  localStorage.setItem("calcHistory", JSON.stringify(history));
}

// geçmişi sayfaya yazdır
function updateHistory() {
  const historyList = document.querySelector("#historyList");
  historyList.innerHTML = history.map((h) => `<p>${h}</p>`).join("");
}

// geçmişi temizleme butonu
document.querySelector("#clearHistory").addEventListener("click", () => {
  history = [];
  localStorage.removeItem("calcHistory");
  updateHistory();
});

// klavye ile giriş yapılabilmesi için
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (!isNaN(key)) {
    handleNumber(key);
  } else if (["+", "-", "*", "/"].includes(key)) {
    handleOperator(key === "*" ? "x" : key);
  } else if (key === "=" || key === "Enter") {
    e.preventDefault(); // form varsa engelle
    handleEqual();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape") {
    clearAll();
  } else if (key === ".") {
    inputDecimal();
  } else if (key.toLowerCase() === "h") {
    toggleHistory();
  }

  updateDisplay();
});
