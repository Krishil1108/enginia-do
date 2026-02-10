# MOM Template Setup

## Creating the Word Template

You need to create a Word document template named `mom-template.docx` in this directory.

### Template Placeholders

Use the following placeholders in your Word document. They will be replaced with actual data:

#### Basic Fields:
- `{companyName}` - Company name
- `{visitDate}` - Date of visit
- `{location}` - Meeting location
- `{date}` - Document creation date

#### Attendees (Loop):
```
{#attendees}
- {name}
{/attendees}
```

#### Discussion Points (Loop):
```
{#discussionPoints}
{point}
{/discussionPoints}
```

Or for a table format:
```
| Sr. No. | Discussion Point |
|---------|-----------------|
{#discussionPoints}
| {#.} | {point} |
{/discussionPoints}
```

#### Images (Loop):
```
{#images}
{%image}
{/images}
```

### Sample Template Structure:

```
[Company Logo]

MINUTES OF MEETING

Company: {companyName}
Visit Date: {visitDate}
Location: {location}
Date: {date}

ATTENDEES:
{#attendees}
- {name}
{/attendees}

DISCUSSION POINTS:

{#discussionPoints}
{point}

{/discussionPoints}

IMAGES:
{#images}
{%image}
{/images}

---
[Footer]
```

### Instructions:

1. Create a new Word document
2. Add your company header/logo
3. Insert the placeholders where you want the data to appear
4. Format the document as desired (fonts, colors, spacing)
5. Save as `mom-template.docx` in this directory

### Notes:
- Use `{#field}...{/field}` for loops (arrays)
- Use `{field}` for simple text replacement
- Use `{%image}` for image insertion
- The template supports tables, formatting, and styles
