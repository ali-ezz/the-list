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

  function getClassificationBadge(gpa) {
    const classification = classifyCGPA(gpa);
    let bgColor, textColor;
    
    if (gpa >= 3.5) {
      bgColor = '#4caf50'; // green
      textColor = 'white';
    } else if (gpa >= 3.0) {
      bgColor = '#2196f3'; // blue
      textColor = 'white';
    } else if (gpa >= 2.5) {
      bgColor = '#ff9800'; // orange
      textColor = 'white';
    } else if (gpa >= 2.0) {
      bgColor = '#ffc107'; // amber
      textColor = '#333';
    } else if (gpa >= 1.0) {
      bgColor = '#f44336'; // red
      textColor = 'white';
    } else {
      bgColor = '#9e9e9e'; // grey
      textColor = 'white';
    }
    
    return `<span style="display:inline-block;padding:0.3rem 0.8rem;background:${bgColor};color:${textColor};border-radius:20px;font-size:0.9rem;font-weight:bold;margin-right:0.5rem;">${classification}</span>`;
  }

  // Validate and sanitize numeric input (English numbers only)
  function validateNumericInput(input, min = 0, max = null) {
    let value = input.value;
    
    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Validate range if value is provided
    let numValue = parseFloat(value);
    if (!isNaN(numValue) && value !== '' && value !== '.') {
      if (min !== null && numValue < min) {
        value = min.toString();
      }
      if (max !== null && numValue > max) {
        value = max.toString();
      }
    }
    
    input.value = value;
    return value;
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
    tr.style.borderBottom = '1px solid #e3f2fd';
    tr.style.transition = 'background-color 0.2s';
    tr.style.background = 'white';
    tr.innerHTML = `
      <td style="padding:1.2rem 0.8rem;text-align:center;"><input class="course-credit" type="text" inputmode="decimal" value="${credit}" style="width:90%;padding:0.7rem;border:2px solid #bbdefb;border-radius:6px;text-align:center;font-size:0.95rem;transition:border-color 0.3s;box-sizing:border-box;" /></td>
      <td style="padding:1.2rem 0.8rem;text-align:center;"><input class="course-value" type="text" inputmode="decimal" value="${value}" style="width:90%;padding:0.7rem;border:2px solid #bbdefb;border-radius:6px;text-align:center;font-size:0.95rem;transition:border-color 0.3s;box-sizing:border-box;" /></td>
      <td class="course-point" style="padding:1.2rem 0.8rem;text-align:center;color:#1976d2;font-weight:600;font-size:0.95rem;">-</td>
      <td style="padding:1.2rem 0.8rem;text-align:center;"><button type="button" class="remove-course" style="padding:0.5rem 0.9rem;background:#ffebee;color:#d32f2f;border:1px solid #ffcdd2;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:500;transition:all 0.2s;white-space:nowrap;">حذف</button></td>
    `;
    
    // Add hover effect
    tr.addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#f5f9ff';
    });
    tr.addEventListener('mouseleave', function() {
      this.style.backgroundColor = 'white';
    });
    
    // Add focus styling for inputs
    const inputs = tr.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.style.borderColor = '#2196f3';
        this.style.boxShadow = '0 0 0 3px rgba(33,150,243,0.1)';
      });
      input.addEventListener('blur', function() {
        this.style.borderColor = '#bbdefb';
        this.style.boxShadow = 'none';
      });
    });
    
    // Add hover effect for remove button
    const removeBtn = tr.querySelector('.remove-course');
    removeBtn.addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#d32f2f';
      this.style.color = 'white';
    });
    removeBtn.addEventListener('mouseleave', function() {
      this.style.backgroundColor = '#ffebee';
      this.style.color = '#d32f2f';
    });
    
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

    // Get old GPA and hours with validation
    const oldGpaInput = document.getElementById('old-gpa');
    const oldHoursInput = document.getElementById('old-hours');
    
    let oldGPA = 0;
    let oldHours = 0;
    
    if (oldGpaInput && oldGpaInput.value) {
      oldGPA = parseFloat(oldGpaInput.value.replace(/[^0-9.]/g, '')) || 0;
      if (oldGPA > 4) oldGPA = 4;
      if (oldGPA < 0) oldGPA = 0;
    }
    
    if (oldHoursInput && oldHoursInput.value) {
      oldHours = parseFloat(oldHoursInput.value.replace(/[^0-9.]/g, '')) || 0;
      if (oldHours < 0) oldHours = 0;
    }

    let sumWeighted = 0; // full-precision accumulator for new courses
    let sumCredits = 0; // new courses credits

    for (let i = 0; i < creditsEls.length; i++) {
      const cr = parseFloat(creditsEls[i].value.replace(/[^0-9.]/g, '')) || 0;
      const raw = valueEls[i].value.replace(/[^0-9.]/g, '');
      const interpreted = interpretInputValue(raw);
      const pt = interpreted.point || 0;
      // show per-course point with 3 decimals
      pointEls[i].textContent = (+pt).toFixed(3);
      sumWeighted += pt * cr;
      sumCredits += cr;
    }

    const semesterGpaEl = document.getElementById('semester-gpa-result');
    const semesterDetailEl = document.getElementById('semester-detail');
    const semesterClassificationEl = document.getElementById('semester-classification');
    const cgpaResultEl = document.getElementById('cgpa-result');
    const cgpaDetailEl = document.getElementById('cgpa-detail');
    const cumulativeClassificationEl = document.getElementById('cumulative-classification');
    const cumulativeSection = document.getElementById('cumulative-section');

    // Calculate semester GPA (new courses only)
    if (sumCredits === 0) {
      semesterGpaEl.textContent = 'لا توجد مواد جديدة';
      semesterDetailEl.textContent = '';
      semesterClassificationEl.innerHTML = '';
      cumulativeSection.style.display = 'none';
      return;
    }

    const semesterGpaExact = sumWeighted / sumCredits;
    const semesterGpaTrunc2 = truncateTo(semesterGpaExact, 2);
    
    semesterGpaEl.textContent = semesterGpaTrunc2.toFixed(2);
    semesterClassificationEl.innerHTML = getClassificationBadge(semesterGpaTrunc2);
    semesterDetailEl.textContent = `دقيق: ${semesterGpaExact.toFixed(3)} — مجموع النقاط: ${sumWeighted.toFixed(3)} ، مجموع الساعات: ${sumCredits.toFixed(1)}`;

    // Calculate cumulative GPA if old GPA and hours are provided
    if (oldGPA > 0 && oldHours > 0) {
      const oldWeightedPoints = oldGPA * oldHours;
      const totalWeightedPoints = oldWeightedPoints + sumWeighted;
      const totalHours = oldHours + sumCredits;
      
      const cumulativeGpaExact = totalWeightedPoints / totalHours;
      const cumulativeGpaTrunc2 = truncateTo(cumulativeGpaExact, 2);
      
      cgpaResultEl.textContent = cumulativeGpaTrunc2.toFixed(2);
      cumulativeClassificationEl.innerHTML = getClassificationBadge(cumulativeGpaTrunc2);
      cgpaDetailEl.textContent = `دقيق: ${cumulativeGpaExact.toFixed(3)} — مجموع النقاط الكلي: ${totalWeightedPoints.toFixed(3)} ، مجموع الساعات الكلي: ${totalHours.toFixed(1)}`;
      cumulativeSection.style.display = 'block';
    } else {
      cumulativeSection.style.display = 'none';
    }
  }

  // Setup UI bindings after DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#cgpa-courses tbody');
    const addBtn = document.getElementById('add-course');
    const clearBtn = document.getElementById('clear-courses');
    const oldGpaInput = document.getElementById('old-gpa');
    const oldHoursInput = document.getElementById('old-hours');

    // add a couple default rows
    tableBody.appendChild(createRow(3, 75));
    tableBody.appendChild(createRow(3, 80));
    recalc();

    addBtn.addEventListener('click', function () {
      tableBody.appendChild(createRow(3, 70));
      attachRowHandlers();
      recalc();
    });

    clearBtn.addEventListener('click', function () {
      tableBody.innerHTML = '';
      recalc();
    });

    // Add listeners for old GPA and hours inputs with validation
    if (oldGpaInput) {
      // Add focus/blur styling
      oldGpaInput.addEventListener('focus', function() {
        this.style.borderColor = '#2196f3';
        this.style.boxShadow = '0 0 0 3px rgba(33,150,243,0.1)';
      });
      oldGpaInput.addEventListener('blur', function() {
        this.style.borderColor = '#bbdefb';
        this.style.boxShadow = 'none';
        if (this.value && parseFloat(this.value) > 4) {
          this.value = '4';
        }
      });
      oldGpaInput.addEventListener('input', function () {
        validateNumericInput(this, 0, 4);
        recalc();
      });
    }

    if (oldHoursInput) {
      // Add focus/blur styling
      oldHoursInput.addEventListener('focus', function() {
        this.style.borderColor = '#2196f3';
        this.style.boxShadow = '0 0 0 3px rgba(33,150,243,0.1)';
      });
      oldHoursInput.addEventListener('blur', function() {
        this.style.borderColor = '#bbdefb';
        this.style.boxShadow = 'none';
      });
      oldHoursInput.addEventListener('input', function () {
        validateNumericInput(this, 0);
        recalc();
      });
    }

    // Add button hover effects
    addBtn.addEventListener('mouseenter', function() {
      this.style.background = '#1976d2';
    });
    addBtn.addEventListener('mouseleave', function() {
      this.style.background = '#2196f3';
    });

    clearBtn.addEventListener('mouseenter', function() {
      this.style.background = '#e0e0e0';
      this.style.borderColor = '#bdbdbd';
    });
    clearBtn.addEventListener('mouseleave', function() {
      this.style.background = '#f5f5f5';
      this.style.borderColor = '#e0e0e0';
    });

    function attachRowHandlers() {
      // remove buttons
      Array.from(document.querySelectorAll('.remove-course')).forEach(btn => {
        btn.removeEventListener('click', onRemove); // safe remove
        btn.addEventListener('click', onRemove);
      });

      // inputs change with validation
      Array.from(document.querySelectorAll('.course-credit')).forEach(inp => {
        inp.removeEventListener('input', onCreditInput);
        inp.addEventListener('input', onCreditInput);
      });

      Array.from(document.querySelectorAll('.course-value')).forEach(inp => {
        inp.removeEventListener('input', onValueInput);
        inp.addEventListener('input', onValueInput);
      });
    }

    function onRemove(e) {
      const tr = e.target.closest('tr');
      if (tr) {
        tr.remove();
        recalc();
      }
    }

    function onCreditInput(e) {
      validateNumericInput(e.target, 0);
      recalc();
    }

    function onValueInput(e) {
      validateNumericInput(e.target, 0);
      recalc();
    }

    attachRowHandlers();
  });
})();
