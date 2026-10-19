# PUBLISHER-ADMIN-GATE

## AUTHOR-ISLAND-EDITABILITY-001

This regression ID is mandatory for every Publisher-admin acceptance run and
is also enforced by `TINA-MIGRATION-GOLD.md` and `pnpm tina:fullcheck`.

For a real existing User document and its canonical `/author/<slug>/` route:

1. Authenticate to the live `/admin/` as the Publisher/Admin account.
2. Open the exact author route in visual editing and wait for concrete User
   fields. A visible preview with “form fields will appear here” is a failure.
3. Confirm the intended author form is the one primary form and that its island
   metadata contains a non-empty query, `variables.relativePath`, and User data.
4. Capture the exact original visible scalar value.
5. Add a unique temporary marker and save through the Tina UI.
6. Prove the authenticated Tina backend contains the marker.
7. Prove the cache-busted public author DOM contains the marker at its mapped
   selector.
8. Restore the exact original through the Tina UI.
9. Prove exact authenticated-backend restoration, public restoration, and
   marker absence.

The result is `PASS` only when all nine steps pass. Login, field discovery,
save, reflection, or restoration that is incomplete is `BLOCKED`; an empty
island query, empty variables, missing primary form, or wrong form is `FAIL`.