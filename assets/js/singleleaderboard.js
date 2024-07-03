let scores;
let sbChart1, sbChart2;

async function fetchLeaderboard() {
    const response = await fetch('http://localhost:5000/leaderboard');
    scores = await response.json();
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = '';
    updateDataVisualization();
    scores.entries.forEach((score, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.userName}</td>
            <td>${score.SB}</td>
            <td>${score.theScore}</td>
            <td>${score.theMessage}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

async function updateDataVisualization() {
    const leaderboard = scores;

    const sbData = {};
    leaderboard.entries.forEach(entry => {
        if (!sbData[entry.SB.toLowerCase()]) {
            sbData[entry.SB.toLowerCase()] = {
                count: 0,
                totalScore: 0
            };
        }
        sbData[entry.SB.toLowerCase()].count++;
        sbData[entry.SB.toLowerCase()].totalScore += entry.theScore;
    });

    const sbArray = Object.keys(sbData).map(key => ({
        SB: key,
        count: sbData[key].count,
        totalScore: sbData[key].totalScore
    }));

    sbArray.sort((a, b) => b.totalScore - a.totalScore);

    const top5SBs = sbArray.slice(0, 5);
    const otherSBs = sbArray.slice(5);

    const otherCount = otherSBs.reduce((sum, sb) => sum + sb.count, 0);
    const otherTotalScore = otherSBs.reduce((sum, sb) => sum + sb.totalScore, 0);

    if (otherSBs.length > 0) {
        top5SBs.push({
            SB: 'Other',
            count: otherCount,
            totalScore: otherTotalScore
        });
    }

    const sbLabels = top5SBs.map(sb => sb.SB);
    const sbCounts = top5SBs.map(sb => sb.count);
    const sbTotalScores = top5SBs.map(sb => sb.totalScore);

    const colors = [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
    ];

    const borderColors = colors.map(color => color.replace('0.5', '1'));

    if (sbChart1) sbChart1.destroy();
    if (sbChart2) sbChart2.destroy();

    const sbChartCanvas1 = document.getElementById('sbChart1');
    const sbChartCtx1 = sbChartCanvas1.getContext('2d');

    sbChart1 = new Chart(sbChartCtx1, {
        type: 'pie',
        data: {
            labels: sbLabels,
            datasets: [{
                label: 'Number of Players per SB',
                data: sbCounts,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Number of Players per SB'
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const dataset = tooltipItem.dataset;
                            const index = tooltipItem.dataIndex;
                            return `${sbLabels[index]}: ${dataset.data[index]}`;
                        }
                    }
                }
            }
        }
    });

    const sbChartCanvas2 = document.getElementById('sbChart2');
    const sbChartCtx2 = sbChartCanvas2.getContext('2d');

    sbChart2 = new Chart(sbChartCtx2, {
        type: 'pie',
        data: {
            labels: sbLabels,
            datasets: [{
                label: 'Total Score per SB',
                data: sbTotalScores,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Total Score per SB'
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const dataset = tooltipItem.dataset;
                            const index = tooltipItem.dataIndex;
                            return `${sbLabels[index]}: ${dataset.data[index]}`;
                        }
                    }
                }
            }
        }
    });
}

window.onload = fetchLeaderboard;