/* ================================
   GITHUB API INTEGRATION - SECURE VERSION
   Uses Netlify serverless function to hide token
   ================================ */

// Configuration
const USERNAME = 'smita1078';

// ================================
// UTILITY FUNCTIONS
// ================================

async function fetchWithAuth(url, options = {}) {
    // Extract the endpoint path from the full GitHub API URL
    const endpoint = url.replace('https://api.github.com', '');
    const isCommitSearch = url.includes('/search/commits');
    
    try {
        // Call Netlify serverless function instead of GitHub directly
        const response = await fetch('/.netlify/functions/github-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                endpoint: endpoint,
                isCommitSearch: isCommitSearch
            })
        });
        
        if (!response.ok) {
            console.error(`Proxy returned ${response.status}`);
        }
        
        return response;
    } catch (error) {
        console.error('Proxy request failed:', error);
        throw error;
    }
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
        element.style.animation = 'fadeIn 0.5s ease-in';
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }

    return 'Just now';
}

function showError(message) {
    const container = document.getElementById("latestCommits");
    if (container) {
        container.innerHTML = `
            <div style="background: rgba(255, 0, 0, 0.1); border: 1px solid rgba(255, 0, 0, 0.3); padding: 2rem; border-radius: 8px; text-align: center; color: #ff6b6b;">
                <h4 style="margin-bottom: 1rem;">⚠️ Failed to Load GitHub Data</h4>
                <p>${message}</p>
            </div>
        `;
    }

    ['ghRepos', 'ghPROpen', 'ghPRMerged', 'ghPRClosed'].forEach(id => {
        updateElement(id, 'N/A');
    });
}

function getLocalDateKey(utcDateString) {
    const date = new Date(utcDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ================================
// FETCH GITHUB STATS
// ================================

async function loadGitHub() {
    try {
        console.log(' Fetching GitHub data...');

        const cacheBuster = Date.now();
        const [userRes, repoRes, prOpenedRes, prMergedRes, prClosedRes] = await Promise.all([
            fetchWithAuth(`https://api.github.com/users/${USERNAME}?_=${cacheBuster}`),
            fetchWithAuth(`https://api.github.com/users/${USERNAME}/repos?per_page=100&_=${cacheBuster}`),
            fetchWithAuth(`https://api.github.com/search/issues?q=author:${USERNAME}+type:pr&_=${cacheBuster}`),
            fetchWithAuth(`https://api.github.com/search/issues?q=author:${USERNAME}+type:pr+is:merged&_=${cacheBuster}`),
            fetchWithAuth(`https://api.github.com/search/issues?q=author:${USERNAME}+type:pr+is:closed&_=${cacheBuster}`)
        ]);

        if (!userRes.ok) {
            throw new Error(`Failed to fetch user data: ${userRes.status}`);
        }

        const user = await userRes.json();
        const repos = await repoRes.json();
        const prOpened = await prOpenedRes.json();
        const prMerged = await prMergedRes.json();
        const prClosedRaw = await prClosedRes.json();

        console.log(' Data fetched successfully');

        updateElement("ghRepos", user.public_repos);

        const openedCount = prOpened.total_count || 0;
        const mergedCount = prMerged.total_count || 0;
        const closedCount = Math.max((prClosedRaw.total_count || 0) - mergedCount, 0);

        updateElement("ghPROpen", openedCount);
        updateElement("ghPRMerged", mergedCount);
        updateElement("ghPRClosed", closedCount);

        await fetchLatestCommits(repos);
        await generateContributionGraph();

        setTimeout(() => {
            createActivityChart(openedCount, mergedCount);
        }, 100);

    } catch (err) {
        console.error(" GitHub API error:", err);
        showError(err.message);
    }
}

// ================================
// FETCH LATEST COMMITS
// ================================

async function fetchLatestCommits(repos) {
    const container = document.getElementById("latestCommits");
    if (!container) return;

    console.log('🔍 Fetching latest commits...');
    container.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading...</div>';

    try {
        let allCommits = [];
        const cacheBuster = Date.now();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        console.log(`📚 Checking ${repos.length} repos...`);
        const sortedRepos = repos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

        for (const repo of sortedRepos.slice(0, 15)) {
            try {
                const commitsRes = await fetchWithAuth(
                    `https://api.github.com/repos/${repo.full_name}/commits?author=${USERNAME}&since=${thirtyDaysAgo.toISOString()}&per_page=20&_=${cacheBuster}`
                );

                if (commitsRes.ok) {
                    const commits = await commitsRes.json();
                    if (commits.length > 0) {
                        console.log(`  ✓ ${repo.name}: ${commits.length} commits`);
                        commits.forEach(commit => {
                            if (!allCommits.find(c => c.sha === commit.sha)) {
                                allCommits.push({
                                    ...commit,
                                    repoName: repo.name,
                                    repoFullName: repo.full_name
                                });
                            }
                        });
                    }
                }

                // If this is a fork, check upstream AND all branches
                if (repo.fork) {
                    console.log(`   ${repo.name} is a fork, checking upstream and branches...`);

                    const repoInfoRes = await fetchWithAuth(`https://api.github.com/repos/${repo.full_name}?_=${cacheBuster}`);
                    if (repoInfoRes.ok) {
                        const repoInfo = await repoInfoRes.json();

                        if (repoInfo.parent) {
                            const upstreamName = repoInfo.parent.full_name;
                            console.log(`     Upstream: ${upstreamName}`);

                            // Check upstream
                            const upstreamRes = await fetchWithAuth(
                                `https://api.github.com/repos/${upstreamName}/commits?author=${USERNAME}&since=${thirtyDaysAgo.toISOString()}&per_page=20&_=${cacheBuster}`
                            );

                            if (upstreamRes.ok) {
                                const upstreamCommits = await upstreamRes.json();
                                console.log(`    ✓ ${upstreamName}: ${upstreamCommits.length} commits`);
                                upstreamCommits.forEach(commit => {
                                    if (!allCommits.find(c => c.sha === commit.sha)) {
                                        allCommits.push({
                                            ...commit,
                                            repoName: upstreamName.split('/').pop(),
                                            repoFullName: upstreamName
                                        });
                                    }
                                });
                            }

                            // Check ALL branches in fork
                            console.log(`     Checking all branches...`);
                            const branchesRes = await fetchWithAuth(
                                `https://api.github.com/repos/${repo.full_name}/branches?per_page=100&_=${cacheBuster}`
                            );

                            if (branchesRes.ok) {
                                const branches = await branchesRes.json();
                                console.log(`    Found ${branches.length} branches:`, branches.map(b => b.name).join(', '));

                                for (const branch of branches) {
                                    try {
                                        const branchCommitsRes = await fetchWithAuth(
                                            `https://api.github.com/repos/${repo.full_name}/commits?sha=${branch.name}&author=${USERNAME}&since=${thirtyDaysAgo.toISOString()}&per_page=20&_=${cacheBuster}`
                                        );

                                        if (branchCommitsRes.ok) {
                                            const branchCommits = await branchCommitsRes.json();
                                            if (branchCommits.length > 0) {
                                                console.log(`      ✓ Branch '${branch.name}': ${branchCommits.length} commits`);
                                                branchCommits.forEach(commit => {
                                                    if (!allCommits.find(c => c.sha === commit.sha)) {
                                                        allCommits.push({
                                                            ...commit,
                                                            repoName: upstreamName.split('/').pop(),
                                                            repoFullName: upstreamName
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    } catch (branchErr) {
                                        // Continue
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn(`  ✗ ${repo.name}:`, err.message);
            }
        }

        console.log(`\n TOTAL COMMITS COLLECTED: ${allCommits.length}`);

        // Sort by date
        allCommits.sort((a, b) => new Date(b.commit.author.date) - new Date(a.commit.author.date));

        // Diagnostic output
        const today = getLocalDateKey(new Date().toISOString());
        const todayCommits = allCommits.filter(c => getLocalDateKey(c.commit.author.date) === today);

        console.log(`\n TODAY IS: ${today}`);
        console.log(` Commits found today: ${todayCommits.length}`);

        if (todayCommits.length > 0) {
            console.log(' TODAY\'S COMMITS:');
            todayCommits.forEach((c, i) => {
                const time = new Date(c.commit.author.date).toLocaleTimeString();
                console.log(`  ${i+1}. [${time}] ${c.repoFullName}`);
                console.log(`     ${c.commit.message.split('\n')[0]}`);
            });
        } else {
            console.log('\n NO COMMITS TODAY. 10 most recent:');
            allCommits.slice(0, 10).forEach((c, i) => {
                const date = getLocalDateKey(c.commit.author.date);
                const time = new Date(c.commit.author.date).toLocaleTimeString();
                console.log(`  ${i+1}. ${date} ${time} - ${c.repoFullName}`);
                console.log(`     ${c.commit.message.split('\n')[0].substring(0, 70)}`);
            });
        }

        const latestCommits = allCommits.slice(0, 5);
        container.innerHTML = "";

        if (latestCommits.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem;">No recent commits found.</div>';
            return;
        }

        latestCommits.forEach((commit, index) => {
            const commitDate = new Date(commit.commit.author.date);
            const timeAgo = getTimeAgo(commitDate);
            const message = commit.commit.message.split('\n')[0].substring(0, 100);
            const sha = commit.sha.substring(0, 7);
            const commitUrl = commit.html_url || `https://github.com/${commit.repoFullName}/commit/${commit.sha}`;
            const displayRepoName = commit.repoFullName || commit.repoName;
            const isContribution = commit.repoFullName && !commit.repoFullName.startsWith(USERNAME);

            const commitItem = document.createElement("a");
            commitItem.className = "commit-item";
            commitItem.href = commitUrl;
            commitItem.target = "_blank";
            commitItem.rel = "noopener noreferrer";
            commitItem.style.opacity = "0";
            commitItem.style.transform = "translateY(20px)";
            commitItem.innerHTML = `
                <div class="commit-icon">
                    <i class="fas fa-code-branch"></i>
                </div>
                <div class="commit-details">
                    <div class="commit-message">${message}</div>
                    <div class="commit-meta">
                        <div class="commit-meta-item">
                            <i class="fas fa-book"></i>
                            <span>${displayRepoName}</span>
                            ${isContribution ? '<span style="margin-left: 0.5rem; padding: 0.2rem 0.5rem; background: rgba(0, 255, 136, 0.2); border-radius: 10px; font-size: 0.75rem;">Contribution</span>' : ''}
                        </div>
                        <div class="commit-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${timeAgo}</span>
                        </div>
                    </div>
                </div>
                <div class="commit-sha">${sha}</div>
            `;

            container.appendChild(commitItem);

            setTimeout(() => {
                commitItem.style.transition = "all 0.6s ease";
                commitItem.style.opacity = "1";
                commitItem.style.transform = "translateY(0)";
            }, index * 100);
        });

        console.log(' Commits displayed\n');

    } catch (err) {
        console.error(' Failed to fetch commits:', err);
        container.innerHTML = '<div style="text-align: center; padding: 2rem;">Failed to load commits.</div>';
    }
}

// ================================
// CONTRIBUTION GRAPH
// ================================

async function generateContributionGraph() {
    const graph = document.getElementById("contributionGraph");
    if (!graph) return;

    graph.innerHTML = '<div style="text-align: center; padding: 2rem; grid-column: 1/-1;">Loading...</div>';

    try {
        const cacheBuster = Date.now();
        const commitsByDate = {};
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const repoRes = await fetchWithAuth(`https://api.github.com/users/${USERNAME}/repos?per_page=100&_=${cacheBuster}`);
        const repos = await repoRes.json();

        console.log(' Building contribution graph...');

        for (const repo of repos) {
            try {
                const commitsRes = await fetchWithAuth(
                    `https://api.github.com/repos/${repo.full_name}/commits?author=${USERNAME}&since=${oneYearAgo.toISOString()}&per_page=100&_=${cacheBuster}`
                );

                if (commitsRes.ok) {
                    const commits = await commitsRes.json();
                    commits.forEach(commit => {
                        if (commit.commit && commit.commit.author) {
                            const dateKey = getLocalDateKey(commit.commit.author.date);
                            commitsByDate[dateKey] = (commitsByDate[dateKey] || 0) + 1;
                        }
                    });
                }

                // If fork, also check all branches
                if (repo.fork) {
                    const branchesRes = await fetchWithAuth(
                        `https://api.github.com/repos/${repo.full_name}/branches?per_page=100&_=${cacheBuster}`
                    );

                    if (branchesRes.ok) {
                        const branches = await branchesRes.json();

                        for (const branch of branches) {
                            try {
                                const branchCommitsRes = await fetchWithAuth(
                                    `https://api.github.com/repos/${repo.full_name}/commits?sha=${branch.name}&author=${USERNAME}&since=${oneYearAgo.toISOString()}&per_page=100&_=${cacheBuster}`
                                );

                                if (branchCommitsRes.ok) {
                                    const branchCommits = await branchCommitsRes.json();
                                    branchCommits.forEach(commit => {
                                        if (commit.commit && commit.commit.author) {
                                            const dateKey = getLocalDateKey(commit.commit.author.date);
                                            commitsByDate[dateKey] = (commitsByDate[dateKey] || 0) + 1;
                                        }
                                    });
                                }
                            } catch (err) {
                                // Continue
                            }
                        }
                    }
                }
            } catch (err) {
                // Continue
            }
        }

        const today = getLocalDateKey(new Date().toISOString());
        console.log(`  Today (${today}): ${commitsByDate[today] || 0} commits in graph`);

        const monthsContainer = document.querySelector('.contribution-months');
        if (monthsContainer) {
            monthsContainer.innerHTML = '<span></span>';
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const todayDate = new Date();
            for (let i = 0; i < 12; i++) {
                const monthDate = new Date(todayDate);
                monthDate.setMonth(todayDate.getMonth() - (11 - i));
                const monthSpan = document.createElement('span');
                monthSpan.textContent = months[monthDate.getMonth()];
                monthsContainer.appendChild(monthSpan);
            }
        }

        graph.innerHTML = "";

        const todayDate = new Date();
        todayDate.setHours(23, 59, 59, 999);
        const startDate = new Date(todayDate);
        startDate.setDate(todayDate.getDate() - 364);
        startDate.setHours(0, 0, 0, 0);

        const dayOfWeek = startDate.getDay();
        if (dayOfWeek !== 0) {
            startDate.setDate(startDate.getDate() - dayOfWeek);
        }

        const totalDays = 371;

        for (let i = 0; i < totalDays; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateKey = getLocalDateKey(date.toISOString());
            const commitCount = commitsByDate[dateKey] || 0;

            let level = 0;
            if (commitCount > 0) level = 1;
            if (commitCount >= 3) level = 2;
            if (commitCount >= 5) level = 3;
            if (commitCount >= 8) level = 4;

            const cell = document.createElement("div");
            cell.className = `contribution-day${level ? ` level-${level}` : ""}`;
            cell.title = `${dateKey}: ${commitCount} commit${commitCount !== 1 ? 's' : ''}`;
            cell.style.cursor = commitCount > 0 ? 'pointer' : 'default';

            if (commitCount > 0) {
                cell.onclick = () => {
                    window.open(`https://github.com/${USERNAME}?tab=overview&from=${dateKey}&to=${dateKey}`, '_blank');
                };
            }

            graph.appendChild(cell);
        }

        console.log(' Contribution graph generated');

    } catch (err) {
        console.error(' Failed to generate graph:', err);
        graph.innerHTML = '<div style="text-align: center; padding: 2rem; grid-column: 1/-1;">Failed to load</div>';
    }
}

// ================================
// ACTIVITY CHART
// ================================

function createActivityChart(prsOpened, prsMerged) {
    const canvas = document.getElementById('activityChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const cacheBuster = Date.now();

    fetchWithAuth(`https://api.github.com/search/issues?q=author:${USERNAME}+type:issue&_=${cacheBuster}`)
        .then(async res => {
            let issuesCount = 0;
            if (res.ok) {
                const issuesData = await res.json();
                issuesCount = issuesData.total_count || 0;
            }

            const codeReviewPercentage = prsMerged > 0 ? Math.round((prsMerged / prsOpened) * 100) : 19;

            updateElement("statCommits", "50%");
            updateElement("statCodeReview", codeReviewPercentage + "%");
            updateElement("statPRs", Math.round((prsOpened / (prsOpened + issuesCount + 1)) * 100) + "%");
            updateElement("statIssues", issuesCount > 0 ? Math.round((issuesCount / (prsOpened + issuesCount + 1)) * 100) + "%" : "3%");

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['', '', '', '', '', ''],
                    datasets: [{
                        label: 'Commits',
                        data: [0, 40, 60, 50, 55, 50],
                        backgroundColor: 'rgba(0, 255, 136, 0.2)',
                        borderColor: 'rgba(0, 255, 136, 1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Code Review',
                        data: [0, 10, 15, 19, 18, 19],
                        backgroundColor: 'rgba(147, 51, 234, 0.2)',
                        borderColor: 'rgba(147, 51, 234, 1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Pull Requests',
                        data: [0, 20, 25, 28, 26, 28],
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Issues',
                        data: [0, 2, 3, 3, 2, 3],
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(0, 255, 136, 0.5)',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        y: { beginAtZero: true, display: false, grid: { display: false } },
                        x: { display: false, grid: { display: false } }
                    }
                }
            });
        })
        .catch(err => {
            console.warn('Failed to fetch issues for chart', err);
            updateElement("statCommits", "50%");
            updateElement("statCodeReview", "19%");
            updateElement("statPRs", "28%");
            updateElement("statIssues", "3%");
        });
}

// ================================
// INITIALIZE
// ================================

document.addEventListener("DOMContentLoaded", () => {
    console.log(' GitHub Dashboard Initializing (Secure Mode)...');
    loadGitHub();

    const refreshBtn = document.getElementById('refreshCommits');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            console.log('\n Refreshing...');
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i><span>Refreshing...</span>';

            try {
                const cacheBuster = Date.now();
                const repoRes = await fetchWithAuth(`https://api.github.com/users/${USERNAME}/repos?per_page=100&_=${cacheBuster}`);
                const repos = await repoRes.json();
                await fetchLatestCommits(repos);
                await generateContributionGraph();

                refreshBtn.innerHTML = '<i class="fas fa-check"></i><span>Updated!</span>';
                setTimeout(() => {
                    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i><span>Refresh</span>';
                    refreshBtn.disabled = false;
                }, 2000);
            } catch (err) {
                console.error('Refresh failed:', err);
                refreshBtn.innerHTML = '<i class="fas fa-times"></i><span>Failed</span>';
                setTimeout(() => {
                    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i><span>Refresh</span>';
                    refreshBtn.disabled = false;
                }, 2000);
            }
        });
    }
});

