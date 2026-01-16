# Lulu Book Creation Guide

## Overview
This guide provides specifications and requirements for creating print-ready books for Lulu's print-on-demand service.

## File Requirements

### Interior File
- **Format**: PDF
- **Layout**: Single page, portrait oriented
- **Content**: Must contain ALL book contents (excluding cover)
- **Fonts**: All fonts must be embedded
- **Images**: 
  - Minimum 300 PPI resolution
  - Maximum 600 PPI resolution
  - Vector images must be rasterized
- **Layers**: Transparent layers and vector objects must be flattened
- **Security**: Do NOT use password/security protection

### Cover File
- **Format**: PDF
- **Layout**: Single page integrated spread (back cover, spine, front cover)
- **Fonts**: All fonts must be embedded
- **Images**: 
  - Minimum 300 PPI resolution
  - Maximum 600 PPI resolution
  - Vector images must be rasterized
- **Layers**: Transparent layers and vector objects must be flattened
- **Security**: Do NOT use password/security protection

## Book Specifications

### Minimum Page Counts
- **Paperback**: 32 pages minimum
- **Hardcover**: 24 pages minimum
- **Coil Bound**: Varies by size
- **Saddle Stitch**: Varies by size

### Available Trim Sizes

| Trim Name | Trim Size (inches) | Trim Size (mm) |
|-----------|-------------------|----------------|
| Pocketbook | 4.25 x 6.875 | 108 x 175 |
| Digest | 5.5 x 8.5 | 140 x 216 |
| A5 | 5.83 x 8.27 | 148 x 210 |
| Royal | 6.14 x 9.21 | 156 x 234 |
| US Trade | 6 x 9 | 152 x 229 |
| Comic Book | 6.63 x 10.25 | 168 x 260 |
| Executive | 7 x 10 | 178 x 254 |
| Crown Quarto | 7.44 x 9.68 | 189 x 246 |
| Small Square | 7.5 x 7.5 | 191 x 191 |
| A4 | 8.27 x 11.69 | 210 x 297 |
| Square | 8.5 x 8.5 | 216 x 216 |
| US Letter | 8.5 x 11 | 216 x 279 |
| Small Landscape | 9 x 7 | 229 x 178 |
| US Letter Landscape | 11 x 8.5 | 279 x 216 |
| A4 Landscape | 11.69 x 8.27 | 210 x 297 |
| Calendar | 11 x 8.5 | 279 x 216 |

## Paper and Ink Options

### Paper Types
- **60# Uncoated White**: Ideal for text-heavy books (novels, nonfiction, memoir)
- **60# Uncoated Cream**: Ideal for text-heavy books with a warmer tone
- **80# Coated White**: Best for high-quality images and graphics

### Ink Options
- **Standard Black & White**: For text-heavy books
- **Premium Black & White**: High contrast grayscale images
- **Standard Color**: Colored fonts, charts, graphs, small photos
- **Premium Color**: High-resolution photos and full bleed coverage

### Recommended Combinations
- **Novels/Memoirs**: 60# Uncoated (White or Cream) with Standard B&W
- **Grayscale Images**: 80# Coated White with Premium B&W
- **Standard Color**: 60# Uncoated White with Standard Color
- **Photo Books**: 80# Coated White with Premium Color

## Margins and Spacing

### Bleed Margin
- **Required**: 0.125 in (3.175 mm) on all sides
- **Purpose**: Allows for trimming variance
- **When Required**: When graphics or content extend to page edge

### Safety Margin
- **Recommended**: 0.5 in (12.7 mm) from trim edge
- **Purpose**: Ensures text/important content isn't cut during trimming

### Gutter (Interior Only)

| Page Count | Add to Inside Margin | Recommended Total Inside Margin |
|------------|---------------------|--------------------------------|
| Less than 60 | 0 in (0 mm) | 0.5 in (13 mm) |
| 61 to 150 | 0.125 in (3 mm) | 0.625 in (16 mm) |
| 151 to 400 | 0.5 in (13 mm) | 1 in (25 mm) |
| 400 to 600 | 0.625 in (16 mm) | 1.125 in (29 mm) |
| Over 600 | 0.75 in (19 mm) | 1.25 in (32 mm) |

**Note**: Gutter only applies to Paperback and Hardcover books, not Coil Bound or Saddle Stitch.

## Interior File Dimensions

### Without Bleed (Text Only Books)
Use the trim size as your page size. Lulu will automatically add bleed.

### With Bleed (Books with Graphics to Edge)

| Trim Name | No Bleed Size | With Bleed Size |
|-----------|---------------|-----------------|
| Pocketbook | 4.25 x 6.875 in | 4.5 x 7.125 in |
| Digest | 5.5 x 8.5 in | 5.75 x 8.75 in |
| A5 | 5.83 x 8.27 in | 6.08 x 8.52 in |
| Royal | 6.14 x 9.21 in | 6.39 x 9.46 in |
| US Trade | 6 x 9 in | 6.25 x 9.25 in |
| Comic Book | 6.63 x 10.25 in | 6.88 x 10.5 in |
| Executive | 7 x 10 in | 7.25 x 10.25 in |
| Crown Quarto | 7.44 x 9.68 in | 7.69 x 9.93 in |
| Small Square | 7.5 x 7.5 in | 7.75 x 7.75 in |
| A4 | 8.27 x 11.69 in | 8.52 x 11.94 in |
| Square | 8.5 x 8.5 in | 8.75 x 8.75 in |
| US Letter | 8.5 x 11 in | 8.75 x 11.25 in |
| Small Landscape | 9 x 7 in | 9.25 x 7.25 in |
| US Letter Landscape | 11 x 8.5 in | 11.25 x 8.75 in |
| A4 Landscape | 11.69 x 8.27 in | 11.94 x 8.52 in |
| Calendar | 11 x 8.5 in | 11.25 x 8.75 in |

## Spine Width Calculation

### Paperback Books
**Formula**:
- **Inches**: (Number of Pages / 444) + 0.06
- **Millimeters**: (Number of Pages / 17.48) + 1.524

### Hardcover Books
Use lookup table (see JSON file for complete table)

**Important Spine Guidelines**:
1. For books 80 pages or fewer: **Do NOT include spine text**
2. Leave at least 0.125 in (3.175 mm) between spine text and edge
3. Keep spine same color/graphic as rest of cover to minimize variance issues

## Color Space

### RGB vs CMYK
- **RGB**: Used for screen display (additive color)
- **CMYK**: Used for printing (subtractive color)

### Lulu's Recommendation
- Start with **RGB** if creating from scratch
- Use **sRGB IEC61966-2.1** color profile
- If already in CMYK, keep it in CMYK
- Don't convert back and forth

### Lulu Printer Color Profiles
- **RGB**: sRGB IEC61966-2.1
- **CMYK**: Coated GRACoL 2006

### Color Guidelines
1. Set up document as RGB file
2. Use sRGB color space for RGB images
3. If using CMYK, don't switch back to RGB
4. Solid blacks print at 100% with no other colors
5. Total Area Coverage (TAC) should not exceed 270%
6. Avoid light colors (20% or less) - difficult to control
7. Black & white images should use grayscale color space
8. Grayscale gamma value: 2.2 to 2.4
9. Use Premium Color ink + 80# White paper for heavy ink coverage

## Image Resolution

| Resolution | Best Use |
|------------|----------|
| 300 PPI | Ideal for complex/detailed graphics for print |
| 150 PPI | Minimum for simple graphics for print |
| 72 PPI | Digital/screen display only (not suitable for print) |

## Software Recommendations

### For Simple Designs
- **Microsoft Word**: Novels, memoirs, poetry

### For Complex Projects
- **Adobe InDesign**: Photo books, workbooks, textbooks
- **Adobe Photoshop**: Cover design
- **Affinity Publisher**: Alternative to InDesign

## Text and Styling Best Practices

1. Use **Styles** for consistent formatting
2. Use **Page Breaks** to control content placement
3. Avoid inline formatting (hard returns, paragraph breaks)
4. These prevent content shift when exporting to PDF

## Trimming and Variance

### Trimming Tolerance
- **0.125 in (3.175 mm)** toward front and back cover

### How to Account for Variance
1. Extend background images to bleed edge
2. Keep text and important elements within safety margin
3. Design spine to minimize variance issues
4. Wrap spine color/graphic onto front and back covers

## Proofing Recommendations

### Before Publishing
1. Download and review print-ready files
2. Order a single proof copy

### Common Issues to Check
- **Human Error**: Typos, formatting inconsistencies
- **File Error**: Low resolution images, transparencies, unembedded fonts
- **Printing Variance**: Spine alignment, cut-off content

## Export Settings

### Using Lulu's Job Options Files
Lulu provides .joboptions files for Adobe products that apply optimal settings.

**Installation**:
- **Adobe InDesign**: File > Adobe PDF Presets > Define > Load
- **Adobe Photoshop**: Edit > Adobe PDF Presets > Load
- **Adobe Acrobat Distiller**: Settings > Add Adobe PDF Settings

## Cover Design Guidelines

### Cover Options
1. **Lulu Generated Cover**: Quick template-based cover
2. **Custom Cover**: Upload your own designed cover

### Cover Template
- Available after uploading interior file
- Includes exact spine width for your book
- Single page spread format (back, spine, front)

### Design Tips
1. Extend graphics to bleed edge (0.125 in / 3.175 mm past trim)
2. Keep text within safety margin (0.5 in / 12.7 mm from edge)
3. Leave space around spine text for variance
4. If spine differs in color, wrap that color onto front/back covers

## File Naming
- Use descriptive, consistent naming
- Avoid special characters
- Example: `BookTitle_Interior_v1.pdf`, `BookTitle_Cover_v1.pdf`

## Final Checklist

### Interior File
- [ ] Single page PDF
- [ ] All fonts embedded
- [ ] Images 300-600 PPI
- [ ] Proper margins (safety, gutter, bleed)
- [ ] No security/password protection
- [ ] Correct page size for trim size
- [ ] All pages included (title, copyright, blank pages)

### Cover File
- [ ] Single spread PDF
- [ ] All fonts embedded
- [ ] Images 300-600 PPI
- [ ] Correct spine width
- [ ] 0.125 in bleed on all sides
- [ ] 0.5 in safety margin
- [ ] No security/password protection
- [ ] Spine text considerations (if applicable)

## Additional Resources

### Lulu Resources
- Design bundles available on product page
- Video tutorials on YouTube
- Support documentation at support.lulu.com
