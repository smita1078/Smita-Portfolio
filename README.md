# Portfolio Website

A modern, responsive portfolio website with custom animations, GitHub integration, and interactive UI elements.

## 📁 Directory Structure

```
portfolio/
│
├── index.html                  # Main HTML file
├── README.md                   # Documentation
│
├── assets/
│   ├── css/
│   │   ├── main.css           # Core styles and components
│   │   ├── animations.css     # Animation keyframes
│   │   └── responsive.css     # Media queries
│   │
│   ├── js/
│   │   ├── main.js            # General functionality
│   │   ├── cursor.js          # Custom cursor
│   │   └── github.js          # GitHub API integration
│   │
│   └── images/
│       └── Smita.jpg          # Profile image
│
└── files/
    └── RESUME_SMITA_PRAJAPATI.pdf
```

## 🚀 Features

- **Custom Cursor**: Smooth, animated cursor with follower effect
- **Grain Texture**: Subtle animated grain overlay
- **GitHub Integration**: Live stats, commits, and contribution graph
- **Smooth Animations**: Intersection Observer for scroll-triggered animations
- **Responsive Design**: Optimized for all devices
- **Modern UI**: Glassmorphism, gradients, and hover effects

## 🛠️ Technology Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Custom properties, animations, flexbox, grid
- **JavaScript (ES6+)**: Modern JavaScript features
- **GitHub API**: RESTful API for fetching user data
- **Intersection Observer API**: Scroll-triggered animations
- **Google Fonts**: Typography
- **Font Awesome**: Icon library (via CDN)

## 📸 Screenshots

### Desktop View

![Desktop Screenshot](assets/images/screenshots/desktop.png)

### Mobile View

![Mobile Screenshot](assets/images/screenshots/mobile.png)

### Dark Mode

![Dark Mode](assets/images/screenshots/dark-mode.png)

*Note: Add screenshots to `assets/images/screenshots/` directory*

## 🛠️ Setup Instructions

### 1. Download/Clone the Repository

```bash
git clone <repository-url>
cd portfolio
```

### 2. Add Your Content

#### a. Profile Image
- Place your image in `assets/images/Smita.jpg`
- Recommended size: 600x800px (3:4 aspect ratio)

#### b. Resume
- Add your resume to `files/RESUME_SMITA_PRAJAPATI.pdf`

### 3. Configure GitHub Integration

Edit `assets/js/github.js` (line 8):

```javascript
const GITHUB_TOKEN = 'your_github_token_here';
const USERNAME = 'your_github_username';
```

**To get a GitHub token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `public_repo`, `read:user`
4. Copy and paste the token

### 4. Customize Content

Edit `index.html` to update:
- Personal information
- Projects
- Skills
- Experience
- Achievements
- Contact links

### 5. Open in Browser

Simply open `index.html` in your browser. No build process required!

```bash
# Or use a local server
python -m http.server 8000
# Then visit http://localhost:8000
```

## 🌍 Deployment

### GitHub Pages

1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Select source: `main` branch
4. Your site will be live at `https://username.github.io/repository-name`

### Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Drag and drop your portfolio folder
3. Your site will be live instantly

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts

### Other Options

- **Surge.sh**: `surge` command after installation
- **Firebase Hosting**: Use Firebase CLI
- **AWS S3 + CloudFront**: Static site hosting

## 🎨 Customization

### Colors

Edit CSS variables in `assets/css/main.css`:

```css
:root {
    --bg: #050505;          /* Background */
    --text: #ffffff;        /* Text color */
    --text-dim: #888888;    /* Dimmed text */
    --accent: #00ff88;      /* Primary accent */
    --accent2: #0088ff;     /* Secondary accent */
    --accent3: #ff0088;     /* Tertiary accent */
}
```

### Fonts

Change fonts in `index.html` (in the `<head>` section):

```html
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap" rel="stylesheet">
```

Then update in `assets/css/main.css`:

```css
body {
    font-family: 'YOUR_FONT', sans-serif;
}
```

## 📱 Responsive Breakpoints

- **Desktop**: 1600px+
- **Laptop**: 968px - 1600px
- **Tablet**: 768px - 968px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

## ⚡ Performance Tips

1. **Optimize Images**:
    - Compress images before uploading
    - Use WebP format for better compression
    - Keep profile image under 500KB

2. **GitHub API**:
    - Use a token to avoid rate limits (60 req/hr without, 5000 with)
    - Consider caching GitHub data locally

3. **Lazy Loading**:
    - Already implemented for images
    - Add `loading="lazy"` to additional images

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📝 Sections Overview

### Hero Section
- Animated title with gradient
- Status badge
- CTA buttons
- Scroll indicator

### About Section
- Profile image with hover effect
- Bio text with highlighted keywords

### Education Section
- Educational background cards
- Hover animations

### Projects/Work Section
- Featured projects with tags
- External links
- Hover effects

### Skills Section
- Skill cards with icons
- Hover animations

### Experience Section
- Timeline layout
- Work history with impact points

### Achievements Section
- Achievement cards with icons

### GitHub Section
- Live stats (repos, PRs)
- Latest commits
- Contribution graph
- Activity chart

### Contact Section
- Social links
- Email contact

## 🐛 Troubleshooting

### GitHub Data Not Loading

1. Check if token is valid
2. Verify username is correct
3. Check browser console for errors
4. Ensure you have internet connection

### Cursor Not Visible

- Check if JavaScript is enabled
- Verify cursor.js is loaded properly
- Some browsers may block custom cursors

### Animations Not Working

- Ensure animations.css is loaded
- Check if Intersection Observer is supported
- Verify JavaScript is enabled
- Try disabling browser extensions that might block animations
- Check browser console for JavaScript errors

### Images Not Loading

- Verify image paths are correct
- Check file names match exactly (case-sensitive)
- Ensure images are in the correct directory
- Clear browser cache

### Styles Not Applying

- Clear browser cache (Ctrl+Shift+Delete)
- Check if CSS files are linked correctly in HTML
- Verify CSS syntax is valid
- Check browser developer tools for CSS errors

### Mobile Layout Issues

- Ensure viewport meta tag is present
- Test on actual devices (not just browser dev tools)
- Check responsive.css media queries
- Verify touch targets are at least 44x44px

## 🚧 Future Improvements

- [ ] Add dark/light mode toggle
- [ ] Implement blog section
- [ ] Add testimonials/recommendations
- [ ] Integrate contact form with backend
- [ ] Add PWA support for offline access
- [ ] Implement multi-language support
- [ ] Add 3D animations using Three.js
- [ ] Integrate LinkedIn API for recommendations
- [ ] Add speaking engagements section
- [ ] Implement search functionality
- [ ] Add print-friendly resume view
- [ ] Integrate analytics (Google Analytics)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Credits & Acknowledgments

- **Design Inspiration**: Modern portfolio design trends
- **Icons**: Font Awesome
- **Fonts**: Google Fonts
- **GitHub API**: GitHub REST API
- **Browser APIs**: Intersection Observer API

## 🤝 Contributing

Feel free to fork, modify, and use this template for your own portfolio!

---

**Made with ❤️ by Smita Prajapati**