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
let COLA = .03;
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
    const monthlyRaise_ = Number(monthlyRaiseAmount);
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
    instructions.setAttribute("style", "height: 0; display:none;");
    let totalLifeOfContractAmount = totalLifeOfContract();
    displayEl.value = totalLifeOfContractAmount;
    let firstYearRaiseAmount = firstYearRaise();
    let firstYearBasePayAmount = firstYearBasePay();
    let secondYearRaiseAmount = secondYearRaise(firstYearBasePayAmount);
    results.innerHTML = resultsString(basePay, firstYearRaiseAmount, secondYearRaiseAmount, totalLifeOfContractAmount, toppedOut);

  }

  // Listen for 'Enter' keyup in input field to trigger submit
  displayEl.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      handleSubmit();
    }
  });

  submit.addEventListener("click", handleSubmit);
  startOver.addEventListener("click", handleReload);

  // calculator functionality
  // console.log('calcscript');

  // let display = "";
  // let num1 = 0;
  // let num2 = 0;
  // let op = "";
  // let ops = {
  //   "+": "+",
  //   "-": "-",
  //   "*": "x",
  //   "/": "÷"
  // };
  // let state = "start";
  // let total = 0;
  // let exp = "";
  // BigNumber.config(10);

  // function resetVars() {
  //   display = "";
  //   exp = "";
  //   num1 = 0;
  //   num2 = 0;
  //   total = 0;
  //   op = "";
  //   state = "start";
  //   displaySet(display);
  //   updateVars();
  // }

  // function updateVars() {
  //   if (exp.length <= 23) {
  //   $("#exp").text(exp); }
  //   else {
  //     $("#exp").text(exp.substr(0,23));
  //   }
  //   console.log("display: " + display + ", num1: " + num1 + ", num2: " + num2 + ", op: " + op + ", state: " + state + ", total: " + total + ", exp: " + exp);
  // }

  // function number(kval) {
  //   calc('num', kval);
  //   exp += kval.toString();
  // }

  // function eq() {
  //   if (state !== "op" && state != "equals") {
  //     calc('eq', 'eq');
  //     state = "equals";
  //     exp += ("=" + total);
  //   } else if (state === "equals") {
  //     calc('eq', 'eq');
  //     state = "equals";
  //   }
  // }

  // function dot() {
  //   calc('dot', '.');
  //   if (state !== 'dot' && exp.indexOf('.') === -1 && state !== 'equals') {
  //     exp += '.';
  //   }
  // }

  // function oper(kval) {
  //   op = kval;
  //   calc('op', 'op');
  //   state = "op";
  // }

  // function ce() {
  //   display = display.slice(0, -1);
  //   exp = exp.slice(0, -1);
  //   displaySet(display);
  //   updateVars();
  //   calc('ce', 'ce');
  // }

  // $(".calcbtn").on('click', function() {
  //   let kval = $(this).attr('value');
  //   if ($(this).hasClass("num")) {
  //     number(kval);
  //   } else if ($(this).hasClass("eq")) {
  //     eq();
  //   } else if ($(this).hasClass("dot")) {
  //     dot();
  //   } else if ($(this).hasClass("op")) {
  //     oper(kval);
  //   } else if ($(this).hasClass("ce")) {
  //     ce();
  //   } else if ($(this).hasClass("ac")) {
  //     resetVars();
  //   }
  //     updateVars();
  // });

  // document.addEventListener("keydown", function(e) {
  //   e.preventDefault();
  //   var key = e.keyCode ? e.keyCode : e.which;
  //   if (key >= 48 && key <= 57) {
  //     let kval = key - 48;
  //     number(kval);
  //   } else if (key === 107 || key === 109 || key === 106 || key === 111) {
  //     let opkey = {
  //       107: "+",
  //       109: "-",
  //       106: "*",
  //       111: "/"
  //     };
  //     kval = opkey[key];
  //     oper(kval);
  //   } else if (key === 110 || key === 190) {
  //     dot();
  //   } else if (key === 8) {
  //     ce();
  //   } else if (key === 46 || key === 12) {
  //     resetVars();
  //   } else if (key === 13 || key === 187) {
  //     eq();
  //   }
  //   updateVars();
  // });

  // function displaySet(v) {
  //   display = v.toString();
  //   if (display.length > 10) {
  //     $('#display').text(display.substr(0, 10));
  //   } else {
  //     $('#display').text(display);
  //   }
  // }

  // function displayApp(v) {
  //   display = display.toString();
  //   display += v.toString();
  //   displaySet(display);
  // }

  // function equals(num1, num2, op) {
  //   if (op === "+") {
  //     return num1.plus(num2).round(10);
  //   } else if (op === "-") {
  //     return num1.minus(num2).round(10);
  //   } else if (op === "*") {
  //     return num1.times(num2).round(10);
  //   } else if (op === "/") {
  //     return num1.div(num2).round(10);
  //   }
  // }

  // function calc(ktype, kval) {
  //   switch (state) {
  //     case "start":
  //       if (ktype === "num") {
  //         num1 = new BigNumber(kval);
  //         total = num1;
  //         displaySet(num1);
  //         state = "num1";
  //       } else if (ktype === "dot") {
  //         displaySet("0" + kval);
  //         state = "num1dot";
  //       }
  //       break;
  //     case "num1":
  //       if (ktype === "num") {
  //         displayApp(kval);
  //         num1 = new BigNumber(display);
  //         total = num1;
  //         state = "num1";
  //       } else if (ktype === "dot") {
  //         displayApp(kval);
  //         state = "num1dot";
  //       } else if (ktype === "ce") {
  //         num1 = new BigNumber(display);
  //       } else if (ktype === "op") {
  //         exp += ops[op].toString();
  //       }
  //       break;
  //     case "num1dot":
  //       if (ktype === "num") {
  //         displayApp(kval);
  //         num1 = new BigNumber(display);
  //       } else if (ktype === "ce") {
  //         num1 = new BigNumber(display);
  //       } else if (ktype === "op") {
  //         exp += ops[op].toString();
  //       }
  //       break;
  //     case "op":
  //       if (ktype === "num") {
  //         displaySet(kval);
  //         num2 = new BigNumber(display);
  //         state = "num2";
  //       } else if (ktype === "dot") {
  //         displaySet("0" + kval);
  //         num2 = new BigNumber(display);
  //         state = "num2dot";
  //       } else if (ktype === "ce") {
  //         op = "";
  //         num1 = 0;
  //         state = "start";
  //       }
  //       break;
  //     case "num2":
  //       if (ktype === "num") {
  //         displayApp(kval);
  //         num2 = new BigNumber(display);
  //         state = "num2";
  //       } else if (ktype === "dot") {
  //         displayApp(kval);
  //         state = "num2dot";
  //       } else if (ktype === "op") {
  //         total = equals(num1, num2, op);
  //         updateVars();
  //         displaySet(total);
  //         num1 = total;
  //         exp += ops[op];
  //       } else if (ktype === "eq") {
  //         total = equals(num1, num2, op);
  //         updateVars();
  //         displaySet(total);
  //         num1 = total;
  //       } else if (ktype === "ce") {
  //         num2 = new BigNumber(display);
  //         if (isNumber(exp[exp.length - 1])) {
  //           state = "num2";
  //         } else if (exp[exp.length - 1] === ".") {
  //           state = "num2dot";
  //         } else {
  //           state = "op";
  //         }
  //       }
  //       break;
  //     case "num2dot":
  //       if (ktype === "num") {
  //         displayApp(kval);
  //         num2 = new BigNumber(display);
  //         state = "num2";
  //       } else if (ktype === "ce") {
  //         num2 = new BigNumber(display);
  //       } else if (ktype === "op") {
  //         exp += ops[op].toString();
  //       }
  //       break;
  //     case "equals":
  //       exp = "";
  //       if (ktype === "num") {
  //         num1 = new BigNumber(kval);
  //         num2 = 0;
  //         total = 0;
  //         op = "";
  //         displaySet(num1);
  //         state = "num1";
  //       } else if (ktype === "dot") {
  //         displaySet("0" + kval);
  //         state = "num1dot";
  //       } else if (ktype === "eq") {
  //         total = equals(num1, num2, op);
  //         exp = (num1 + ops[op] + num2 + "=" + total);
  //         displaySet(total);
  //         num1 = display;
  //         state = "equals";
  //       } else if (ktype === "op") {
  //         exp = num1 + ops[op];
  //       }
  //       break;
  //   }
  // }


});
