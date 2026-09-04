# Portfolio Website

A modern, responsive portfolio website with custom animations, GitHub integration, and interactive UI elements.

## 📁 Directory Structure

```
portfolio/
│
├── index.html                  # Main portfolio page
├── resume.html                 # Resume page
├── README.md                   # Documentation
├── LICENSE                     # MIT License
├── package.json                # Project metadata
├── netlify.toml                # Netlify configuration
│
├── assets/
│   ├── css/
│   │   ├── main.css           # Core styles and components
│   │   ├── animations.css     # Animation keyframes
│   │   ├── responsive.css     # Media queries
│   │   ├── resume.css         # Resume-specific styles
│   │   ├── gsoc-3d.css        # GSOC 3D effects
│   │   └── section-flyby.css  # Section flyby animations
│   │
│   ├── js/
│   │   ├── main.js            # General functionality
│   │   ├── cursor.js          # Custom cursor
│   │   ├── github.js          # GitHub API integration
│   │   ├── anime-animations.js # Anime.js animations
│   │   ├── resume.js          # Resume page functionality
│   │   └── section-flyby.js   # Section flyby effects
│   │
│   └── images/
│       └── Smita.jpg          # Profile image
│
├── files/
│   ├── RESUME_SMITA_PRAJAPATI.pdf
│   └── RESUME_SMITA_PRAJAPATI_ADE.docx
│
└── netlify/
    └── functions/             # Netlify serverless functions
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

Edit CSS variables in `assets/css/main.css` to customize colors and fonts.


## 🐛 Troubleshooting

- **GitHub Data Not Loading**: Check token validity, username, and internet connection
- **Cursor Not Visible**: Ensure JavaScript is enabled and cursor.js is loaded
- **Animations Not Working**: Verify animations.css is loaded and check browser console for errors


## 📝 Blog/Medium Integration

This portfolio includes integration with Medium for displaying your blog posts.

### Setup

1. **Get your Medium RSS Feed**:
   - Go to your Medium profile
   - Your RSS feed is at: `https://medium.com/feed/@yourusername`

2. **Configure in JavaScript**:
   Edit `assets/js/main.js` to add your Medium username:
   ```javascript
   const MEDIUM_USERNAME = 'your_medium_username';
   ```

3. **Display Blog Posts**:
   The blog section will automatically fetch and display your latest Medium posts.

### Customization

- **Number of posts**: Change the limit in the fetch function
- **Styling**: Modify blog card styles in `assets/css/main.css`
- **Layout**: Adjust the grid layout in the blog section HTML

### Alternative: RSS to JSON API

If you need to convert RSS to JSON, use a service like:
- `https://api.rss2json.com/v1/api.json?rss_url=` + your RSS URL

This allows easier parsing and display of blog posts.

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