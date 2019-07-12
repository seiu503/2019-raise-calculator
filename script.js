// todo:
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
let COLA1 = .0215;
let COLA2 = .03;
let step  = .047;
let toppedOut = false;
let basePay = 0;
let prevNum = null;

document.addEventListener("DOMContentLoaded", function(){

  // save elements to variables for later access
  let displayEl = document.getElementById("display");
  let dispwrap = document.getElementById("dispwrap");
  let submit = document.getElementById("submit");
  let startOver = document.getElementById("startOver");
  let keys = document.getElementById("keys");
  let buttonsNodeList = document.getElementsByClassName("calcbtn");
  buttons = Array.from(buttonsNodeList);
  let results = document.getElementById("results");
  let toppedOutEl = document.getElementById("toppedOut");
  let instructions = document.getElementById("instructions");
  let numbersNodeList = document.getElementsByClassName("num");
  numbers = Array.from(numbersNodeList);

  // listen for changes to toppedOut
  toppedOutEl.addEventListener("change", function(event) {
    toppedOut = this.checked;
    console.log(`toppedOut: ${toppedOut}`);
  });


  // Restrict input to digits and '.' with regex filter.
  setInputFilter(displayEl, function(value) {
    return /^\d*\.?\d*$/.test(value);
  });

  // listen for changes to display
  displayEl.addEventListener("change", function(event) {
    basePay = Number(this.value);
    console.log(typeof basePay);
    console.log(`basePay: ${basePay}`);
  });

  // number button functionality
  numbers.forEach(num =>
    num.addEventListener("click", function(event) {
      console.log(event.target.value);
      val = event.target.value;
      displayVal = basePay.toString();

      // decimal point can only be used once
      if (prevNum === "." && displayVal.indexOf('.') == -1) {
        displayVal += `.${val}`;
      } else if ((val === "." && displayVal.indexOf('.') == -1) || (val !== ".")) {
        displayVal += val;
      }

      if (displayVal.charAt(0) === '0') {
        displayVal = displayVal.substr(1);
      }
      console.log(displayVal);
      console.log(prevNum);
      displayEl.value = displayVal;
      console.log(displayEl.value);

      basePay = parseFloat(displayVal);
      console.log(typeof basePay);
      console.log(`basePay: ${basePay}`);
      prevNum = val;
    })
  );


  // formulas
  function monthlyRaise(basePayVar, year) {
    if (!basePayVar) {basePayVar = basePay}
    if (year === 2 && toppedOut) {
      // formula for raise in year 2 for topped out (COLA2 only, no step)
      let raise = (basePayVar * COLA2).toFixed(2);
      console.log(`monthly raise in second year when topped out: ${raise}`);
      return Number(raise);
    } else if (year === 2) {
      // formula for raise in year 2 for not topped out (COLA2 plus step)
      let raise = ((basePayVar * COLA2) + (basePayVar * step)).toFixed(2);
      console.log(`monthly raise in second year, not topped out: ${raise}`);
      return Number(raise);
    } else {
      // formula for raise in year 1 (COLA1 + everybody gets a step)
      let raise = ((basePayVar * COLA1) + (basePayVar * step)).toFixed(2);
      console.log(`monthly raise in first year: ${raise}`);
      return Number(raise);
    }
  }

  function monthlyRaiseCOLAOnly(basePayVar, year) {
    if (!basePayVar) {basePayVar = basePay}
    if (year === 2) {
      // formula for COLA2 only in second year
      let raise = (basePayVar * COLA2).toFixed(2);
      console.log(`monthly COLA in second year: ${raise}`);
      return raise;
    } else {
      // formula for COLA1 only in first year
      let raise = (basePayVar * COLA1).toFixed(2);
      console.log(`monthly COLA in first year: ${raise}`);
      return raise;
    }
  }

  function newBasePay(monthlyRaiseAmount, basePayVar) {
    if (!basePayVar) {basePayVar = basePay}
    const monthlyRaise_ = Number(monthlyRaiseAmount);
    let newPay = (basePayVar + monthlyRaise_).toFixed(2);
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
    const basePayAmount = Number(firstYearBasePayAmount);
    const secondYearRaiseAmount = monthlyRaise(basePayAmount, 2);
    console.log(`secondYearRaise: ${secondYearRaiseAmount}`);
    return secondYearRaiseAmount;
  }

  function secondYearBasePay(firstYearBasePayAmount) {
    const basePayAmount = Number(firstYearBasePayAmount);
    console.log(`################## ${basePayAmount}`);
    console.log(typeof basePayAmount);
    const secondYearRaiseAmount = Number(monthlyRaise(basePayAmount, 2));
    console.log(`################## ${secondYearRaiseAmount}`);
    console.log(typeof secondYearRaiseAmount);
    const secondYearBasePayAmount = Number(basePayAmount + secondYearRaiseAmount).toFixed(2);
    console.log(`secondYearBasePay: ${secondYearBasePayAmount}`);
    return Number(secondYearBasePayAmount);
  }

  function annualImpact(year, basePayV) {
    let impact = 0;
    let basePayVar = Number(basePayV);
    let basePay_ = Number(basePay);
    if (year === 2 && toppedOut) {
      // if topped out, annual impact in year 2 is
      // final first year's base pay (after step) plus 2nd year COLA * 12
      // minus original base pay * 12 (diff between original & contract wins)
      let secondYearMonthlyAfterCOLA = Number(basePayVar + (basePayVar * COLA2));
      impact = ((Number(secondYearMonthlyAfterCOLA) * 12) - Number(basePay_ * 12)).toFixed(2);
      console.log(`!@#$%%^&* ${Number(impact)}`);
    } else if (year === 2 && !toppedOut) {
      // if not topped out, annual impact in year 2 is
      // final first year's base pay (after step) plus 2nd year COLA * 6
      // plus second year's base pay (after second step) * 6
      // minus original base pay * 12 (diff between original & contract wins)
      let secondYearMonthlyAfterCOLA = Number(basePayVar + (basePayVar * COLA2));
      let impact1st6Months = (secondYearMonthlyAfterCOLA - basePay_) * 6;
      let secondYearMonthlyAfterStep = Number(secondYearMonthlyAfterCOLA + (secondYearMonthlyAfterCOLA * step));
      let impact2nd6Months = (secondYearMonthlyAfterStep - basePay_) * 6;
      impact = (impact1st6Months + impact2nd6Months).toFixed(2);
      console.log(`!@#$%%^&* ${Number(impact)}`);
    } else {
      // in year 1, basePay is user-provided base pay
      // before any steps or COLAs are applied
      // impact is 12 months of COLA plus 6 months of step
      // minus original base pay * 12 (diff between original & contract wins)
      let firstYearMonthlyAfterCOLA = Number(basePay_ + (basePay_ * COLA1));
      console.log(`!@#$%%^&* ${firstYearMonthlyAfterCOLA}`);
      let impact1st6Months = (basePay_ * COLA1) * 6;
      console.log(`!@#$%%^&* ${impact1st6Months.toFixed(2)}`);
      let firstYearMonthlyAfterStep = Number(firstYearMonthlyAfterCOLA + (firstYearMonthlyAfterCOLA * step));
      console.log(`!@#$%%^&* ${firstYearMonthlyAfterStep.toFixed(2)}`);
      let impact2nd6Months = (firstYearMonthlyAfterStep - basePay_) * 6;
      console.log(`!@#$%%^&* ${impact2nd6Months.toFixed(2)}`);
      impact = (impact1st6Months + impact2nd6Months).toFixed(2);
      console.log(`!@#$%%^&* ${Number(impact)}`);
    }
    console.log(`annualImpact: ${Number(impact)}`);
    return Number(impact);
  }

  function totalLifeOfContract() {

    let firstYearRaiseAmount = firstYearRaise();
    let firstYearBasePayAmount = firstYearBasePay();
    let firstYearTotal = annualImpact(1);
    console.log(`firstYearTotal: ${firstYearTotal}`);

    let secondYearRaiseAmount = secondYearRaise(firstYearBasePayAmount);
    let secondYearTotal = annualImpact(2, firstYearBasePayAmount);
    console.log(`secondYearTotal: ${secondYearTotal}`);

    let lifeOfContract = (Number(firstYearTotal) + Number(secondYearTotal)).toFixed(2);
    console.log(`lifeOfContract: ${lifeOfContract}`);

    return Number(lifeOfContract);
  }

  // generate results string and message
  function resultsString(firstYearRaiseAmount, secondYearRaiseAmount, lifeOfContractTotal, secondYearBasePayAmount) {
    return `<p>If your base pay is $${basePay}${toppedOut ? " and you are topped out," : ","} your total raise in the first year of the contract after your step increase will be <strong>$${firstYearRaiseAmount}</strong> per month. In the second year of the contract${!toppedOut ? " after your step increase" : ""} it will be <strong>$${secondYearRaiseAmount}</strong> per month. Over the two years of the contract this adds up to an extra <strong>$${lifeOfContractTotal} in your pocket. And by July 1 2020, your new monthly base pay will be $${secondYearBasePayAmount}</p>`
  }

  // On reload, reload page
  function handleReload() {
    window.location.reload();
  }

  // On submit, hide keypad and display results
  function handleSubmit() {
    keys.setAttribute("style", "height:0;");
    buttons.forEach(btn =>
      btn.setAttribute("style", "height:0; padding: 0; border: 0; display:none;")
    );
    submit.setAttribute("style", "display:none;");
    startOver.setAttribute("style", "height:3rem; padding: 1rem 0; border: 1px solid white");
    dispwrap.setAttribute("style", "margin-bottom: 0;");
    instructions.setAttribute("style", "height: 0; display:none;");
    let totalLifeOfContractAmount = totalLifeOfContract();
    displayEl.value = totalLifeOfContractAmount;
    let firstYearRaiseAmount = firstYearRaise();
    let firstYearBasePayAmount = firstYearBasePay();
    let secondYearRaiseAmount = secondYearRaise(firstYearBasePayAmount);
    let secondYearBasePayAmount = Number(secondYearBasePay(firstYearBasePayAmount));
    results.innerHTML = resultsString(firstYearRaiseAmount, secondYearRaiseAmount, totalLifeOfContractAmount, secondYearBasePayAmount);

  }

  // Listen for 'Enter' keyup in input field to trigger submit
  displayEl.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      handleSubmit();
    }
  });

  submit.addEventListener("click", handleSubmit);
  startOver.addEventListener("click", handleReload);

});
