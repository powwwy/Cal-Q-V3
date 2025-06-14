document.addEventListener('DOMContentLoaded', () => {
  fetch('../php/get_metrics.php')
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        console.warn("No metrics data found.");
        return;
      }

      const tableBody = document.querySelector('#gradeTableBody');
      const summaryBody = document.querySelector('#summaryBody');
      const avgFinalCell = document.querySelector('#avgFinal');
      const rangeFinalCell = document.querySelector('#rangeFinal');

      const unitLabels = [];
      const catSeries = [[], [], [], [], []];
      const examScores = [];
      const finalProjections = [];

      let finalSum = 0;
      let minFinal = 100;
      let maxFinal = 0;

      data.forEach((unit, i) => {
        const { name, cwWeight, examWeight, catScores, examScore } = unit;

        // Render raw scores table
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${name}</td>
          <td>${cwWeight}%</td>
          <td>${examWeight}%</td>
          ${catScores.map(score => `<td>${score}</td>`).join('')}
          <td>${examScore}</td>
        `;
        tableBody.appendChild(row);

       // Compute stats
const catSum = catScores.reduce((sum, val) => sum + val, 0); // still a number
const catAvg = catScores.length ? (catSum / catScores.length).toFixed(1) : '0.0';
const cwPercent = catSum;
const projectedFinal = cwPercent + examScore;

finalSum += projectedFinal;
minFinal = Math.min(minFinal, projectedFinal);
maxFinal = Math.max(maxFinal, projectedFinal);

        // Render summary table
        const summaryRow = document.createElement('tr');
        summaryRow.innerHTML = `
          <td>${name}</td>
          <td>${catAvg}</td>
          <td>${cwPercent.toFixed(1)}</td>
          <td>${examScore}</td>
          <td>${projectedFinal}</td>
        `;
        summaryBody.appendChild(summaryRow);

        // Chart data
        unitLabels.push(name);
        examScores.push(examScore);
        finalProjections.push(projectedFinal);

        for (let j = 0; j < catSeries.length; j++) {
          catSeries[j][i] = j < catScores.length ? catScores[j] : null;
        }
      });

      avgFinalCell.textContent = (finalSum / data.length).toFixed(1);
      rangeFinalCell.textContent = `${minFinal} - ${maxFinal}`;

      // Chart rendering
      renderCharts(unitLabels, catSeries, examScores);
    })
    .catch(err => {
      console.error("Error fetching metrics data:", err);
    });
});

function renderCharts(units, catSeries, examScores) {
  const catLabels = ['CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'CAT 5'];

  // Transpose catSeries to group by unit instead of by CAT
  const unitCatSeries = units.map((unitName, i) => {
    const scores = catSeries.map(cat => cat[i] ?? null); // null for missing
    return {
      label: unitName,
      data: scores,
      borderColor: getCatColor(i),
      backgroundColor: getCatColor(i),
      tension: 0.3,
      spanGaps: false
    };
  });

  const catCtx = document.getElementById('catsChart').getContext('2d');
  new Chart(catCtx, {
    type: 'line',
    data: {
      labels: catLabels,
      datasets: unitCatSeries
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 10,
          title: {
            display: true,
            text: 'Score (0–10)'
          }
        }
      },
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: 'CAT Progression Per Unit'
        }
      }
    }
  });

  // Exam Chart stays the same
  const examCtx = document.getElementById('examChart').getContext('2d');
  new Chart(examCtx, {
    type: 'bar',
    data: {
      labels: units,
      datasets: [{
        label: 'Exam Score',
        data: examScores,
        backgroundColor: '#00b894'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 70,
          title: {
            display: true,
            text: 'Exam Score (%)'
          }
        }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Exam Scores Per Unit'
        }
      }
    }
  });
}


function getCatColor(index) {
  const palette = ['#0984e3', '#6c5ce7', '#fd79a8', '#e17055', '#00cec9'];
  return palette[index % palette.length];
}
