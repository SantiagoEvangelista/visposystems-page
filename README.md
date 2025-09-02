# Vispo Black Box Website

## Overview
The Vispo Black Box website is a static front-end project that showcases the Vispo Black Box product, a compact RF multi-tool designed for modern electronic warfare. The website consists of two main pages: a landing page and a contact page.

## Project Structure
```
vispo-blackbox-site
├── index.html        # Landing page with product features and use cases
├── contact.html      # Contact page with company information and a contact form
├── assets            # Directory containing images and videos
│   ├── vispo-blackbox.png  # Product image
│   ├── usecase1.mp4        # Video demonstrating use case 1
│   ├── usecase2.mp4        # Video demonstrating use case 2
│   ├── usecase3.mp4        # Video demonstrating use case 3
│   └── usecase4.mp4        # Video demonstrating use case 4
├── css               # Directory containing stylesheets
│   └── styles.css    # Styles for the website
├── js                # Directory containing JavaScript files
│   └── app.js        # JavaScript functionality for the website
└── README.md         # Documentation for the project
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the `index.html` file in a web browser to view the landing page.
3. Navigate to the `contact.html` file to access the contact form.

## Customization
- Replace the placeholder product image located at `assets/vispo-blackbox.png` with your actual product image.
- Update the video files in the `assets` directory with your own short muted clips for use cases. Ensure they are named `usecase1.mp4`, `usecase2.mp4`, `usecase3.mp4`, and `usecase4.mp4`.
- Modify the content in `index.html` and `contact.html` as needed to reflect your branding and messaging.

## Notes
- The contact form in `contact.html` uses a `mailto:` action, which opens the user's email client. For a more robust solution, consider integrating a hosted form endpoint.
- The website is designed to be responsive and should work well on various screen sizes.