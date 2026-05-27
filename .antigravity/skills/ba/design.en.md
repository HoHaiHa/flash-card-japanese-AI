---
name: ba:design
description: >
  Analyze user interface designs (UI Mockups, screenshots) to generate screen structure specifications.
  Triggers when: user says "analyze design", "read mockup", "UI analysis", or types /ba:design.
---

# /ba:design
**Role**: Business Analyst / UI-UX Engineer  
**Purpose**: Analyze user interface design images/mockups and automatically generate detailed screen descriptions based on the `templates/baseline-screen.md` template to serve as Screen Specifications for developers.

---

## Instructions

### Step 1 — Gate: Receive design image

```javascript
question({
  questions: [{
    question: "Have you saved the design image in the project directory?",
    header: "Design Image",
    options: [
      { label: "Saved", description: "Image is saved and path is available" },
      { label: "Not Saved", description: "Need instructions on where to save it" }
    ]
  }]
})
```

*If user selects "Not Saved"*: Guide them to take a screenshot or export from Figma, save it to the project directory (recommended: `docs/screens/assets/`), and provide the path.

If saved, ask the user to provide the **absolute or relative path** to the image file (e.g., `docs/screens/assets/login_page.png`).

---

### Step 2 — Read and Analyze Design (Vision analysis)

Use the `view_file` tool to open and view the design image directly. Perform interface analysis across the following dimensions:
- **Layout & Layout Structure**: Layout organization (Header, Sidebar, Main Content, Footer, Grid/Flexbox structures).
- **UI Components**: List of buttons, icons, lists, tables, navigation tabs.
- **Form Fields (if any)**: Inputs, data types, validation rules visible on the design (e.g., red asterisks).
- **States**: UI states represented in the design (Hover, Active, Disabled, Loading).
- **Expected API Endpoints**: Endpoints that need to be connected based on the data displayed.

Display the detailed analysis report to the user for review.

---

### Step 3 — Gate: Confirm analysis results

```javascript
question({
  questions: [{
    question: "Is the initial design analysis correct?",
    header: "Confirm",
    options: [
      { label: "Correct", description: "Proceed to generate screen specification document" },
      { label: "Needs edits", description: "I want to adjust the analysis details" }
    ]
  }]
})
```

*If user selects "Needs edits"*: Receive edit feedback and update the analysis in Step 2.

---

### Step 4 — Draft Screen Specification Document

Load and fill in the details into the `templates/baseline-screen.md` template to create a new screen specification file at:
`docs/screens/[feature-name]/[screen-name].md`

Required details to fill in:
- Expected Route/URL.
- Detailed Layout & components list.
- Business rules derived from the UI.
- UI States (Loading, Empty, Success, Error).
- Expected API calls.

---

### Step 5 — Gate: Complete

```javascript
question({
  questions: [{
    question: "Confirm screen document is complete?",
    header: "Complete",
    options: [
      { label: "Complete", description: "Complete the design analysis task" }
    ]
  }]
})
```
