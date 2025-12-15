# LeukemiaLens Project Roadmap

## 🚀 Immediate To-Do
- [ ] **UI Polish**: Incorporate the new banner image (`LL-logo-banner.png`) into the header.
- [ ] **Bug Fix**: Advanced search filters (Author, Journal, Institution) are currently placeholders in the UI and need backend support.
- [ ] **Bug Fix**: Export functionality results in a '404 Not Found' error. This is likely due to the frontend pointing to the production Worker URL while running locally, or the Worker code not being deployed yet.

## 🎨 Design & UX
### Filter Experience Redesign
**Current State**: Sidebar with lists.
**Problem**: Cluttered, sidebar "floats" the concept but isn't scalable.
**Goal**: A redesigned filter selection experience that is a key differentiator.
**Ideas**:
- Faceted search on top?
- Modal for advanced filtering?
- Natural language query builder?

## 🔮 Future Features
- **Data Expansion**: Parse more fields from XML.
- **Analytics Dashboard**: Visualizing trends in leukemia research over time.
- **Data Expansion**: Review schema for expansion to include links to resources that would be valuable in an export, such as PDFs, images, and other resources.
