/* ================================
   GITHUB API INTEGRATION — LIGHTWEIGHT
   Calls GitHub's public REST API directly (no server/proxy needed).
   Kept deliberately light on requests to stay well under GitHub's
   60 requests/hour unauthenticated rate limit.
   ================================ */

const USERNAME = 'smita1078';

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
        element.style.animation = 'fadeIn 0.5s ease-in';
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
}

async function ghFetch(url) {
    const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
    if (!res.ok) {
        const err = new Error(`GitHub API ${res.status}`);
        err.status = res.status;
        throw err;
    }
    return res.json();
}

function showError(message, isRateLimit) {
    const container = document.getElementById('latestCommits');
    if (container) {
        container.innerHTML = `
            <div style="background: rgba(255, 0, 0, 0.08); border: 1px solid rgba(255, 0, 0, 0.25); padding: 2rem; border-radius: 8px; text-align: center; color: #ff6b6b;">
                <h4 style="margin-bottom: 1rem;">⚠️ ${isRateLimit ? 'GitHub API Rate Limit Reached' : 'Failed to Load GitHub Data'}</h4>
                <p style="margin-bottom: 1rem;">${isRateLimit ? 'GitHub limits unauthenticated requests to 60/hour. Please try again shortly.' : message}</p>
                <a href="https://github.com/${USERNAME}" target="_blank" style="color: var(--accent);">View profile on GitHub directly →</a>
            </div>
        `;
    }
    ['ghRepos', 'ghPROpen', 'ghPRMerged', 'ghPRClosed'].forEach((id) => updateElement(id, 'N/A'));
}

// ================================
// STATS (4 lightweight calls total)
// ================================

async function loadStats() {
    try {
        const [user, prOpened, prMerged, prClosedRaw] = await Promise.all([
            ghFetch(`https://api.github.com/users/${USERNAME}`),
            ghFetch(`https://api.github.com/search/issues?q=author:${USERNAME}+type:pr`),
            ghFetch(`https://api.github.com/search/issues?q=author:${USERNAME}+type:pr+is:merged`),
            ghFetch(`https://api.github.com/search/issues?q=author:${USERNAME}+type:pr+is:closed`),
        ]);

        updateElement('ghRepos', user.public_repos);

        const openedCount = prOpened.total_count || 0;
        const mergedCount = prMerged.total_count || 0;
        const closedCount = Math.max((prClosedRaw.total_count || 0) - mergedCount, 0);

        updateElement('ghPROpen', openedCount);
        updateElement('ghPRMerged', mergedCount);
        updateElement('ghPRClosed', closedCount);

        return { openedCount, mergedCount };
    } catch (err) {
        console.error('GitHub stats error:', err);
        showError(err.message, err.status === 403);
        return { openedCount: 0, mergedCount: 0 };
    }
}

// ================================
// LATEST COMMITS (checks top 6 most-recently-pushed repos only)
// ================================

async function loadLatestCommits() {
    const container = document.getElementById('latestCommits');
    if (!container) return;

    try {
        const repos = await ghFetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`);
        const topRepos = repos.slice(0, 6);

        const results = await Promise.all(
            topRepos.map((repo) =>
                fetch(`https://api.github.com/repos/${repo.full_name}/commits?author=${USERNAME}&per_page=3`, {
                    headers: { 'Accept': 'application/vnd.github+json' }
                })
                    .then((r) => (r.ok ? r.json() : []))
                    .then((commits) => commits.map((c) => ({ ...c, repoName: repo.name, repoFullName: repo.full_name })))
                    .catch(() => [])
            )
        );

        let allCommits = results.flat();
        allCommits.sort((a, b) => new Date(b.commit.author.date) - new Date(a.commit.author.date));
        const latestCommits = allCommits.slice(0, 5);

        container.innerHTML = '';

        if (latestCommits.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-dim);">No recent commits found.</div>';
            return;
        }

        latestCommits.forEach((commit, index) => {
            const commitDate = new Date(commit.commit.author.date);
            const timeAgo = getTimeAgo(commitDate);
            const message = commit.commit.message.split('\n')[0].substring(0, 100);
            const sha = commit.sha.substring(0, 7);
            const commitUrl = commit.html_url || `https://github.com/${commit.repoFullName}/commit/${commit.sha}`;

            const commitItem = document.createElement('a');
            commitItem.className = 'commit-item';
            commitItem.href = commitUrl;
            commitItem.target = '_blank';
            commitItem.rel = 'noopener noreferrer';
            commitItem.style.opacity = '0';
            commitItem.style.transform = 'translateY(20px)';
            commitItem.innerHTML = `
                <div class="commit-icon"><i class="fas fa-code-branch"></i></div>
                <div class="commit-details">
                    <div class="commit-message">${message}</div>
                    <div class="commit-meta">
                        <div class="commit-meta-item"><i class="fas fa-book"></i><span>${commit.repoFullName}</span></div>
                        <div class="commit-meta-item"><i class="fas fa-clock"></i><span>${timeAgo}</span></div>
                    </div>
                </div>
                <div class="commit-sha">${sha}</div>
            `;
            container.appendChild(commitItem);

            setTimeout(() => {
                commitItem.style.transition = 'all 0.6s ease';
                commitItem.style.opacity = '1';
                commitItem.style.transform = 'translateY(0)';
            }, index * 100);
        });
    } catch (err) {
        console.error('Failed to fetch commits:', err);
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-dim);">Could not load recent commits${err.status === 403 ? ' (rate limited — try again shortly)' : ''}.</div>`;
    }
}

// ================================
// CONTRIBUTION GRAPH & ACTIVITY — image-based, zero API calls
// ================================

function loadContributionGraph() {
    const graph = document.getElementById('contributionGraph');
    if (!graph) return;

    graph.innerHTML = `
        <img src="https://ghchart.rshah.org/00ff88/${USERNAME}"
             alt="${USERNAME} GitHub contribution chart"
             style="width:100%; height:auto; border-radius:6px;"
             loading="lazy"
             onerror="this.parentElement.innerHTML='<div style=\\'text-align:center;padding:2rem;color:var(--text-dim);\\'>Contribution chart unavailable right now.</div>'">
    `;

    const monthsContainer = document.querySelector('.contribution-months');
    if (monthsContainer) monthsContainer.style.display = 'none';

    const legend = document.querySelector('.graph-legend');
    if (legend) legend.style.display = 'none';
}

// ================================
// INIT
// ================================

async function loadGitHub() {
    await loadStats();
    loadLatestCommits();
    loadContributionGraph();
}

document.addEventListener('DOMContentLoaded', () => {
    loadGitHub();

    const refreshBtn = document.getElementById('refreshCommits');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i><span>Refreshing...</span>';
            try {
                await loadLatestCommits();
                refreshBtn.innerHTML = '<i class="fas fa-check"></i><span>Updated!</span>';
            } catch (err) {
                refreshBtn.innerHTML = '<i class="fas fa-times"></i><span>Failed</span>';
            }
            setTimeout(() => {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i><span>Refresh</span>';
                refreshBtn.disabled = false;
            }, 2000);
        });
    }
});
