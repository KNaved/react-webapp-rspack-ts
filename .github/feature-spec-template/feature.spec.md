# Feature Spec Template (Markdown)

> **Purpose:** Provide the AI agent with information it cannot reliably infer from Figma alone.
> **Required sections:** Metadata
> **Conditional sections:** API Contract, Variant Conditions, Business Logic, Navigation Flow
> **Optional sections:** State Hints, Scope, Analytics
>
> **Instructions:** Fill in sections marked `[conditional]` or `[optional]` only if they apply to your feature. Delete unused sections.

---

## Metadata

> **Type:** page | component | enhancement | bug-fix
> **Figma:** {insert full Figma URL with node-id param}
> **Jira:** {insert ticket reference}

---

## API Contract

<!--
Delete this entire section if the feature is purely presentational (no data fetching).
For each API call, add a new ### block below.
api-id: Short identifier like action name, e.g. `verifyPanEkyc`, `fetchUserProfile`.
-->

### {api-id} — {METHOD} {endpoint}

**Request**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| | | | |

**Response — Success**

| Field | Type | Notes |
|-------|------|-------|
| | | |

**Response — Errors**

| Error Code | User-facing Message |
|------------|---------------------|
| | |

<!-- Repeat the ### block above for each additional API endpoint -->

---

## Variant Conditions

<!--
Delete this section if the component has only one state (no Figma variants).
This table maps every Figma variant to the runtime condition that triggers it.
Use exact Figma variant names as they appear in the Figma file.

Patterns:
- Loading/submitting states use isServiceLoading('serviceId')
- Error states check if error !== null
- Disabled states check if a process is in flight
- Stagger/overlay visibility uses boolean flags like showCIFStagger
-->

| Figma Variant | Condition Expression |
|---|---|
| | |

**Examples:**

| Variant | When it appears | Condition |
|---|---|---|
| Default | Form is ready for input | `true` |
| Submitting | API call in progress | `isServiceLoading('verifyPanEkyc')` |
| Error | API returned an error | `verifyEkycError !== null` |
| Disabled | Button should not be clickable | `isSubmitting \|\| !formIsValid` |
| CIFSelectionStagger | Bottom-sheet modal for selecting account | `showCIFStagger && isEtb && cifList.length > 1` |
| TncStagger | Bottom-sheet modal for T&C acceptance | `showTncStagger` |

**Common patterns:**
- **Loading states:** `isServiceLoading('serviceActionName')`
- **Error states:** `errorVariable !== null`
- **Disabled/readonly:** `isProcessing \|\| someCondition`
- **Overlays/staggers:** `showSomething && otherCondition` (boolean flag + context)

---

## Business Logic

### Validation Rules

<!--
Delete this section if no form fields need validation.
Use Yup-like rule names: required, min, max, matches, email, oneOf, custom
-->

| Field | Rule | Error Message |
|-------|------|---------------|
| | | |

**Examples:**
- Field: `panNumber` | Rule: `required` | Message: `"Please enter a valid PAN linked with your Aadhaar"`
- Field: `panNumber` | Rule: `matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)` | Message: `"Please enter a valid PAN linked with your Aadhaar"`
- Field: `aadhaarNumber` | Rule: `custom: length === 12 || length === 16` | Message: `"Enter a 12-digit Aadhaar or 16-digit Virtual ID"`
- Field: `mobileNumber` | Rule: `matches(/^[6-9]\d{9}$/)` | Message: `"Please enter your Aadhaar linked mobile number"`

---

### Conditional Field Behavior

<!--
Delete this section if no fields change visibility or editability based on state.
-->

| Field | Show When | Read-only When |
|-------|-----------|----------------|
| | | |

**Examples:**
- Field: `reasonForChange` | Show When: `changeType === 'correction'` | Read-only When: —
- Field: `aadhaarVirtualId` | Show When: always | Read-only When: `isVerified`
- Field: `tncCheckbox` | Show When: always | Read-only When: `isSubmitting`

> **Note:** This table is for **form fields** only — inputs, checkboxes, selects.
> Staggers and overlays (e.g. `TncStagger`, `SelectCIFStagger`) are UI components, not form fields.
> Their visibility belongs in **Variant Conditions**: e.g. `TncStagger: "showTncStagger"`.

---

### Business Rules

<!--
Delete this section if no additional rules.
List any business logic that doesn't fit in the tables above.
-->

- Rule 1
- Rule 2
- Rule 3

**Examples:**
- "Clearing the primary input resets any dependent downstream fields"
- "Users can only edit records created by themselves"
- "Consent checkbox must be accepted before the submit button activates"

---

## Navigation Flow

<!--
Delete this section if this is not a new page.
For page enhancements, omit this section.
-->

**Entry Point**

| Property | Value |
|----------|-------|
| Route | {key from APP_ROUTES} |
| Params | {comma-separated, e.g. `customerId`} |
| Guard | {optional condition, e.g. `isAuthenticated && hasEditPerm`} |

**Exit Routes**

| Event | Destination |
|-------|-------------|
| | |

**Examples:**
- Event: `onSuccess` | Destination: `PROFILE_SUMMARY`
- Event: `onCancel` | Destination: `BACK`
- Event: `onError` | Destination: `stay` (remains on page)
- Event: `onVerified_NTB` | Destination: `NEXT_JOURNEY_STEP`
- Event: `onVerified_ETB_single` | Destination: `NEXT_JOURNEY_STEP`

---

## State Hints

<!--
Optional section. Leave blank if unsure.
Helps prevent the agent from creating duplicate Redux slices/selectors.
The agent auto-discovers these via codebase search if not specified.
-->

| Property | Value |
|----------|-------|
| Redux Domain | {e.g. `Application`, `Auth`, `Product`} |
| Reuse Selectors | {comma-separated selector names, e.g. `getApplicationIdSelector, getMobileNumberSelector`} |
| Reuse Services | {comma-separated service IDs, e.g. `verifyPanEKYCServiceAction`} |

---

## Scope

### Exclude

<!--
Optional. List features visible in the Figma frame that are deliberately out of scope for this ticket.
Prevents the agent from implementing adjacent features by mistake.
-->

- Excluded feature 1
- Excluded feature 2

### Feature Flags

<!--
Optional. List any feature flags that should gate this feature.
Agent will add conditional rendering with these flags.
-->

- `FLAG_NAME_1`
- `FLAG_NAME_2`

### Permissions

<!--
Optional. List any role or permission checks needed.
Agent will add route guards or conditional renders.
-->

- `PERMISSION_NAME_1`
- `PERMISSION_NAME_2`

---

## Analytics

<!--
Optional. Delete this section if no tracking events are required.
List all tracking events the feature should emit.
-->

| Event Name | Trigger | Properties |
|---|---|---|
| | | |

**Examples:**
- Event: `EKYC_SUBMITTED` | Trigger: `verify button click` | Properties: `inputType (AADHAAR/VID), hasPanPrefilled (bool)`
- Event: `OTP_VERIFIED` | Trigger: `OTP submit success` | Properties: `isEtb (bool), cifCount (int)`
