# feature.spec.md Guide

This guide explains how to fill [feature.spec.md](feature.spec.md) so your AI implementation is accurate while keeping authoring easy for humans.

## Section-by-section filling guide

### 1) Metadata (always required)

Purpose:
- Identifies the feature and source frame.

Fill this header block:
```md
# Feature Spec: Add VID Support to eKYC Verification Form

> Type: enhancement
> Figma: https://www.figma.com/design/FILE_KEY/FileName?node-id=245-78
> Jira: PROJ-1142
```

Tips:
- Keep feature name implementation-oriented.

### 2) API Contract (fill if data call exists)

Purpose:
- Removes ambiguity in endpoint, payload, and response mapping.

Fill one `###` block per endpoint:
```md
### verifyPanEkyc — POST /applications/{applicationId}/pan-ekyc

**Request**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| panNumber | string | yes | 10-character PAN |
| aadhaarNumber | string | yes | 12-digit Aadhaar or 16-digit VID |
| mobileNumber | string | yes | Aadhaar-linked mobile |

**Response — Success**
| Field | Type | Notes |
|-------|------|-------|
| otpRefId | string | Reference ID for OTP verification |
| maskedMobile | string | e.g. ****7890 |

**Response — Errors**
| Error Code | User-facing Message |
|------------|---------------------|
| INVALID_PAN | Please enter a valid PAN linked with your Aadhaar |
| PAN_NOT_LINKED | Sorry, PAN not linked with Aadhaar |
| INVALID_AADHAAR | Please enter a valid Aadhaar |
```

If omitted:
- Agent may generate incorrect service models.

### 3) Variant Conditions (fill if multiple Figma states)

Purpose:
- Associates each visual state with runtime logic.

Fill table:
```md
| Figma Variant | Condition |
|---|---|
| Default | `true` |
| Submitting | `isServiceLoading('verifyPanEkyc')` |
| Error | `verifyEkycError !== null` |
| Disabled | `isSubmitting \|\| !formIsValid` |
| CIFSelectionStagger | `showCIFStagger && isEtb && cifList.length > 1` |
```

**Common patterns:**
- **Loading states:** `isServiceLoading('serviceActionName')`
- **Error states:** `errorVariable !== null`
- **Disabled/readonly:** `isProcessing \|\| someCondition`
- **Overlays/staggers:** `showSomething && otherCondition` (boolean flag + context)

If omitted:
- Agent can miss state-switch behavior.

### 4) Business Logic (fill for forms/rules)

Purpose:
- Captures non-visual constraints.

#### Validation Rules table
```md
| Field | Rule | Error Message |
|-------|------|---------------|
| panNumber | `required` | Please enter a valid PAN linked with your Aadhaar |
| panNumber | `matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)` | Please enter a valid PAN linked with your Aadhaar |
| aadhaarNumber | `required` | Please enter a valid Aadhaar |
| aadhaarNumber | `custom: length === 12 \|\| length === 16` | Enter a 12-digit Aadhaar or 16-digit Virtual ID |
| mobileNumber | `required` | Please enter your Aadhaar linked mobile number |
```

#### Conditional Field Behavior table
```md
| Field | Show When | Read-only When |
|-------|-----------|----------------|
| reasonForChange | `changeType === 'correction'` | — |
| aadhaarVirtualId | always | `isVerified` |
| tncCheckbox | always | `isSubmitting` |
```

> **Tip:** This table is for form fields only (inputs, checkboxes, selects).
> Staggers and overlays (e.g. `TncStagger`, `SelectCIFStagger`) are UI components, not form fields.
> Put their visibility in **Variant Conditions** instead: `TncStagger: "showTncStagger"`.

#### Business Rules bullets
```md
- Consent checkbox must be accepted before the submit button activates.
- Clearing the primary input resets any dependent downstream fields.
```

If omitted:
- Agent defaults to generic behavior and may miss key rules.

### 5) Navigation Flow (fill for page-level or flow changes)

Purpose:
- Ensures route wiring is exactly right.

Fill:
```md
**Entry Point**
| Property | Value |
|----------|-------|
| Route | EKYC |
| Params | applicationId |
| Guard | isAuthenticated && applicationId !== null |

**Exit Routes**
| Event | Destination |
|-------|-------------|
| onVerified | NEXT_JOURNEY_STEP |
| onBack | BACK |
```

If omitted:
- Agent may choose incorrect destination behavior.

### 6) State Hints (optional)

Purpose:
- Reuse existing Redux entities, avoid duplicates.

Fill:
```md
| Property | Value |
|----------|-------|
| Redux Domain | Application |
| Reuse Selectors | getApplicationIdSelector, getMobileNumberSelector |
| Reuse Services | verifyPanEKYCServiceAction |
```

### 7) Scope (optional, high impact)

Purpose:
- Explicitly constrain implementation.

Fill:
```md
### Exclude
- GST consent stagger (SP customer journey only, separate component)
- Agent-assisted flow (separate AgentDetails stagger)

### Feature Flags
- ENABLE_EKYC_VID_SUPPORT

### Permissions
- EKYC_ALLOWED
```

### 8) Analytics (optional)

Purpose:
- Define tracking behavior.

Fill:
```md
| Event Name | Trigger | Properties |
|---|---|---|
| EKYC_SUBMITTED | verify button click | inputType (AADHAAR/VID), hasPanPrefilled (bool) |
| OTP_VERIFIED | OTP submit success | isEtb (bool), cifCount (int) |
```

## Fast filling checklist

Before sharing the spec:
- Metadata complete
- API blocks added for each backend call
- Variant table includes all important states
- Validation and conditional behavior captured
- Navigation entry/exits defined (if route impacted)
- Scope exclusions/flags/permissions added if applicable

## Good defaults for small enhancements

For a small enhancement, usually enough:
- Metadata
- One API block (if needed)
- Variant table (if needed)
- Validation rules table (if form field)
- Exit route table (if submit/cancel behavior)

## Where to see examples

- [Small enhancement Markdown example](examples/enhancement-add-vid-support/feature.spec.md)
- [Large feature Markdown example](examples/feature-ekyc-verification/feature.spec.md)
