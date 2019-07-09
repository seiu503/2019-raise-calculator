// Restricts input for the given textbox to the given inputFilter.
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
  let basePay;
  let toppedOut;

  // formulas
  function monthlyRaise(basePay, COLA, toppedOut) {
    if (toppedOut) {
      return basepay * COLA;
    } else {
      return (basePay * COLA) + (basePay * .047);
    }

  }

  function newBasePay(basePay, monthlyRaise) {
    return basePay + monthlyRaise;
  }

  function annualImpact(newBasePay) {
    return newBasePay * 12;
  }

  function totalLifeOfContract(basePay, toppedOut, COLA) {
    if (toppedOut) {
      let firstYearBasePay = newBasePay(basePay, monthlyRaise(basePay, COLA, false));
      let firstYearTotal = annualImpact(firstYearBasePay);
      console.log(`firstYearTotal: ${firstYearTotal}`);
      let secondYearBasePay = newBasePay(firstYearBasePay, monthlyRaise(firstYearBasePay, COLA, true));
      let secondYearTotal = annualImpact(secondYearBasePay);
      console.log(`secondYearTotal: ${secondYearTotal}`);
      return firstYearTotal + secondYearTotal;
    }
  }
});