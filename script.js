const API_BASE_URL = "https://api.github.com/users";
const LOCAL_USER_DATABASE = {
    octocat: {
        login: "octocat",
        name: "The Octocat",
        bio: "GitHub mascot and demo developer profile.",
        created_at: "2011-01-25T18:44:36Z",
        blog: "https://github.blog",
        html_url: "https://github.com/octocat",
        avatar_url: createDemoAvatar("O", "#38bdf8"),
        repositories: [
            createLocalRepo("Hello-World", "octocat", "2026-05-15T10:00:00Z", 3210),
            createLocalRepo("Spoon-Knife", "octocat", "2026-04-21T09:20:00Z", 12680),
            createLocalRepo("git-consortium", "octocat", "2026-03-12T14:05:00Z", 420),
            createLocalRepo("octo-demo-api", "octocat", "2026-02-03T11:45:00Z", 77),
            createLocalRepo("dev-detective-fixtures", "octocat", "2026-01-14T08:15:00Z", 52)
        ]
    },
    torvalds: {
        login: "torvalds",
        name: "Linus Torvalds",
        bio: "Software engineer known for Linux and Git.",
        created_at: "2011-09-03T15:26:22Z",
        blog: "https://github.com/torvalds",
        html_url: "https://github.com/torvalds",
        avatar_url: createDemoAvatar("L", "#22c55e"),
        repositories: [
            createLocalRepo("linux", "torvalds", "2026-05-18T12:00:00Z", 188000),
            createLocalRepo("uemacs", "torvalds", "2026-02-22T10:00:00Z", 1900),
            createLocalRepo("subsurface-for-dirk", "torvalds", "2025-12-11T17:30:00Z", 850),
            createLocalRepo("test-tlb", "torvalds", "2025-10-03T09:15:00Z", 410),
            createLocalRepo("pesconvert", "torvalds", "2025-08-19T07:45:00Z", 95)
        ]
    },
    gaearon: {
        login: "gaearon",
        name: "Dan Abramov",
        bio: "Working on UI engineering and JavaScript education.",
        created_at: "2011-06-02T18:39:44Z",
        blog: "https://overreacted.io",
        html_url: "https://github.com/gaearon",
        avatar_url: createDemoAvatar("D", "#f59e0b"),
        repositories: [
            createLocalRepo("overreacted.io", "gaearon", "2026-05-11T18:10:00Z", 7700),
            createLocalRepo("redux-devtools", "gaearon", "2026-03-30T13:20:00Z", 13400),
            createLocalRepo("react-hot-loader", "gaearon", "2026-01-26T16:45:00Z", 12400),
            createLocalRepo("just-javascript", "gaearon", "2025-11-07T09:00:00Z", 2400),
            createLocalRepo("use-deep-compare-effect", "gaearon", "2025-09-12T12:35:00Z", 1600)
        ]
    },
    anmol: {
        login: "anmol",
        name: "Anmol",
        bio: "Associate Software Engineer building client-side API integrations.",
        created_at: "2026-05-01T09:00:00Z",
        blog: "https://prodeskit.com",
        html_url: "https://github.com/anmol",
        avatar_url: createDemoAvatar("A", "#8b5cf6"),
        repositories: [
            createLocalRepo("dev-detective", "anmol", "2026-05-29T08:30:00Z", 42),
            createLocalRepo("async-js-practice", "anmol", "2026-05-25T11:00:00Z", 25),
            createLocalRepo("github-search-client", "anmol", "2026-05-19T14:20:00Z", 31),
            createLocalRepo("dom-rendering-lab", "anmol", "2026-05-10T12:00:00Z", 18),
            createLocalRepo("fetch-api-notes", "anmol", "2026-05-04T16:15:00Z", 12)
        ]
    },
    "prodesk-dev": {
        login: "prodesk-dev",
        name: "Prodesk Dev",
        bio: "Demo engineering account for sprint submissions and QA practice.",
        created_at: "2024-08-12T10:30:00Z",
        blog: "https://prodeskit.com",
        html_url: "https://github.com/prodesk-dev",
        avatar_url: createDemoAvatar("P", "#0284c7"),
        repositories: [
            createLocalRepo("frontend-foundation", "prodesk-dev", "2026-05-27T10:00:00Z", 64),
            createLocalRepo("api-sprint-kit", "prodesk-dev", "2026-05-22T12:30:00Z", 91),
            createLocalRepo("qa-demo-portal", "prodesk-dev", "2026-05-16T09:45:00Z", 44),
            createLocalRepo("async-await-workshop", "prodesk-dev", "2026-05-09T13:10:00Z", 73),
            createLocalRepo("json-render-lab", "prodesk-dev", "2026-04-30T15:25:00Z", 38)
        ]
    }
};

const searchForm = document.getElementById("searchForm");
const usernameInput = document.getElementById("usernameInput");
const secondUsernameInput = document.getElementById("secondUsernameInput");
const battleToggle = document.getElementById("battleToggle");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const results = document.getElementById("results");

battleToggle.addEventListener("change", () => {
    const battleMode = battleToggle.checked;

    searchForm.classList.toggle("battle", battleMode);
    secondUsernameInput.classList.toggle("hidden", !battleMode);
    secondUsernameInput.required = battleMode;
    clearState();
});

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstUsername = parseGithubUsername(usernameInput.value);
    const secondUsername = parseGithubUsername(secondUsernameInput.value);

    if (!firstUsername || (battleToggle.checked && !secondUsername)) {
        showError("Please enter the required GitHub username or profile URL.");
        return;
    }

    if (battleToggle.checked) {
        await runBattleMode(firstUsername, secondUsername);
        return;
    }

    await runSingleSearch(firstUsername);
});

async function runSingleSearch(username) {
    setLoading(true);
    clearState();

    try {
        const profile = await fetchProfileWithRepos(username);
        results.className = "results";
        results.innerHTML = createProfileCard(profile);
        results.classList.remove("hidden");
    } catch (err) {
        showError(err.message);
    } finally {
        setLoading(false);
    }
}

async function runBattleMode(firstUsername, secondUsername) {
    setLoading(true);
    clearState();

    try {
        const profiles = await Promise.all([
            fetchProfileWithRepos(firstUsername),
            fetchProfileWithRepos(secondUsername)
        ]);
        const [firstProfile, secondProfile] = profiles;
        const firstStars = calculateTotalStars(firstProfile.repositories);
        const secondStars = calculateTotalStars(secondProfile.repositories);

        firstProfile.totalStars = firstStars;
        secondProfile.totalStars = secondStars;

        const firstResult = getBattleResult(firstStars, secondStars);
        const secondResult = getBattleResult(secondStars, firstStars);

        results.className = "results battle-grid";
        results.innerHTML = [
            createProfileCard(firstProfile, firstResult),
            createProfileCard(secondProfile, secondResult)
        ].join("");
        results.classList.remove("hidden");
    } catch (err) {
        showError(err.message);
    } finally {
        setLoading(false);
    }
}

async function fetchProfileWithRepos(username) {
    try {
        return await fetchGithubProfileWithRepos(username);
    } catch (err) {
        const localProfile = getLocalProfile(username);

        if (localProfile) {
            return localProfile;
        }

        throw err;
    }
}

async function fetchGithubProfileWithRepos(username) {
    const userResponse = await fetch(`${API_BASE_URL}/${encodeURIComponent(username)}`);

    if (userResponse.status === 404) {
        throw new Error(`User Not Found: ${username}`);
    }

    if (!userResponse.ok) {
        throw new Error(`GitHub API error: ${userResponse.status}`);
    }

    const user = await userResponse.json();
    const reposResponse = await fetch(`${user.repos_url}?sort=updated&per_page=100`);

    if (!reposResponse.ok) {
        throw new Error(`Could not load repositories for ${user.login}.`);
    }

    const repositories = await reposResponse.json();
    const latestRepositories = repositories.slice(0, 5);

    return {
        ...user,
        repositories,
        latestRepositories,
        dataSource: "GitHub REST API"
    };
}

function getLocalProfile(username) {
    const profile = LOCAL_USER_DATABASE[username.toLowerCase()];

    if (!profile) {
        return null;
    }

    const repositories = profile.repositories.map((repo) => ({ ...repo }));

    return {
        ...profile,
        repositories,
        latestRepositories: repositories.slice(0, 5),
        dataSource: "Local Demo Database"
    };
}

function createLocalRepo(name, owner, updatedAt, stars) {
    return {
        name,
        html_url: `https://github.com/${owner}/${name}`,
        updated_at: updatedAt,
        stargazers_count: stars
    };
}

function createDemoAvatar(initial, backgroundColor) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
            <rect width="240" height="240" rx="120" fill="${backgroundColor}"/>
            <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="112" font-weight="700">${initial}</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function parseGithubUsername(value) {
    const input = value.trim().replace(/^@/, "");

    if (!input) {
        return "";
    }

    if (input.includes("github.com")) {
        try {
            const url = new URL(input.startsWith("http") ? input : `https://${input}`);
            return url.pathname.split("/").filter(Boolean)[0] || "";
        } catch (err) {
            return input.split("/").filter(Boolean).pop() || "";
        }
    }

    return input.split(/[/?#]/)[0];
}

function createProfileCard(profile, battleResult = "") {
    const cardClass = battleResult ? `profile-card ${battleResult}` : "profile-card";
    const badge = battleResult ? `<span class="battle-badge">${getBattleLabel(battleResult)}</span>` : "";
    const portfolioUrl = profile.blog ? escapeHtml(normalizeUrl(profile.blog)) : "";
    const profileUrl = escapeHtml(profile.html_url);
    const portfolio = profile.blog
        ? `<a href="${portfolioUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(profile.blog)}</a>`
        : "Not Available";
    const totalStars = typeof profile.totalStars === "number"
        ? `<div class="meta-item">
                <span class="meta-label">Total Stars</span>
                <span class="meta-value">${profile.totalStars}</span>
            </div>`
        : "";
    const source = profile.dataSource
        ? `<div class="meta-item">
                <span class="meta-label">Source</span>
                <span class="meta-value">${escapeHtml(profile.dataSource)}</span>
            </div>`
        : "";

    return `
        <article class="${cardClass}">
            ${badge}
            <div class="profile-top">
                <img class="avatar" src="${escapeHtml(profile.avatar_url)}" alt="${escapeHtml(profile.login)} avatar">
                <div class="profile-info">
                    <h2>${escapeHtml(profile.name || profile.login)}</h2>
                    <a class="username" href="${profileUrl}" target="_blank" rel="noopener noreferrer">@${escapeHtml(profile.login)}</a>
                    <p class="bio">${escapeHtml(profile.bio || "No bio available.")}</p>
                </div>
            </div>

            <div class="meta-grid">
                <div class="meta-item">
                    <span class="meta-label">Joined</span>
                    <span class="meta-value">${formatDate(profile.created_at)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Portfolio</span>
                    <span class="meta-value">${portfolio}</span>
                </div>
                ${source}
                ${totalStars}
            </div>

            <div class="repo-section">
                <h3>Top 5 Latest Repositories</h3>
                ${createRepoList(profile.latestRepositories)}
            </div>
        </article>
    `;
}

function createRepoList(repositories) {
    if (!repositories.length) {
        return `<p class="bio">No public repositories found.</p>`;
    }

    const repoItems = repositories.map((repo) => `
        <li>
            <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">
                <span>${escapeHtml(repo.name)}</span>
                <span class="repo-date">${formatDate(repo.updated_at)}</span>
            </a>
        </li>
    `).join("");

    return `<ul class="repo-list">${repoItems}</ul>`;
}

function calculateTotalStars(repositories) {
    return repositories.reduce((total, repo) => total + repo.stargazers_count, 0);
}

function getBattleResult(currentStars, opponentStars) {
    if (currentStars === opponentStars) {
        return "tie";
    }

    return currentStars > opponentStars ? "winner" : "loser";
}

function getBattleLabel(result) {
    if (result === "winner") {
        return "Winner";
    }

    if (result === "loser") {
        return "Loser";
    }

    return "Tie";
}

function formatDate(dateValue) {
    const date = new Date(dateValue);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function normalizeUrl(url) {
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    return `https://${url}`;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

function setLoading(isLoading) {
    loading.classList.toggle("hidden", !isLoading);
}

function showError(message) {
    error.textContent = message || "Something went wrong. Please try again.";
    error.classList.remove("hidden");
    results.classList.add("hidden");
    results.innerHTML = "";
}

function clearState() {
    error.classList.add("hidden");
    error.textContent = "";
    results.classList.add("hidden");
    results.innerHTML = "";
}
