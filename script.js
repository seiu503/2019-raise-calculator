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

document.addEventListener("DOMContentLoaded", function(){

  // Restrict input to digits and '.' by using a regular expression filter.
  setInputFilter(document.getElementById("display"), function(value) {
    return /^\d*\.?\d*$/.test(value);
  });

  // set variables

  let toppedOut = false;

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

  document.getElementById('submit').addEventListener("click", function(){
    console.log('click');
    const basePay = document.getElementById('display').value;
    console.log(basePay);
    totalLifeOfContract(basePay, false, .03);
    });

});