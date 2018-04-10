# Fem Downloader 
Minimal Downloader for frontendmasters.com's courses

# Install 

```bash
  # Clone Repo
  git clone git@github.com:banminkyoz/fem-downloader
  # Install packages
  npm i
```

# Usage

```bash
  # Download
  node index -u [username/email] -p [password] -c [slugName]
```

# Custom Usage

You can use these arguments to custom your download:
- **skip**: To skip video. Default: 0
- **format**: Video format types ( webm or mp4 ). Default: 'webm'
- **resolution**: Resolution of video ( 720 or 1080 ). Default: '1080'

ex.
```bash
  # Skip 3 videos, start download at fourth video
  node index -u [username/email] -p [password] -c [slugName] --skip 3 
  # Set format type and resolution
  node index -u [username/email] -p [password] -c [slugName] --format mp4 --resolution 720 
```
