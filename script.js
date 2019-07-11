// todo:
// add startOver button in results mode
// add toppedOut checkbox
// check calcbtn functionality
// test keyboard functionality
// c2a member form after results displayed
// test on phone


// Restricts input for the textbox to the given inputFilter.
function setInputFilter(textbox, inputFilter) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
    textbox.addEventListener(event, function() {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      }
    });
  });
}

// app starts in 'input' state which allows user to enter base pay
let appState = 'input';

// set variables
let COLA = .03;
let toppedOut = false;

document.addEventListener("DOMContentLoaded", function(){

  // save elements to variables for later access
  let display = document.getElementById("display");
  let submit = document.getElementById("submit");
  let keys = document.getElementById("keys");
  let buttonsNodeList = document.getElementsByClassName("calcbtn");
  buttons = Array.from(buttonsNodeList);
  let results = document.getElementById("results");

  // Restrict input to digits and '.' with regex filter.
  setInputFilter(display, function(value) {
    return /^\d*\.?\d*$/.test(value);
  });

  // generate results string and message
  function resultsString(basePay, firstYearRaise, secondYearRaise, lifeOfContractTotal) {
    return `<p>If your base pay is $${basePay}, your raise in the first year of the contract will be <strong>$${firstYearRaise}</strong> per month. In the second year of the contract it will be <strong>$${secondYearRaise}</strong> per month. Over the two years of the contract this adds up to an extra <strong>$${lifeOfContractTotal} in your pocket.</p>`
  }

  // On submit, hide keypad and display results
  function handleSubmit() {
    const basePay = parseFloat(display.value).toFixed(2);
    keys.setAttribute("style", "height:0;");
    buttons.forEach(btn =>
      btn.setAttribute("style", "height:0; padding: 0; border: 0")
    );
    let lifeOfContractTotal = totalLifeOfContract(basePay, toppedOut, COLA);
    display.value = lifeOfContractTotal;
    let firstYearRaise = monthlyRaise(basePay, COLA, toppedOut);
    let firstYearBasePay = newBasePay(basePay, monthlyRaise(basePay, COLA, toppedOut));
    let secondYearRaise = monthlyRaise(firstYearBasePay, COLA, toppedOut);
    results.innerHTML = resultsString(basePay, firstYearRaise, secondYearRaise, lifeOfContractTotal);

  }

  // Listen for 'Enter' keyup in input field to trigger submit
  display.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      handleSubmit();
    }
  });

  submit.addEventListener("click", handleSubmit);

  // formulas
  function monthlyRaise(basePay, COLA, toppedOut) {
    const basePay_ = parseFloat(basePay);
    const COLA_ = parseFloat(COLA);
    if (toppedOut) {
      let raise = (basePay_ * COLA_).toFixed(2);
      console.log(`monthly raise: ${raise}`);
      return raise;
    } else {
      let raise = ((basePay_ * COLA_) + (basePay_ * .047)).toFixed(2);
      console.log(`monthly raise: ${raise}`);
      return raise;
    }
  }

  function newBasePay(basePay, monthlyRaise) {
    const basePay_ = parseFloat(basePay);
    const monthlyRaise_ = parseFloat(monthlyRaise);
    let newPay = (basePay_ + monthlyRaise_).toFixed(2);
    console.log(`newBasePay: ${newPay}`)
    return newPay;
  }

  function annualImpact(monthlyRaise) {
    let impact = (monthlyRaise * 12).toFixed(2);
    console.log(`annualImpact: ${impact}`);
    return impact;
  }

  function totalLifeOfContract(basePay, toppedOut, COLA) {
    const basePay_ = parseFloat(basePay);
    const COLA_ = parseFloat(COLA);

    let firstYearRaise = monthlyRaise(basePay_, COLA_, toppedOut);
    let firstYearBasePay = newBasePay(basePay_, monthlyRaise(basePay_, COLA_, toppedOut));
    let firstYearTotal = annualImpact(firstYearRaise);
    console.log(`firstYearTotal: ${firstYearTotal}`);

    let secondYearRaise = monthlyRaise(firstYearBasePay, COLA_, toppedOut);
    let secondYearBasePay = newBasePay(firstYearBasePay, monthlyRaise(firstYearBasePay, COLA_, toppedOut));
    let secondYearTotal = annualImpact(secondYearRaise);
    console.log(`secondYearTotal: ${secondYearTotal}`);

    let lifeOfContract = (parseFloat(firstYearTotal) + parseFloat(secondYearTotal)).toFixed(2);
    console.log(`lifeOfContract: ${lifeOfContract}`);

    return lifeOfContract;
  }

});