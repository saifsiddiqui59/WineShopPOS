# V4 Environment Links

Environment identification is hostname-driven.

Immediate Azure Front Door names:

- PROD:  https://wsp-prod-d66ca1d443.azurefd.net
- QA:    https://wsp-qa-d66ca1d443.azurefd.net
- DEMO:  https://wsp-demo-d66ca1d443.azurefd.net
- ADMIN: https://wsp-admin-d66ca1d443.azurefd.net

Routing:

- PROD -> existing production static website
- QA -> isolated V4 DEV static website
- DEMO -> isolated V4 DEV static website; demo account is forced into browser-only Demo Workspace
- ADMIN -> isolated V4 DEV static website; platform admin lands on Platform Control

Future custom domain names are supported by the same code:

- app.<domain>
- qa.<domain>
- demo.<domain>
- admin.<domain>

Demo credentials are build-time public values:

- VITE_DEMO_EMAIL
- VITE_DEMO_PASSWORD

Do not put any privileged/service-role credential in these variables.
The demo password is intentionally public and must belong only to a locked-down DEMO account.
