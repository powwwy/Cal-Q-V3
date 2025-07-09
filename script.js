document.addEventListener('DOMContentLoaded', () => {
  fetch('/Study-Hub/php/get_metrics.php')
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
        const catSum = catScores.reduce((sum, val) => sum + val, 0); 
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

      // Chart rendering with gradients
      renderCharts(unitLabels, catSeries, examScores);
    })
    .catch(err => {
      console.error("Error fetching metrics data:", err);
    });
});

function renderCharts(units, catSeries, examScores) {
  const catLabels = ['CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'CAT 5'];
  const chartColors = [
    'rgba(88, 221, 208, 1)',
    'rgba(255, 0, 0,1)',  // --color-accent
    'rgba(77, 22, 186, 1)', // --color-primary-light
    'rgba(207, 212, 218, 1)', // --color-primary
    'rgba(45, 74, 83, 1)',    // --background-card
    'rgba(215, 255, 248, 1)' , // --background-light
    'rgba(255, 255, 255, 1)', // --color-text
    'rgba(0, 0, 0, 1)', // --color-text-dark
     // --color-error
  ];

  // Create gradient fill function
  const createGradient = (ctx, chartArea, color) => {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, color.replace('1)', '0.7)'));
    gradient.addColorStop(1, color.replace('1)', '0.1)'));
    return gradient;
  };

  // CAT Scores Line Chart with Gradient Bottom
  const catCtx = document.getElementById('catsChart').getContext('2d');
  new Chart(catCtx, {
    type: 'line',
    data: {
      labels: catLabels,
      datasets: units.map((unitName, i) => ({
        label: unitName,
        data: catSeries.map(cat => cat[i] ?? null),
        borderColor: chartColors[i % chartColors.length],
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          return createGradient(ctx, chartArea, chartColors[i % chartColors.length]);
        },
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        fill: true,
        tension: 0.3,
        spanGaps: false
      }))
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 10,
          grid: {
            color: 'rgba(96, 96, 96, 0.79)'
          },
          ticks: {
            color: '#ffffff',
          },
          title: {
            display: true,
            text: 'Score (0–10)',
            color: '#ffffff'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#ffffff'
          }
        }
      },
      plugins: {
        legend: { 
          position: 'top',
          labels: {
            color: '#ffffff',
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: 'CAT Progression Per Unit',
          color: '#ffffff',
          font: {
            size: 16
          }
        },
        tooltip: {
          backgroundColor: 'var(--background-card)',
          titleColor: 'var(--color-accent)',
          bodyColor: 'var(--color-text)',
          borderColor: 'var(--color-accent)',
          color: '#ffffff',
          borderWidth: 1
        }
      }
    }
  });

  // Exam Scores Bar Chart with Glass Effect
  const examCtx = document.getElementById('examChart').getContext('2d');
  new Chart(examCtx, {
    type: 'bar',
    data: {
      labels: units,
      datasets: [{
        label: 'Exam Score',
        data: examScores,
        backgroundColor: units.map((_, i) => 
          `rgba(88, 221, 208, ${0.5 + (i * 0.1)})` // Gradient-like effect
        ),
        borderColor: 'var(--color-accent)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 70,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#ffffff',
          },
          title: {
            display: true,
            text: 'Exam Score (%)',
            color: '#ffffff'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#ffffff'
          }
        }
      },
      plugins: {
        legend: { 
          display: false 
        },
        title: {
          display: true,
          text: 'Exam Scores Per Unit',
          color: '#ffffff',
          font: {
            size: 16
          }
        },
        tooltip: {
          backgroundColor: 'var(--background-card)',
          titleColor: 'var(--color-accent)',
          bodyColor: 'var(--color-text)',
          borderColor: 'var(--color-accent)',
          color: '#ffffff',
          borderWidth: 1
        }
      }
    }
  });
}