# Manual Tasks — unified-tracking

**Last updated:** 2026-10-20

The web and Capacitor WebView package path is published as `3.3.2`. No package release is pending from
this maintenance pass.

Native SDK delivery remains blocked until the shipped Swift and Android sources are built and exercised on
suitable toolchains and devices. Do not publish a release that claims native provider delivery until both
`yarn verify:ios` and `yarn verify:android` pass and the `NOTE(unverified)` markers are reconciled.
