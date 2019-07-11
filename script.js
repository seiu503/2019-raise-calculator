// todo:
// fix formulas for toppedOut
// hide checkbox after submit
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

// set global variables
let COLA = .03;
let toppedOut = false;
let basePay = 0;

document.addEventListener("DOMContentLoaded", function(){

  // save elements to variables for later access
  let display = document.getElementById("display");
  let dispwrap = document.getElementById("dispwrap");
  let submit = document.getElementById("submit");
  let startOver = document.getElementById("startOver");
  let keys = document.getElementById("keys");
  let buttonsNodeList = document.getElementsByClassName("calcbtn");
  buttons = Array.from(buttonsNodeList);
  let results = document.getElementById("results");
  let toppedOutEl = document.getElementById("toppedOut");

  // listen for changes to toppedOut
  toppedOutEl.addEventListener("change", function(event) {
    toppedOut = this.checked;
    console.log(`toppedOut: ${toppedOut}`);
  });


  // Restrict input to digits and '.' with regex filter.
  setInputFilter(display, function(value) {
    return /^\d*\.?\d*$/.test(value);
  });

  // listen for changes to display
  display.addEventListener("change", function(event) {
    basePay = Number(this.value);
    console.log(typeof basePay);
    console.log(`basePay: ${basePay}`);
  });

  // formulas
  function monthlyRaise(basePayVar, year) {
    if (!basePayVar) {basePayVar = basePay}
    if (year === 2 && toppedOut) {
      let raise = (basePayVar * COLA).toFixed(2);
      console.log(`monthly raise in second year when topped out: ${raise}`);
      return raise;
    } else {
      let raise = ((basePayVar * COLA) + (basePayVar * .047)).toFixed(2);
      console.log(`monthly raise in first year: ${raise}`);
      return raise;
    }
  }

  function newBasePay(monthlyRaiseAmount) {
    const monthlyRaise_ = parseFloat(monthlyRaiseAmount);
    console.log(`monthlyRaise_: ${monthlyRaise_}`);
    console.log(`basePay: ${basePay}`);
    console.log(typeof basePay);
    let newPay = (basePay + monthlyRaise_).toFixed(2);
    console.log(`newBasePay: ${newPay}`)
    return newPay;
  }

  function firstYearRaise() {
    const firstYearRaiseAmount = monthlyRaise();
    console.log(`firstYearRaise: ${firstYearRaiseAmount}`);
    return firstYearRaiseAmount;
  }

  function firstYearBasePay() {
    const monthlyRaiseAmount = monthlyRaise();
    const firstYearBasePayAmount = newBasePay(monthlyRaiseAmount);
    console.log(`firstYearBasePay: ${firstYearBasePayAmount}`);
    return firstYearBasePayAmount;
  }

  function secondYearRaise(firstYearBasePayAmount) {
    const basePay = parseFloat(firstYearBasePayAmount);
    const secondYearRaiseAmount = monthlyRaise(basePay, 2);
    console.log(`secondYearRaise: ${secondYearRaiseAmount}`);
    return secondYearRaiseAmount;
  }

  function annualImpact(monthlyRaise) {
    let impact = (monthlyRaise * 12).toFixed(2);
    console.log(`annualImpact: ${impact}`);
    return impact;
  }

  function totalLifeOfContract() {

    let firstYearRaiseAmount = firstYearRaise();
    let firstYearBasePayAmount = firstYearBasePay();
    let firstYearTotal = annualImpact(firstYearRaiseAmount);
    console.log(`firstYearTotal: ${firstYearTotal}`);

    let secondYearRaiseAmount = secondYearRaise(firstYearBasePayAmount);
    let secondYearTotal = annualImpact(secondYearRaiseAmount);
    console.log(`secondYearTotal: ${secondYearTotal}`);

    let lifeOfContract = (parseFloat(firstYearTotal) + parseFloat(secondYearTotal)).toFixed(2);
    console.log(`lifeOfContract: ${lifeOfContract}`);

    return lifeOfContract;
  }

  // generate results string and message
  function resultsString(basePay, firstYearRaise, secondYearRaise, lifeOfContractTotal, toppedOut) {
    return `<p>If your base pay is $${basePay}${toppedOut ? " and you are topped out," : ","} your raise in the first year of the contract will be <strong>$${firstYearRaise}</strong> per month. In the second year of the contract it will be <strong>$${secondYearRaise}</strong> per month. Over the two years of the contract this adds up to an extra <strong>$${lifeOfContractTotal} in your pocket.</p>`
  }

  // On reload, reload page
  function handleReload() {
    window.location.reload();
  }

  // On submit, hide keypad and display results
  function handleSubmit() {
    keys.setAttribute("style", "height:0;");
    buttons.forEach(btn =>
      btn.setAttribute("style", "height:0; padding: 0; border: 0")
    );
    startOver.setAttribute("style", "height:3rem; padding: 1rem 0; border: 1px solid white");
    dispwrap.setAttribute("style", "margin-bottom: 0;");
    let totalLifeOfContractAmount = totalLifeOfContract();
    display.value = totalLifeOfContractAmount;
    let firstYearRaiseAmount = firstYearRaise();
    let firstYearBasePayAmount = firstYearBasePay();
    let secondYearRaiseAmount = secondYearRaise(firstYearBasePayAmount);
    results.innerHTML = resultsString(basePay, firstYearRaiseAmount, secondYearRaiseAmount, totalLifeOfContractAmount, toppedOut);

  }

  // Listen for 'Enter' keyup in input field to trigger submit
  display.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      handleSubmit();
    }
  });

  submit.addEventListener("click", handleSubmit);
  startOver.addEventListener("click", handleReload);


});