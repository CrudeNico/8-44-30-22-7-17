import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mobile menu button HTML
const mobileMenuButton = `            <!-- # Mobile menu toggle button -->
            <button class="mobile-menu-toggle" aria-label="Toggle mobile menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
`;

// Mobile navigation HTML
const mobileNav = `        <!-- # Mobile Navigation Overlay -->
        <div class="mobile-nav-overlay"></div>
        <!-- # Mobile Navigation Menu -->
        <nav class="mobile-nav">
            <div class="mobile-nav-item">
                <button class="mobile-dropdown-toggle">Solutions</button>
                <div class="mobile-dropdown">
                    <a href="investment-calculator.html" class="mobile-dropdown-item">Investment Calculator</a>
                    <a href="crude-oil-strategy.html" class="mobile-dropdown-item">Crude Oil Strategy</a>
                    <a href="portfolio-models.html" class="mobile-dropdown-item">Portfolio Models</a>
                    <a href="risk-management.html" class="mobile-dropdown-item">Risk Management</a>
                    <a href="technology-execution.html" class="mobile-dropdown-item">Technology & Execution</a>
                </div>
            </div>
            <div class="mobile-nav-item">
                <button class="mobile-dropdown-toggle">Resources</button>
                <div class="mobile-dropdown">
                    <a href="learn.html" class="mobile-dropdown-item">Learn</a>
                    <a href="crude-oil-fundamentals.html" class="mobile-dropdown-item">Crude Oil Fundamentals</a>
                    <a href="macro-geopolitical-insights.html" class="mobile-dropdown-item">Macro & Geopolitical Insights</a>
                    <a href="technical-analysis-library.html" class="mobile-dropdown-item">Technical Analysis Library</a>
                    <a href="risk-expectations-guide.html" class="mobile-dropdown-item">Risk & Expectations Guide</a>
                </div>
            </div>
            <div class="mobile-nav-item">
                <button class="mobile-dropdown-toggle">Consultations</button>
                <div class="mobile-dropdown">
                    <a href="about-us.html" class="mobile-dropdown-item">About Us</a>
                    <a href="pricing-plans.html" class="mobile-dropdown-item">Pricing & Plans</a>
                    <a href="book-a-call.html" class="mobile-dropdown-item">Book a Call</a>
                    <a href="compliance-disclaimers.html" class="mobile-dropdown-item">Compliance & Disclaimers</a>
                    <a href="onboarding-procedure.html" class="mobile-dropdown-item">Onboarding Process</a>
                </div>
            </div>
            <div class="mobile-nav-item">
                <a href="login.html" class="mobile-nav-link">Log in</a>
            </div>
        </nav>
`;

// Files already updated (skip these)
const alreadyUpdated = ['index.html', 'learn.html', 'pricing-plans.html'];

// Get all HTML files
const files = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.html') && !alreadyUpdated.includes(file) && file !== 'mobile-menu-template.html');

console.log(`Found ${files.length} HTML files to update:`);
files.forEach(f => console.log(`  - ${f}`));

// Update each file
files.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if mobile menu already exists
    if (content.includes('mobile-menu-toggle')) {
        console.log(`  ⏭️  ${file} - Already has mobile menu, skipping`);
        return;
    }
    
    // Add mobile menu button after logo, before navigation
    const logoPattern = /(\s*<\/div>\s*<!-- # Company logo|<\/div>\s*<div class="logo">[\s\S]*?<\/div>\s*)(\s*<nav class="navigation">)/;
    if (logoPattern.test(content)) {
        content = content.replace(logoPattern, `$1${mobileMenuButton}$2`);
    } else {
        // Try alternative pattern
        const altPattern = /(\s*<\/div>\s*)(\s*<nav class="navigation">)/;
        if (altPattern.test(content)) {
            content = content.replace(altPattern, `$1${mobileMenuButton}$2`);
        } else {
            console.log(`  ⚠️  ${file} - Could not find insertion point for mobile button`);
        }
    }
    
    // Add mobile navigation before </header>
    const headerClosePattern = /(\s*<\/div>\s*)(\s*<\/header>)/;
    if (headerClosePattern.test(content)) {
        content = content.replace(headerClosePattern, `$1${mobileNav}$2`);
    } else {
        console.log(`  ⚠️  ${file} - Could not find insertion point for mobile nav`);
    }
    
    // Write updated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ ${file} - Updated successfully`);
});

console.log('\n✨ All files updated!');
console.log('\n📝 Next steps:');
console.log('  1. Test the mobile menu on a few pages');
console.log('  2. Make sure script.js is included in all pages');
console.log('  3. Test on actual mobile devices');

