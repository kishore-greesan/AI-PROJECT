# Important: Pre-commit Secret Check
This repository has a pre-commit hook that checks for secrets and sensitive information in your code

## Prerequisites

The secret detector can scan ANY type of file (Python, Java, Config files, etc.), but needs **Node.js** to run so,
Install Node.js v18+ from [nodejs.org](https://nodejs.org)

⚠️ **REQUIRED**: One-time Setup - Run the below command after cloning the repository:

```bash
npm install
```

## Why is Secret Detection Important?

- The hook prevents accidental commits of secrets, API keys, and credentials
- It works with all programming languages and file types
- **Your commits will fail if you don't install the required npm packages**

## What Happens When a Secret is Detected?

When the pre-commit hook detects a potential secret or sensitive information, you'll see an error like this:

![image](https://github.com/user-attachments/assets/620a81c1-4654-4386-9595-28be2e87213d)

The error will show:
- The file containing the potential secret
- The line number where it was found
- The type of secret detected (API key, password, token, etc.)

## For Non-Node.js Developers

Even if you're not working with Node.js/JavaScript:
1. Make sure you have Node.js(v18 or more) installed (download from [nodejs.org](https://nodejs.org))
2. Run `npm install` once in the repository root after cloning
3. Continue using your preferred programming language

The secret check will run automatically before each commit after the initial setup.



