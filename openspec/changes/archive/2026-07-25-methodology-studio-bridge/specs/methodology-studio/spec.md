## ADDED Requirements

### Requirement: Studio client uses local bridge when available

When the Studio page is served from the same origin as `sdm studio serve`, the Studio SHALL detect the bridge (`GET /bridge/status` or equivalent) and SHALL be able to load the current view from `GET /bridge/view` and submit emitted actions via `POST /bridge/action` in addition to on-page JSON display. When the bridge is unavailable (e.g. `file://` or static server without API), the Studio MUST keep fixture/file-picker load and download/copy action fallbacks. Bridge usage MUST NOT cause methodology YAML writes from the browser.

#### Scenario: Confirm posts to bridge under serve

- **WHEN** Studio is open via `studio serve` with a loaded plan and the author clicks **Подтвердить план**
- **THEN** the action is POSTed to `/bridge/action` (and still shown on-page)

#### Scenario: Offline fallback without bridge

- **WHEN** Studio is opened without a bridge API
- **THEN** the author can still load the demo fixture and download an action JSON file
