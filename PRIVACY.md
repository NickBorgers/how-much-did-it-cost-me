# Privacy & Security

## Your Data Stays With You

**This application never sends your financial information to any server.** All processing happens entirely in your browser.

### How It Works

1. **No Server-Side Processing**: This is a static website hosted on GitHub Pages. There is no backend server, database, or API that receives your data.

2. **Local Storage Only**: When you enter your income, it is saved to your browser's `localStorage` - a storage mechanism that exists only on your device. This data:
   - Never leaves your computer
   - Is not transmitted over the network
   - Cannot be accessed by the website's hosting provider (GitHub)
   - Cannot be accessed by other websites

3. **No Analytics or Tracking**: This site does not use Google Analytics, Facebook Pixel, or any other tracking services.

4. **No Cookies**: This application does not set any cookies.

5. **No External Requests**: The application makes zero network requests after the initial page load. You can verify this by opening your browser's Developer Tools (F12) and checking the Network tab.

### What Data Is Stored Locally

The following is saved to your browser's localStorage (viewable at `localStorage.getItem('howMuchDidItCostMe')`):

- Your input mode preference (income vs. direct tax entry)
- Your filing status (single or married filing jointly)
- Your income amount
- Your direct tax amount (if entered)
- Timestamp of your last visit

### Clearing Your Data

You can clear your saved data at any time by:
- Clicking "Start Over" in the application
- Clearing your browser's localStorage for this site
- Using your browser's "Clear browsing data" feature

### Open Source

This application is fully open source. You can:
- **View the code**: [GitHub Repository](https://github.com/NickBorgers/how-much-did-it-cost-me)
- **Verify these claims**: Review `js/storage.js` and `js/app.js` to confirm no network requests are made
- **Run it locally**: Clone the repo and open `index.html` in your browser
- **Contribute**: Submit issues or pull requests

### Technical Details

| Aspect | Implementation |
|--------|----------------|
| Hosting | GitHub Pages (static files only) |
| Data Storage | Browser localStorage |
| Network Requests | None (after initial page load) |
| Third-Party Scripts | None |
| Cookies | None |
| Server-Side Code | None |

### Questions?

If you have questions about privacy or security, please [open an issue](https://github.com/NickBorgers/how-much-did-it-cost-me/issues) on GitHub.
