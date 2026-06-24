# Manual / User-Only Tasks — unified-tracking

> The ONE place for everything only you (the human) can do. Fixed path: `docs/MANUAL-TASKS.md`.
> Global spec: `~/.claude/rules/manual-tasks.md`. Last updated: 2026-06-24

This package is feature-complete at the web/JS delivery layer (the shipped `3.3.0` npm path).
The agent finished its automatable work (docs site + finalization scaffolding). The rows below
are the steps only you can do — each needs a registry/deploy action, a native toolchain, a real
device, or your accounts/DNS.

## ⏳ Pending manual tasks

| #   | Task                                                              | Why only you                                                                                         | Detailed runbook                                                                                                                                                                                                                                | Status        |
| --- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | Build-verify native iOS SDK bridges                               | Needs Xcode + CocoaPods/SPM + an iOS simulator/device — no native toolchain in the agent environment | `cd ios && pod install && xcodebuild -workspace Plugin.xcworkspace -scheme Plugin` (or SPM resolve); clear the `// NOTE(unverified)` markers as each file builds. Spec: `docs/features/polish-audit-release/round04-native-overview.md`         | ☐ Not started |
| 2   | Build-verify native Android SDK bridges                           | Needs Android Studio + Gradle + the vendor SDK deps — not available to the agent                     | `cd android && ./gradlew clean build test`. Spec: `docs/features/polish-audit-release/round04-native-overview.md`                                                                                                                               | ☐ Not started |
| 3   | Publish next version to npm                                       | `npm publish` is a registry action reserved for the owner; the agent never publishes                 | `yarn build && yarn lint && npm publish` (package.json `release`). Do NOT publish a native-containing version until tasks 1+2 pass; keep npm `latest` = `3.3.0` (web layer) until then                                                          | ☐ Not started |
| 4   | Create the docs Firebase project + deploy docs (Firebase Hosting) | Needs your Firebase account; deploy is owner-only                                                    | In the `unified-tracking-docs` repo: create Firebase project/site `unified-tracking-docs`, then `yarn build && npx -y firebase-tools@latest deploy --only hosting`. Config already written (`firebase.json` + `.firebaserc`)                    | ☐ Not started |
| 5   | Enable GitHub Pages + point the docs custom domain (DNS)          | Repo Settings -> Pages enablement + a DNS CNAME are owner-only                                       | In `unified-tracking-docs` repo Settings -> Pages: source = GitHub Actions (workflow `.github/workflows/deploy.yml` is committed). Add a DNS CNAME for `unified-tracking-docs.aoneahsan.com` -> the chosen host. `static/CNAME` already written | ☐ Not started |
| 6   | Submit the deployed docs site to search engines                   | Requires your Search Console / Bing Webmaster accounts                                               | After deploy: verify domain in Google Search Console + Bing Webmaster, submit `https://<docs-domain>/sitemap.xml`, request indexing for top pages. Playbook: `~/.claude/rules/seo-aeo-ranking.md`                                               | ☐ Not started |

## ✅ Completed manual tasks

(none yet — move rows here with the date once done)
