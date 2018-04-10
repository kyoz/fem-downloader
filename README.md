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
- **s ( skip )**: To skip video. Default: 0
- **f ( format )**: Video format types ( webm or mp4 ). Default: 'webm'
- **r ( resolution )**: Resolution of video ( 720 or 1080 ). Default: '1080'
- **d ( dest )**: Destination download folder. (Default download folder is in 'Downloaded' in this project folder')

ex.
```bash
  # Skip 3 videos, start download at fourth video
  node index -u banminkyoz@gmail.com -p 123456 -c [slugName] --s 3 
  # Set format type and resolution
  node index -u banminkyoz@gmail.com -p 123456 -c [slugName] --f mp4 --r 720
  # Download to a specific folder
  node index -u banminkyoz@gmail.com -p 123456 -d '/Users/Kyoz/Downloads'
```
