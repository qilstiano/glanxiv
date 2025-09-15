
<img width="320" height="160" alt="glanxiv_highres" src="https://github.com/user-attachments/assets/ab35d0ca-0c38-4a09-b9b4-23f9a9928eba" />

a modern ui wrapper for arXiv that i built because i got bored of the default interface and have been using arxiv a lot recently for research. wanted something cleaner and more enjoyable to browse papers with.

## what it does

- presents arxiv papers in a clean, card-based ui
- includes an integrated pdf viewer with dark mode
- organizes papers by category with visual tags
- responsive design that works on desktop and mobile

## what's coming

- ai-generated summaries of papers/highlights (because who reads the whole thing)
- keyword tagging and searching 
- social features to share and discuss papers with others [to-do]
- better search and filtering options [done]
- personal library to save papers across sessions [to-do]
- more categories to be supported [done]
- auth and db integration [to-do]
- recommendation algo for your favourite categories
- MORE SCRAPING!!!!! (thank you arXiv for making your API publicly accessible i promise to use it responsibly :>) [in-progress]
- status monitoring [to-do]
- publicly available API endpoints for generating paper summaries on the fly

## technical stuff

built with react, typescript, and chakra ui. uses the arxiv api to fetch papers and react-pdf-viewer for pdf rendering.

uses Github actions to scrape and update repository of arXiv papers. 

currently deployed on Vercel.

---

*made out of boredom, love and a need for more modern research readers, shoutout to deepseek*
