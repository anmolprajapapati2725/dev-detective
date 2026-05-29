# Sprint 03 Prompts

## Dev-Detective API Integration

Prompt used:

> Build the Dev-Detective GitHub Search Client using native fetch, async/await, JSON parsing, loading state, 404 fallback, top 5 latest repositories, readable date formatting, and a Battle Mode that compares two users with Promise.all and total repository stars.

Key concepts reviewed:

- Native `fetch()` returns a Promise that resolves to a `Response`.
- `await response.json()` parses the JSON response body into a JavaScript object.
- `try/catch/finally` keeps loading, success, and error UI states predictable.
- `Promise.all()` runs both Battle Mode requests together and waits until both finish.
- `reduce()` calculates total repository stars from `stargazers_count`.
- A small in-code fallback database lets known demo usernames render during API rate limits or offline testing while keeping the GitHub REST API as the primary data source.
- The search handler accepts real GitHub usernames, `@username`, and full GitHub profile URLs by extracting the username before calling the API.
