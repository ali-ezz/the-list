// CGPA calculator script (university-style truncation)
// Shows exact CGPA (3 decimals) and final CGPA truncated to 2 decimals (no rounding up).

(function () {
  // grade mapping from percentage to grade point
  function percentToPoint(p) {
    if (p === null || isNaN(p)) return 0;
    p = Number(p);
    if (p >= 96) return 4.0;
    if (p >= 92) return 3.7;
    if (p >= 88) return 3.4;
    if (p >= 84) return 3.2;
    if (p >= 80) return 3.0;
    if (p >= 76) return 2.8;
    if (p >= 72) return 2.6;
    if (p >= 68) return 2.4;
    if (p >= 64) return 2.2;
    if (p >= 60) return 2.0;
    if (p >= 55) return 1.5;
    if (p >= 50) return 1.0;
    return 0.0;
  }

  function classifyCGPA(gpa) {
    if (gpa >= 3.5) return 'ممتاز';
    if (gpa >= 3.0) return 'جيد جداً';
    if (gpa >= 2.5) return 'جيد';
    if (gpa >= 2.0) return 'مقبول';
    if (gpa >= 1.0) return 'ضعيف';
    return 'ضعيف جداً';
  }

  // If inputValue <= 4.0 treat as grade-point directly, otherwise treat as percentage.
  function interpretInputValue(v) {
    if (v === '' || v === null || isNaN(v)) return 0;
    const num = Number(v);
    if (num <= 4.0) {
      // direct grade point (allow up to 4.0)
      return { point: num, source: 'gp' };
    }
    // treat as percentage
    return { point: percentToPoint(num), source: 'pct' };
  }

  function createRow(credit = 3, value = 75) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input class="course-credit" type="number" min="0" step="0.5" value="${credit}" /></td>
      <td><input class="course-value" type="number" min="0" max="100" step="0.1" value="${value}" /></td>
      <td class="course-point">-</td>
      <td><button type="button" class="remove-course">حذف</button></td>
    `;
    return tr;
  }

  function truncateTo(num, digits) {
    const factor = Math.pow(10, digits);
    return Math.floor(num * factor) / factor;
  }

  function formatNumber(num, digits = 2) {
    return (Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits)).toFixed(digits);
  }

  function recalc() {
    const creditsEls = Array.from(document.querySelectorAll('.course-credit'));
    const valueEls = Array.from(document.querySelectorAll('.course-value'));
    const pointEls = Array.from(document.querySelectorAll('.course-point'));

    let sumWeighted = 0; // full-precision accumulator
    let sumCredits = 0;

    for (let i = 0; i < creditsEls.length; i++) {
      const cr = parseFloat(creditsEls[i].value) || 0;
      const raw = valueEls[i].value;
      const interpreted = interpretInputValue(raw);
      const pt = interpreted.point || 0;
      // show per-course point with 3 decimals
      pointEls[i].textContent = (+pt).toFixed(3);
      sumWeighted += pt * cr;
      sumCredits += cr;
    }

    const resultEl = document.getElementById('cgpa-result');
    const detailEl = document.getElementById('cgpa-detail');

    if (sumCredits === 0) {
      resultEl.textContent = 'لا توجد ساعات معتمدة';
      detailEl.textContent = '';
      return;
    }

    const cgpaExact = sumWeighted / sumCredits; // full precision (e.g., 3.625)
    const cgpaTrunc2 = truncateTo(cgpaExact, 2); // university final value (no rounding up)
    // display values: exact with 3 decimals, final CGPA truncated to 2 decimals
    resultEl.textContent = cgpaTrunc2.toFixed(2);
    detailEl.textContent = `دقيق: ${cgpaExact.toFixed(3)} — التصنيف: ${classifyCGPA(cgpaTrunc2)} — مجموع النقاط: ${sumWeighted.toFixed(3)} ، مجموع الساعات: ${sumCredits.toFixed(1)}`;
  }

  // Setup UI bindings after DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#cgpa-courses tbody');
    const addBtn = document.getElementById('add-course');
    const calcBtn = document.getElementById('calc-cgpa');
    const clearBtn = document.getElementById('clear-courses');

    // add a couple default rows
    tableBody.appendChild(createRow(3, 75));
    tableBody.appendChild(createRow(3, 80));
    recalc();

    addBtn.addEventListener('click', function () {
      tableBody.appendChild(createRow(3, 70));
      attachRowHandlers();
      recalc();
    });

    calcBtn.addEventListener('click', function () {
      recalc();
    });

    clearBtn.addEventListener('click', function () {
      tableBody.innerHTML = '';
      recalc();
    });

    function attachRowHandlers() {
      // remove buttons
      Array.from(document.querySelectorAll('.remove-course')).forEach(btn => {
        btn.removeEventListener('click', onRemove); // safe remove
        btn.addEventListener('click', onRemove);
      });

      // inputs change
      Array.from(document.querySelectorAll('.course-credit, .course-value')).forEach(inp => {
        inp.removeEventListener('input', onInput); // safe remove
        inp.addEventListener('input', onInput);
      });
    }

    function onRemove(e) {
      const tr = e.target.closest('tr');
      if (tr) {
        tr.remove();
        recalc();
      }
    }

    function onInput() {
      recalc();
    }

    attachRowHandlers();
  });
})();
